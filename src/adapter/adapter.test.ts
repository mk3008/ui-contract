import { describe, expect, expectTypeOf, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { contractCatalog } from '../contract/catalog'
import { defaultContract } from '../contract/defaults'
import type { UiContract } from '../contract/types'
import type { AdapterManifest, AdapterTarget } from './types'
import { supportedAdapterContractSchemaVersion } from './types'
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
    expect(derived.rules.find((rule) => rule.catalogId === 'choice-group-layout')).toMatchObject({ kind: 'decision', contractPath: 'designPolicy.choiceGroupLayout', selectedValue: 'stacked-default-with-constrained-inline' })
    expect(derived.rules.find((rule) => rule.catalogId === 'structural-consistency')).toMatchObject({ kind: 'invariant', contractPath: 'invariants.structuralConsistency', persistedValue: null })
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

  it('accepts a non-empty opaque satisfied-by-target evidence reference', () => {
    const manifest = createCompleteManifest()
    mappingFor(manifest, 'button-primary-emphasis').resolution = { kind: 'satisfied-by-target', evidenceRef: 'opaque-evidence-1' }
    expect(resultFor(manifest)).toMatchObject({ outcome: 'compatible', diagnostics: [] })
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
    const historicalContract = { ...defaultContract, schemaVersion: '0.5.0' } as unknown as UiContract
    expect(validateAdapter(historicalContract, createCompleteManifest(), syntheticTarget)).toMatchObject({ outcome: 'unsupported-contract-version', diagnostics: [{ stage: 'adapter', code: 'unsupported-contract-version' }] })

    const unknownSpec = createCompleteManifest() as unknown as { adapterSpecVersion: string }
    unknownSpec.adapterSpecVersion = '0.2.0'
    expect(resultFor(unknownSpec)).toMatchObject({ outcome: 'unsupported-adapter-spec-version', diagnostics: [{ stage: 'adapter', code: 'unsupported-adapter-spec-version' }] })

    expect(resultFor(createCompleteManifest(), { id: 'sample-target', version: '2026.08' })).toMatchObject({ outcome: 'unsupported-target-version', diagnostics: [{ stage: 'target', code: 'unsupported-target-version' }] })

    const unsupportedAcceptList = createCompleteManifest() as unknown as { acceptsContractSchemaVersions: string[] }
    unsupportedAcceptList.acceptsContractSchemaVersions = ['0.5.0']
    expect(resultFor(unsupportedAcceptList)).toMatchObject({ outcome: 'adapter-invalid', diagnostics: [{ stage: 'adapter', code: 'accepted-contract-version-invalid' }] })
    expect(createCompleteManifest().acceptsContractSchemaVersions).toEqual([supportedAdapterContractSchemaVersion])
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

  it('rejects exceptions referenced by more than one mapping and catalog identity mismatches', () => {
    const referencedTwice = createCompleteManifest()
    referencedTwice.exceptions.push({ id: 'shared-gap', catalogId: 'button-primary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    mappingFor(referencedTwice, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'shared-gap' }
    mappingFor(referencedTwice, 'button-secondary-emphasis').resolution = { kind: 'exception', exceptionId: 'shared-gap' }
    expect(resultFor(referencedTwice).diagnostics.map((item) => item.code)).toContain('duplicate-exception-reference')

    const mismatchedCatalog = createCompleteManifest()
    mismatchedCatalog.exceptions.push({ id: 'mismatched-gap', catalogId: 'button-secondary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    mappingFor(mismatchedCatalog, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'mismatched-gap' }
    expect(resultFor(mismatchedCatalog).diagnostics.map((item) => item.code)).toContain('exception-catalog-id-mismatch')

    const unknownCatalog = createCompleteManifest()
    unknownCatalog.exceptions.push({ id: 'unknown-catalog-gap', catalogId: 'not-in-catalog', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    mappingFor(unknownCatalog, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'unknown-catalog-gap' }
    expect(resultFor(unknownCatalog).diagnostics.map((item) => item.code)).toContain('exception-catalog-id-unknown')
  })

  it('rejects exceptions without each required ownership and impact field', () => {
    for (const field of ['rationale', 'impact', 'owner'] as const) {
      const manifest = createCompleteManifest()
      const exception = { id: `missing-${field}`, catalogId: 'button-primary-emphasis', kind: 'unsupported' as const, rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' as const } }
      exception[field] = ''
      manifest.exceptions.push(exception)
      mappingFor(manifest, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: exception.id }
      expect(resultFor(manifest).diagnostics.map((item) => item.code)).toContain('exception-shape-invalid')
    }
  })

  it('rejects invalid exception review statuses and optional review metadata', () => {
    const invalidStatus = createCompleteManifest()
    invalidStatus.exceptions.push({ id: 'invalid-status', catalogId: 'button-primary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    ;(invalidStatus.exceptions[0].review as unknown as { status: string }).status = 'waiting-for-human'
    mappingFor(invalidStatus, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: 'invalid-status' }
    const invalidStatusResult = resultFor(invalidStatus)
    expect(invalidStatusResult.diagnostics.map((item) => item.code)).toContain('exception-review-status-invalid')

    const invalidReviews: Array<{ status: 'proposed'; reviewer?: string; reviewedAt?: string }> = [{ status: 'proposed', reviewer: '' }, { status: 'proposed', reviewedAt: ' ' }]
    for (const review of invalidReviews) {
      const manifest = createCompleteManifest()
      manifest.exceptions.push({ id: `invalid-${Object.keys(review)[1]}`, catalogId: 'button-primary-emphasis', kind: 'unsupported', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review })
      mappingFor(manifest, 'button-primary-emphasis').resolution = { kind: 'exception', exceptionId: manifest.exceptions[0].id }
      expect(resultFor(manifest).diagnostics.map((item) => item.code)).toContain('exception-review-metadata-invalid')
    }
  })

  it('rejects a stale Contract rule even when the mapping resolves through an exception', () => {
    const manifest = createCompleteManifest()
    manifest.exceptions.push({ id: 'stale-gap', catalogId: 'button-primary-emphasis', kind: 'intentional-deviation', rationale: 'Known gap.', impact: 'Action styling differs.', owner: 'design-owner', review: { status: 'proposed' } })
    const mapping = mappingFor(manifest, 'button-primary-emphasis')
    mapping.resolution = { kind: 'exception', exceptionId: 'stale-gap' }
    if (mapping.rule.kind === 'decision') mapping.rule.selectedValue = 'outline'
    expect(resultFor(manifest).diagnostics.map((item) => item.code)).toContain('stale-rule')
  })

  it('does not mutate malformed Contract or manifest path inputs', () => {
    const malformedContract = clone(defaultContract) as unknown as { componentPolicy: { button: Record<string, unknown> } }
    delete malformedContract.componentPolicy.button.primaryEmphasis
    const contractBefore = clone(malformedContract)
    expect(validateAdapter(malformedContract as unknown as UiContract, createCompleteManifest(), syntheticTarget)).toMatchObject({ outcome: 'adapter-invalid' })
    expect(malformedContract).toEqual(contractBefore)

    const malformedManifest = createCompleteManifest()
    mappingFor(malformedManifest, 'button-primary-emphasis').rule.contractPath = 'componentPolicy.button.notAContractPath'
    const manifestBefore = clone(malformedManifest)
    const result = resultFor(malformedManifest)
    expect(result.diagnostics.map((item) => item.code)).toContain('contract-path-mismatch')
    expect(malformedManifest).toEqual(manifestBefore)
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
