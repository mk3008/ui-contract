import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contractCatalog } from '../contract/catalog'
import { defaultContract } from '../contract/defaults'
import { uiContractJsonSchema } from '../contract/schema'
import { importContract } from '../contract/import'
import {
  bundleManifestJsonSchema,
  compositionPatternJsonSchema,
  interactionScenarioJsonSchema,
  screenPatternJsonSchema,
  validateArtifactSet,
  validateBundleManifest,
  validateCompositionPatternArtifact,
  validateInteractionScenarioArtifact,
  validateScreenPatternArtifact,
  type ArtifactSetInput,
  type BundleManifest,
  type CompositionPatternArtifact,
  type InteractionScenarioArtifact,
  type ScreenPatternArtifact,
} from './index'

const fixture = <T>(name: string): T => JSON.parse(readFileSync(new URL(`./fixtures/valid/${name}.json`, import.meta.url), 'utf8')) as T
const search = () => fixture<ScreenPatternArtifact>('fixture-search-task')
const form = () => fixture<CompositionPatternArtifact>('fixture-form-region')
const scenario = () => fixture<InteractionScenarioArtifact>('fixture-destructive-flow')
const bundle = () => fixture<BundleManifest>('fixture-bundle')
const digest = { core: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', search: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', form: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', scenario: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd' }

const resolvedInput = (): ArtifactSetInput => ({
  manifest: bundle(),
  core: { path: 'contract.json', schemaVersion: '0.6.0', digest: digest.core, ruleIds: contractCatalog.filter((entry) => entry.boundary !== 'screen-pattern').map((entry) => entry.id) },
  screenPatterns: [{ path: 'screen-patterns/fixture-search-task/pattern.json', digest: digest.search, document: search() }],
  compositionPatterns: [{ path: 'composition-patterns/fixture-form-region/pattern.json', digest: digest.form, document: form() }],
  interactionScenarios: [{ path: 'interaction-scenarios/fixture-destructive-flow/scenario.json', digest: digest.scenario, document: scenario() }],
})

const codes = (value: { ok: boolean; issues: readonly { code: string }[] }): string[] => value.ok ? [] : value.issues.map((entry) => entry.code)

describe('Artifact schemas', () => {
  it('accepts minimal fixture artifacts with explicit versioned schema IDs', () => {
    expect(screenPatternJsonSchema.$id).toBe('https://ui-contract-editor.local/schema/screen-pattern-0.1.0.json')
    expect(compositionPatternJsonSchema.$id).toBe('https://ui-contract-editor.local/schema/composition-pattern-0.1.0.json')
    expect(interactionScenarioJsonSchema.$id).toBe('https://ui-contract-editor.local/schema/interaction-scenario-0.1.0.json')
    expect(bundleManifestJsonSchema.$id).toBe('https://ui-contract-editor.local/schema/bundle-manifest-0.1.0.json')
    expect(validateScreenPatternArtifact(search()).ok).toBe(true)
    expect(validateCompositionPatternArtifact(form()).ok).toBe(true)
    expect(validateInteractionScenarioArtifact(scenario()).ok).toBe(true)
    expect(validateBundleManifest(bundle()).ok).toBe(true)
  })

  it('keeps artifact kinds separate and rejects unknown fields and malformed primitives', () => {
    expect(codes(validateScreenPatternArtifact({ ...search(), extra: true }))).toContain('schema.additionalProperties')
    expect(codes(validateScreenPatternArtifact({ ...search(), artifactKind: 'composition-pattern' }))).toContain('schema.const')
    expect(codes(validateCompositionPatternArtifact({ ...form(), patternSchemaVersion: '0.2.0' }))).toContain('schema.const')
    expect(codes(validateInteractionScenarioArtifact({ ...scenario(), scenarioVersion: 'version-one' }))).toContain('schema.pattern')
    expect(codes(validateBundleManifest({ ...bundle(), contract: { ...bundle().contract, digest: 'sha256:ABC' } }))).toContain('schema.pattern')
    expect(codes(validateBundleManifest({ ...bundle(), screenPatterns: [{ ...bundle().screenPatterns[0], path: '../pattern.json' }] }))).toContain('schema.pattern')
    expect(codes(validateBundleManifest({ ...bundle(), screenPatterns: [{ ...bundle().screenPatterns[0], path: 'C:\\pattern.json' }] }))).toContain('schema.pattern')
  })

  it('keeps nested additional-property diagnostic paths actionable', () => {
    const nestedExtra = search() as ScreenPatternArtifact & { regions: Array<ScreenPatternArtifact['regions'][number] & { extra?: boolean }> }
    nestedExtra.regions[0].extra = true
    const validation = validateScreenPatternArtifact(nestedExtra)
    expect(validation.ok).toBe(false)
    if (!validation.ok) expect(validation.issues).toContainEqual(expect.objectContaining({ path: '/regions/0/extra', code: 'schema.additionalProperties' }))
  })

  it('allows an empty Core-only Bundle', () => {
    expect(validateBundleManifest(fixture<BundleManifest>('core-only-bundle')).ok).toBe(true)
  })
})

describe('Artifact semantic validation', () => {
  it('rejects duplicate local IDs and unknown region references', () => {
    const duplicateRegion = search()
    duplicateRegion.regions.push({ ...duplicateRegion.regions[0] })
    const duplicateState = search()
    duplicateState.requiredStates.push({ ...duplicateState.requiredStates[0] })
    const unknownRegion = search()
    unknownRegion.extensionPoints[0].regionId = 'unknown-region'
    const unknownRuleRegion = search()
    unknownRuleRegion.compositionRules[0].regionIds = ['unknown-region']
    expect(codes(validateScreenPatternArtifact(duplicateRegion))).toContain('artifact.duplicate-id')
    expect(codes(validateScreenPatternArtifact(duplicateState))).toContain('artifact.duplicate-id')
    expect(codes(validateScreenPatternArtifact(unknownRegion))).toContain('artifact.unknown-region')
    expect(codes(validateScreenPatternArtifact(unknownRuleRegion))).toContain('artifact.unknown-region')
  })

  it('validates stable Core rule IDs and rejects screen-pattern Catalog entries as Core requirements', () => {
    const unknown = search()
    unknown.requires.coreRuleIds = ['missing-rule']
    const nonCore = search()
    nonCore.requires.coreRuleIds = ['search-list-pattern']
    const duplicate = search()
    duplicate.requires.coreRuleIds = ['button-primary-emphasis', 'button-primary-emphasis']
    expect(codes(validateScreenPatternArtifact(unknown))).toContain('artifact.unknown-core-rule')
    expect(codes(validateScreenPatternArtifact(nonCore))).toContain('artifact.non-core-rule')
    expect(codes(validateScreenPatternArtifact(duplicate))).toContain('artifact.duplicate-id')
  })

  it('rejects self dependency for every artifact responsibility', () => {
    const pattern = search()
    pattern.composes.compositionPatterns = [{ id: pattern.id, patternVersion: pattern.patternVersion }]
    const composition = form()
    composition.composes.compositionPatterns = [{ id: composition.id, patternVersion: composition.patternVersion }]
    const flow = scenario()
    flow.composes.interactionScenarios = [{ id: flow.id, scenarioVersion: flow.scenarioVersion }]
    expect(codes(validateScreenPatternArtifact(pattern))).toContain('artifact.self-dependency')
    expect(codes(validateCompositionPatternArtifact(composition))).toContain('artifact.self-dependency')
    expect(codes(validateInteractionScenarioArtifact(flow))).toContain('artifact.self-dependency')
  })
})

describe('in-memory Bundle artifact-set validation', () => {
  it('resolves a valid artifact set and returns deterministic diagnostics', () => {
    expect(validateArtifactSet(resolvedInput()).ok).toBe(true)
    const bad = resolvedInput()
    bad.manifest.screenPatterns[0].digest = digest.core
    const first = validateArtifactSet(bad)
    const second = validateArtifactSet(bad)
    expect(codes(first)).toContain('bundle.digest-mismatch')
    expect(first).toEqual(second)
  })

  it('rebases resolved-artifact semantic diagnostics to the Bundle location', () => {
    const input = resolvedInput()
    input.screenPatterns[0].document.requires.coreRuleIds = ['missing-rule']
    const validation = validateArtifactSet(input)
    expect(validation.ok).toBe(false)
    if (!validation.ok) expect(validation.issues).toContainEqual(expect.objectContaining({ path: '/screenPatterns/0/requires/coreRuleIds/0', code: 'artifact.unknown-core-rule' }))
  })

  it('distinguishes missing, identity, version, path, digest, and Core mismatches', () => {
    const missing = resolvedInput(); missing.screenPatterns = []
    const identity = resolvedInput(); identity.manifest.screenPatterns[0].id = 'fixture-other-task'
    const version = resolvedInput(); version.manifest.screenPatterns[0].patternVersion = '0.1.1'
    const path = resolvedInput(); path.manifest.screenPatterns[0].path = 'screen-patterns/fixture-other-task/pattern.json'
    const digestMismatch = resolvedInput(); digestMismatch.manifest.screenPatterns[0].digest = digest.core
    const core = resolvedInput(); core.manifest.contract.schemaVersion = '0.7.0'
    expect(codes(validateArtifactSet(missing))).toContain('bundle.missing-artifact')
    expect(codes(validateArtifactSet(identity))).toContain('bundle.identity-mismatch')
    expect(codes(validateArtifactSet(version))).toContain('bundle.version-mismatch')
    expect(codes(validateArtifactSet(path))).toContain('bundle.path-mismatch')
    expect(codes(validateArtifactSet(digestMismatch))).toContain('bundle.digest-mismatch')
    expect(codes(validateArtifactSet(core))).toContain('bundle.core-schema-mismatch')
  })

  it('rejects duplicate references, unresolved dependencies, and dependency cycles', () => {
    const duplicate = resolvedInput(); duplicate.manifest.screenPatterns.push({ ...duplicate.manifest.screenPatterns[0] })
    const missingDependency = resolvedInput(); missingDependency.compositionPatterns = []
    const cycle = resolvedInput()
    const second = structuredClone(cycle.compositionPatterns[0])
    second.document.id = 'fixture-second-region'
    second.path = 'composition-patterns/fixture-second-region/pattern.json'
    second.digest = digest.search
    second.document.composes.compositionPatterns = [{ id: 'fixture-form-region', patternVersion: '0.1.0' }]
    cycle.compositionPatterns[0].document.composes.compositionPatterns = [{ id: 'fixture-second-region', patternVersion: '0.1.0' }]
    cycle.compositionPatterns.push(second)
    cycle.manifest.compositionPatterns.push({ id: 'fixture-second-region', path: second.path, patternVersion: '0.1.0', digest: second.digest })
    expect(codes(validateArtifactSet(duplicate))).toContain('bundle.duplicate-reference')
    expect(codes(validateArtifactSet(missingDependency))).toContain('bundle.missing-artifact')
    expect(codes(validateArtifactSet(missingDependency))).toContain('bundle.missing-dependency')
    expect(codes(validateArtifactSet(cycle))).toContain('bundle.dependency-cycle')
  })

  it('rejects dependency version mismatches and duplicate resolved artifacts', () => {
    const dependencyVersion = resolvedInput()
    dependencyVersion.screenPatterns[0].document.composes.compositionPatterns[0].patternVersion = '0.1.1'
    const resolvedDuplicate = resolvedInput()
    resolvedDuplicate.screenPatterns.push(structuredClone(resolvedDuplicate.screenPatterns[0]))
    expect(codes(validateArtifactSet(dependencyVersion))).toContain('bundle.version-mismatch')
    expect(codes(validateArtifactSet(resolvedDuplicate))).toContain('artifact.duplicate-id')
  })
})

describe('Core 0.6.0 regression boundary', () => {
  it('does not change the existing Core type, schema, defaults, catalog, import, Adapter, or renderer boundary', () => {
    expect(defaultContract.schemaVersion).toBe('0.6.0')
    expect(defaultContract.screenPatternPolicy).toEqual({ searchList: 'standard-search-list', formSection: 'grouped-form-section' })
    expect(uiContractJsonSchema.required).toContain('screenPatternPolicy')
    expect(importContract(defaultContract)).toMatchObject({ outcome: 'valid', contract: defaultContract })
    expect(contractCatalog.find((entry) => entry.id === 'search-list-pattern')?.boundary).toBe('screen-pattern')
    expect(contractCatalog.find((entry) => entry.id === 'form-section-pattern')?.boundary).toBe('screen-pattern')
  })
})
