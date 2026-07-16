import { interactionScenarioJsonSchema } from './schema'
import { schemaIssues, compile, validateCoreRequirements, validateScenarioLocal, validated } from '../validate-utils'
import { issue, type ArtifactValidationResult } from '../diagnostics'
import type { InteractionScenarioArtifact } from '../types'

const validateSchema = compile(interactionScenarioJsonSchema)

export function validateInteractionScenarioArtifact(value: unknown): ArtifactValidationResult<InteractionScenarioArtifact> {
  const issues = schemaIssues(validateSchema, value)
  if (issues.length) return validated(value as InteractionScenarioArtifact, issues)
  const artifact = value as InteractionScenarioArtifact
  validateCoreRequirements(artifact.requires, '/requires', issues)
  validateScenarioLocal(artifact, issues)
  artifact.composes.interactionScenarios.forEach((dependency, index) => {
    if (dependency.id === artifact.id) issues.push(issue(`/composes/interactionScenarios/${index}/id`, 'artifact.self-dependency', 'An artifact cannot depend on itself.'))
  })
  return validated(artifact, issues)
}
