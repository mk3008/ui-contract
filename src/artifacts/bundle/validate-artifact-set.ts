import { contractCatalog } from '../../contract/catalog'
import { issue, result, type ArtifactValidationIssue, type ArtifactValidationResult } from '../diagnostics'
import { validateCompositionPatternArtifact } from '../composition-pattern/validate'
import { validateInteractionScenarioArtifact } from '../interaction-scenario/validate'
import { validateScreenPatternArtifact } from '../screen-pattern/validate'
import { validateBundleManifest } from './validate'
import type { ArtifactSetInput, BundleManifest, CompositionPatternArtifact, InteractionScenarioArtifact, PatternReference, ResolvedArtifact, ScenarioReference, ScreenPatternArtifact } from '../types'

type AnyArtifact = ScreenPatternArtifact | CompositionPatternArtifact | InteractionScenarioArtifact
type Kind = 'screenPatterns' | 'compositionPatterns' | 'interactionScenarios'

const versionOf = (document: AnyArtifact): string => document.artifactKind === 'interaction-scenario' ? document.scenarioVersion : document.patternVersion
const referenceVersion = (reference: PatternReference | ScenarioReference): string => 'scenarioVersion' in reference ? reference.scenarioVersion : reference.patternVersion

function validateResolvedDuplicates<T extends AnyArtifact>(items: ResolvedArtifact<T>[], path: string, issues: ArtifactValidationIssue[]): void {
  const ids = new Set<string>()
  const paths = new Set<string>()
  items.forEach((item, index) => {
    if (ids.has(item.document.id) || paths.has(item.path)) issues.push(issue(`${path}/${index}`, 'artifact.duplicate-id', `Duplicate resolved artifact ${item.document.id}.`))
    ids.add(item.document.id)
    paths.add(item.path)
  })
}

function validateIdentity<T extends AnyArtifact>(references: Array<PatternReference | ScenarioReference>, resolved: ResolvedArtifact<T>[], path: string, issues: ArtifactValidationIssue[]): void {
  for (const [index, reference] of references.entries()) {
    const byId = resolved.filter((item) => item.document.id === reference.id)
    if (byId.length === 0) {
      const byPath = resolved.filter((item) => item.path === reference.path)
      issues.push(issue(`${path}/${index}`, byPath.length ? 'bundle.identity-mismatch' : 'bundle.missing-artifact', byPath.length ? `Bundle reference ${reference.id} does not match the resolved artifact ID.` : `Bundle reference ${reference.id} has no resolved artifact.`))
      continue
    }
    const item = byId[0]
    if (item.path !== reference.path) issues.push(issue(`${path}/${index}/path`, 'bundle.path-mismatch', `Bundle path for ${reference.id} does not match the resolved artifact.`))
    if (item.digest !== reference.digest) issues.push(issue(`${path}/${index}/digest`, 'bundle.digest-mismatch', `Bundle digest for ${reference.id} does not match the resolved artifact.`))
    if (versionOf(item.document) !== referenceVersion(reference)) issues.push(issue(`${path}/${index}`, 'bundle.version-mismatch', `Bundle version for ${reference.id} does not match the resolved artifact.`))
  }
}

function selected<T extends AnyArtifact>(items: ResolvedArtifact<T>[]): Map<string, ResolvedArtifact<T>> {
  return new Map(items.map((item) => [item.document.id, item]))
}

function validateDependency(reference: { id: string; patternVersion?: string; scenarioVersion?: string }, selectedArtifacts: Map<string, ResolvedArtifact<AnyArtifact>>, path: string, issues: ArtifactValidationIssue[]): void {
  const item = selectedArtifacts.get(reference.id)
  if (!item) {
    issues.push(issue(path, 'bundle.missing-dependency', `Selected dependency ${reference.id} is missing.`))
    return
  }
  const expectedVersion = 'scenarioVersion' in reference ? reference.scenarioVersion : reference.patternVersion
  if (versionOf(item.document) !== expectedVersion) issues.push(issue(path, 'bundle.version-mismatch', `Dependency ${reference.id} has a different version.`))
}

function detectCycles(items: ResolvedArtifact<CompositionPatternArtifact | InteractionScenarioArtifact>[], dependencies: (document: CompositionPatternArtifact | InteractionScenarioArtifact) => Array<{ id: string }>, kind: Kind, issues: ArtifactValidationIssue[]): void {
  const map = new Map(items.map((item) => [item.document.id, item.document]))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const report = new Set<string>()
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      if (!report.has(id)) issues.push(issue(`/${kind}/${id}`, 'bundle.dependency-cycle', `Dependency cycle includes ${id}.`))
      report.add(id)
      return
    }
    if (visited.has(id)) return
    const document = map.get(id)
    if (!document) return
    visiting.add(id)
    dependencies(document).forEach((dependency) => visit(dependency.id))
    visiting.delete(id)
    visited.add(id)
  }
  [...map.keys()].sort().forEach(visit)
}

function validateArtifactSemantics(input: ArtifactSetInput, issues: ArtifactValidationIssue[]): void {
  input.screenPatterns.forEach((item) => {
    const validation = validateScreenPatternArtifact(item.document)
    if (!validation.ok) issues.push(...validation.issues)
  })
  input.compositionPatterns.forEach((item) => {
    const validation = validateCompositionPatternArtifact(item.document)
    if (!validation.ok) issues.push(...validation.issues)
  })
  input.interactionScenarios.forEach((item) => {
    const validation = validateInteractionScenarioArtifact(item.document)
    if (!validation.ok) issues.push(...validation.issues)
  })
}

function validateCoreRequirements(input: ArtifactSetInput, artifact: AnyArtifact, path: string, issues: ArtifactValidationIssue[]): void {
  if (artifact.requires.coreSchemaVersion !== input.core.schemaVersion) issues.push(issue(`${path}/requires/coreSchemaVersion`, 'bundle.core-schema-mismatch', `Artifact ${artifact.id} requires Core schema ${artifact.requires.coreSchemaVersion}.`))
  const coreRules = new Set(input.core.ruleIds)
  for (const [index, id] of artifact.requires.coreRuleIds.entries()) {
    const catalog = contractCatalog.find((entry) => entry.id === id)
    if (!catalog || catalog.boundary === 'screen-pattern' || !coreRules.has(id)) issues.push(issue(`${path}/requires/coreRuleIds/${index}`, catalog?.boundary === 'screen-pattern' ? 'artifact.non-core-rule' : 'artifact.unknown-core-rule', `Core rule ${id} is not available from the resolved Core Contract.`))
  }
}

/** Validates a caller-resolved set only. It never reads files or calculates digests. */
export function validateArtifactSet(input: ArtifactSetInput): ArtifactValidationResult<BundleManifest> {
  const issues: ArtifactValidationIssue[] = []
  const manifestValidation = validateBundleManifest(input.manifest)
  if (!manifestValidation.ok) issues.push(...manifestValidation.issues)
  validateResolvedDuplicates(input.screenPatterns, '/screenPatterns', issues)
  validateResolvedDuplicates(input.compositionPatterns, '/compositionPatterns', issues)
  validateResolvedDuplicates(input.interactionScenarios, '/interactionScenarios', issues)
  validateArtifactSemantics(input, issues)

  if (input.manifest.contract.path !== input.core.path) issues.push(issue('/contract/path', 'bundle.path-mismatch', 'Bundle Core path does not match the resolved Core Contract.'))
  if (input.manifest.contract.digest !== input.core.digest) issues.push(issue('/contract/digest', 'bundle.digest-mismatch', 'Bundle Core digest does not match the resolved Core Contract.'))
  if (input.manifest.contract.schemaVersion !== input.core.schemaVersion) issues.push(issue('/contract/schemaVersion', 'bundle.core-schema-mismatch', 'Bundle Core schema version does not match the resolved Core Contract.'))

  validateIdentity(input.manifest.screenPatterns, input.screenPatterns, '/screenPatterns', issues)
  validateIdentity(input.manifest.compositionPatterns, input.compositionPatterns, '/compositionPatterns', issues)
  validateIdentity(input.manifest.interactionScenarios, input.interactionScenarios, '/interactionScenarios', issues)

  const compositions = selected(input.compositionPatterns) as Map<string, ResolvedArtifact<AnyArtifact>>
  const scenarios = selected(input.interactionScenarios) as Map<string, ResolvedArtifact<AnyArtifact>>
  input.screenPatterns.forEach((item, index) => {
    validateCoreRequirements(input, item.document, `/screenPatterns/${index}`, issues)
    item.document.composes.compositionPatterns.forEach((dependency, dependencyIndex) => validateDependency(dependency, compositions, `/screenPatterns/${index}/composes/compositionPatterns/${dependencyIndex}`, issues))
    item.document.composes.interactionScenarios.forEach((dependency, dependencyIndex) => validateDependency(dependency, scenarios, `/screenPatterns/${index}/composes/interactionScenarios/${dependencyIndex}`, issues))
  })
  input.compositionPatterns.forEach((item, index) => {
    validateCoreRequirements(input, item.document, `/compositionPatterns/${index}`, issues)
    item.document.composes.compositionPatterns.forEach((dependency, dependencyIndex) => validateDependency(dependency, compositions, `/compositionPatterns/${index}/composes/compositionPatterns/${dependencyIndex}`, issues))
  })
  input.interactionScenarios.forEach((item, index) => {
    validateCoreRequirements(input, item.document, `/interactionScenarios/${index}`, issues)
    item.document.composes.interactionScenarios.forEach((dependency, dependencyIndex) => validateDependency(dependency, scenarios, `/interactionScenarios/${index}/composes/interactionScenarios/${dependencyIndex}`, issues))
  })
  detectCycles(input.compositionPatterns, (document) => (document as CompositionPatternArtifact).composes.compositionPatterns, 'compositionPatterns', issues)
  detectCycles(input.interactionScenarios, (document) => (document as InteractionScenarioArtifact).composes.interactionScenarios, 'interactionScenarios', issues)
  return result(input.manifest, issues)
}
