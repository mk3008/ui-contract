import { bundleManifestJsonSchema } from './schema'
import { compile, schemaIssues, validateDuplicateIdOrPath, validated } from '../validate-utils'
import type { ArtifactValidationResult } from '../diagnostics'
import type { BundleManifest, PatternReference, ScenarioReference } from '../types'

const validateSchema = compile(bundleManifestJsonSchema)

const duplicateReferences = (references: Array<PatternReference | ScenarioReference>, path: string, issues: ReturnType<typeof schemaIssues>): void => {
  validateDuplicateIdOrPath(references, path, (reference) => reference, 'bundle.duplicate-reference', (reference) => `Duplicate Bundle reference ${reference.id}.`, issues)
}

export function validateBundleManifest(value: unknown): ArtifactValidationResult<BundleManifest> {
  const issues = schemaIssues(validateSchema, value)
  if (issues.length) return validated(value as BundleManifest, issues)
  const manifest = value as BundleManifest
  duplicateReferences(manifest.screenPatterns, '/screenPatterns', issues)
  duplicateReferences(manifest.compositionPatterns, '/compositionPatterns', issues)
  duplicateReferences(manifest.interactionScenarios, '/interactionScenarios', issues)
  return validated(manifest, issues)
}
