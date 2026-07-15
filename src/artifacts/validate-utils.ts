import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js'
import { contractCatalog } from '../contract/catalog'
import { issue, result, type ArtifactValidationIssue, type ArtifactValidationResult } from './diagnostics'
import type { CompositionPatternArtifact, InteractionScenarioArtifact, ScreenPatternArtifact } from './types'
import type { Schema } from './schema-utils'

export const compile = (schema: Schema) => new Ajv2020({ allErrors: true, strict: false }).compile(schema)

export const schemaIssues = (validate: ReturnType<typeof compile>, value: unknown): ArtifactValidationIssue[] => {
  if (validate(value)) return []
  return (validate.errors ?? []).map((error: ErrorObject) => issue(
    error.instancePath || (error.keyword === 'additionalProperties' ? `/${String(error.params.additionalProperty)}` : '/') || '/',
    `schema.${error.keyword}`,
    error.message ?? 'does not satisfy the artifact schema',
  ))
}

const duplicate = (values: string[], path: string, issues: ArtifactValidationIssue[]): void => {
  const seen = new Set<string>()
  values.forEach((value, index) => {
    if (seen.has(value)) issues.push(issue(`${path}/${index}`, 'artifact.duplicate-id', `Duplicate ID ${value}.`))
    seen.add(value)
  })
}

export function validateCoreRequirements(requires: { coreRuleIds: string[] }, path: string, issues: ArtifactValidationIssue[]): void {
  duplicate(requires.coreRuleIds, `${path}/coreRuleIds`, issues)
  for (const [index, id] of requires.coreRuleIds.entries()) {
    const entry = contractCatalog.find((candidate) => candidate.id === id)
    if (!entry) issues.push(issue(`${path}/coreRuleIds/${index}`, 'artifact.unknown-core-rule', `Unknown Core rule ${id}.`))
    else if (entry.boundary === 'screen-pattern') issues.push(issue(`${path}/coreRuleIds/${index}`, 'artifact.non-core-rule', `${id} is a Screen Pattern Catalog entry, not a Core rule.`))
  }
}

type RegionArtifact = Pick<ScreenPatternArtifact | CompositionPatternArtifact, 'regions' | 'requiredStates' | 'compositionRules' | 'extensionPoints'>

export function validateRegions(value: RegionArtifact, issues: ArtifactValidationIssue[]): void {
  duplicate(value.regions.map((region) => region.id), '/regions', issues)
  duplicate(value.requiredStates.map((state) => state.id), '/requiredStates', issues)
  duplicate(value.compositionRules.map((rule) => rule.id), '/compositionRules', issues)
  duplicate(value.extensionPoints.map((point) => point.id), '/extensionPoints', issues)
  const regionIds = new Set(value.regions.map((region) => region.id))
  for (const [ruleIndex, rule] of value.compositionRules.entries()) for (const [regionIndex, regionId] of rule.regionIds.entries()) {
    if (!regionIds.has(regionId)) issues.push(issue(`/compositionRules/${ruleIndex}/regionIds/${regionIndex}`, 'artifact.unknown-region', `Unknown region ${regionId}.`))
  }
  for (const [index, point] of value.extensionPoints.entries()) if (!regionIds.has(point.regionId)) {
    issues.push(issue(`/extensionPoints/${index}/regionId`, 'artifact.unknown-region', `Unknown region ${point.regionId}.`))
  }
}

export function validateScenarioLocal(value: InteractionScenarioArtifact, issues: ArtifactValidationIssue[]): void {
  duplicate(value.requiredStates.map((state) => state.id), '/requiredStates', issues)
  duplicate(value.compositionRules.map((rule) => rule.id), '/compositionRules', issues)
  duplicate(value.extensionPoints.map((point) => point.id), '/extensionPoints', issues)
}

export const validated = <T>(value: T, issues: ArtifactValidationIssue[]): ArtifactValidationResult<T> => result(value, issues)
