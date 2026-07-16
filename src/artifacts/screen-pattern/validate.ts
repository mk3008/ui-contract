import { screenPatternJsonSchema } from './schema'
import { schemaIssues, compile, validateCoreRequirements, validateRegions, validated } from '../validate-utils'
import { issue, type ArtifactValidationResult } from '../diagnostics'
import type { ScreenPatternArtifact } from '../types'

const validateSchema = compile(screenPatternJsonSchema)

export function validateScreenPatternArtifact(value: unknown): ArtifactValidationResult<ScreenPatternArtifact> {
  const issues = schemaIssues(validateSchema, value)
  if (issues.length) return validated(value as ScreenPatternArtifact, issues)
  const artifact = value as ScreenPatternArtifact
  validateCoreRequirements(artifact.requires, '/requires', issues)
  validateRegions(artifact, issues)
  artifact.composes.compositionPatterns.forEach((dependency, index) => {
    if (dependency.id === artifact.id) issues.push(issue(`/composes/compositionPatterns/${index}/id`, 'artifact.self-dependency', 'An artifact cannot depend on itself.'))
  })
  artifact.composes.interactionScenarios.forEach((dependency, index) => {
    if (dependency.id === artifact.id) issues.push(issue(`/composes/interactionScenarios/${index}/id`, 'artifact.self-dependency', 'An artifact cannot depend on itself.'))
  })
  return validated(artifact, issues)
}
