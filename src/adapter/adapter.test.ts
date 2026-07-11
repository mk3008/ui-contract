import { describe, expect, expectTypeOf, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { contractCatalog } from '../contract/catalog'
import { defaultContract } from '../contract/defaults'
import type { UiContract } from '../contract/types'
import type { AdapterManifest, AdapterTarget } from './types'
import { createCompleteManifest, syntheticTarget } from './fixtures/complete-manifest'
import { deriveRequiredRules, validateAdapter } from './validate'

const clone = <T>(value: T): T => structuredClone(value)
const resultFor = (manifest: unknown, target: AdapterTarget = syntheticTarget) => validateAdapter(defaultContract, manifest, target)
const mappingFor = (manifest: AdapterManifest, catalogId: string) => manifest.mappings.find((mapping) => mapping.rule.catalogId === catalogId)!

describe('Phase 5 target-neutral Adapter validator', () => {
  it('uses an already validated UiContract API and never routes raw input through the Contract importer', () => {
    expectTypeOf(validateAdapter).parameter(0).toEqualTypeOf<UiContract>()
    const source = readFileSync(new URL('./validate.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/from\s+['"]\.\.\/contract\/import['"]/)
  })

  it('derives exactly one rule for every catalog decision and invariant, including non-persisted and persisted invariants', () => {
    const derived = deriveRequiredRules(defaultContract)
    expect(derived.diagnostics).toEqual([])
    expect(derived.rules).toHaveLength(contractCatalog.length)
    expect(derived.rules.find((rule) => rule.catalogId === 'visible-focus')).toMatchObject({ kind: 'invariant', contractPath: 'invariants.visibleFocus', statement: 'Keyboard focus must remain visible.', persistedValue: null })
    expect(derived.rules.find((rule) => rule.catalogId === 'loading-feedback')).toMatchObject({ kind: 'invariant', contractPath: 'interactionPolicy.loading.feedback', statement: 'Loading must visibly and programmatically communicate that the affected region is busy. Use skeletons only for structured content; use an inline indicator for a single processing action.', persistedValue: 'communicate-busy-state' })
  })

  it('accepts a complete compatible manifest without interpreting opaque references or mutating inputs', () => {
    const manifest = createCompleteManifest()
    const before = clone(manifest)
    const contractBefore = clone(defaultContract)
    expect(resultFor(manifest)).toMatchObject({ outcome: 'compatible', diagnostics: [] })
    expect(manifest).toEqual(before)
    expect(defaultContract).toEqual(contractBefore)
  })

  it('rejects missing, duplicate, stale, and unknown rules as Adapter-invalid', () => {
    const missing = createCompleteManifest()
    missing.mappings.pop()
    expect(resultFor(missing)).toMatchObject({ outcome: 'adapter-invalid' })
    expect(resultFor(missing).diagnostics.map((item) => item.code)).toContain('missing-rule')

    const duplicate = createCompleteManifest()
    duplicate.mappings.push(clone(duplicate.mappings[0]))
    expect(resultFor(duplicate).diagnostics.map((item) => item.code)).toContain('duplicate-rule')

    const stale = createCompleteManifest()
    const staleRule = mappingFor(stale, 'button-primary-emphasis').rule
    if (staleRule.kind === 'decision') staleRule.selectedValue = 'outline'
    expect(resultFor(stale).diagnostics.map((item) => item.code)).toContain('stale-rule')

    const unknown = createCompleteManifest()
    mappingFor(unknown, 'button-primary-emphasis').rule.catalogId = 'not-in-catalog'
    expect(resultFor(unknown).diagnostics.map((item) => item.code)).toContain('unknown-rule')
  })

  it('rejects malformed resolutions without resolving their opaque references', () => {
    const manifest = createCompleteManifest() as unknown as { mappings: Array<{ resolution: unknown }> }
    manifest.mappings[0].resolution = { kind: 'binding', implementationRef: '' }
    const result = resultFor(manifest)
    expect(result).toMatchObject({ outcome: 'adapter-invalid' })
    expect(result.diagnostics.map((item) => item.code)).toContain('mapping-resolution-invalid')
  })

  it('classifies exact Contract, Adapter specification, and target version mismatches separately', () => {
    const historicalContract = { ...defaultContract, schemaVersion: '0.2.0' } as unknown as UiContract
    expect(validateAdapter(historicalContract, createCompleteManifest(), syntheticTarget)).toMatchObject({ outcome: 'unsupported-contract-version', diagnostics: [{ stage: 'adapter', code: 'unsupported-contract-version' }] })

    const unknownSpec = createCompleteManifest() as unknown as { adapterSpecVersion: string }
    unknownSpec.adapterSpecVersion = '0.2.0'
    expect(resultFor(unknownSpec)).toMatchObject({ outcome: 'unsupported-adapter-spec-version', diagnostics: [{ stage: 'adapter', code: 'unsupported-adapter-spec-version' }] })

    expect(resultFor(createCompleteManifest(), { id: 'sample-target', version: '2026.08' })).toMatchObject({ outcome: 'unsupported-target-version', diagnostics: [{ stage: 'target', code: 'unsupported-target-version' }] })

    const unsupportedAcceptList = createCompleteManifest() as unknown as { acceptsContractSchemaVersions: string[] }
    unsupportedAcceptList.acceptsContractSchemaVersions = ['0.2.0']
    expect(resultFor(unsupportedAcceptList)).toMatchObject({ outcome: 'adapter-invalid', diagnostics: [{ stage: 'adapter', code: 'accepted-contract-version-invalid' }] })
  })

  it('rejects missing, orphaned, and duplicate exceptions', () => {
    const missing = createCompleteManifest()
    mappingFor(missing, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'missing-exception' }
    expect(resultFor(missing).diagnostics.map((item) => item.code)).toContain('missing-exception')

    const orphaned = createCompleteManifest()
    orphaned.exceptions.push({ id: 'orphan', catalogId: 'button-primary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    expect(resultFor(orphaned).diagnostics.map((item) => item.code)).toContain('orphaned-exception')

    const duplicate = createCompleteManifest()
    duplicate.exceptions.push({ id: 'duplicated', catalogId: 'button-primary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    mappingFor(duplicate, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'duplicated' }
    duplicate.exceptions.push(clone(duplicate.exceptions[0]))
    duplicate.exceptions[1].id = 'duplicated'
    expect(resultFor(duplicate).diagnostics.map((item) => item.code)).toContain('duplicate-exception')
  })

  it('classifies proposed, rejected, and human-approved exceptions and requires approval metadata', () => {
    const proposed = createCompleteManifest()
    proposed.exceptions.push({ id: 'gap', catalogId: 'button-primary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    mappingFor(proposed, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'gap' }
    expect(resultFor(proposed)).toMatchObject({ outcome: 'review-required' })

    const rejected = clone(proposed)
    rejected.exceptions[0].review.status = 'rejected'
    expect(resultFor(rejected)).toMatchObject({ outcome: 'incompatible' })

    const approved = clone(proposed)
    approved.exceptions[0].review = { status: 'approved', reviewer: 'human-reviewer', reviewedAt: '2026-07-11T10:00:00Z' }
    expect(resultFor(approved)).toMatchObject({ outcome: 'compatible-with-approved-exceptions' })

    const metadataMissing = clone(proposed)
    metadataMissing.exceptions[0].review.status = 'approved'
    expect(resultFor(metadataMissing).diagnostics.map((item) => item.code)).toContain('approved-exception-review-missing')
  })
})
