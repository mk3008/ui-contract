import { compositionPatternJsonSchema } from './schema'
import { schemaIssues, compile, validateCoreRequirements, validateRegions, validated } from '../validate-utils'
import { issue, type ArtifactValidationResult } from '../diagnostics'
import type { CompositionPatternArtifact } from '../types'

const validateSchema = compile(compositionPatternJsonSchema)

export function validateCompositionPatternArtifact(value: unknown): ArtifactValidationResult<CompositionPatternArtifact> {
  const issues = schemaIssues(validateSchema, value)
  if (issues.length) return validated(value as CompositionPatternArtifact, issues)
  const artifact = value as CompositionPatternArtifact
  validateCoreRequirements(artifact.requires, '/requires', issues)
  validateRegions(artifact, issues)
  artifact.composes.compositionPatterns.forEach((dependency, index) => {
    if (dependency.id === artifact.id) issues.push(issue(`/composes/compositionPatterns/${index}/id`, 'artifact.self-dependency', 'An artifact cannot depend on itself.'))
  })
  return validated(artifact, issues)
}
