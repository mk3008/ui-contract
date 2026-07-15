import { bundleManifestJsonSchema } from './schema'
import { compile, schemaIssues, validated } from '../validate-utils'
import { issue, type ArtifactValidationResult } from '../diagnostics'
import type { BundleManifest, PatternReference, ScenarioReference } from '../types'

const validateSchema = compile(bundleManifestJsonSchema)

const duplicateReferences = (references: Array<PatternReference | ScenarioReference>, path: string, issues: ReturnType<typeof schemaIssues>): void => {
  const ids = new Set<string>()
  const paths = new Set<string>()
  references.forEach((reference, index) => {
    if (ids.has(reference.id) || paths.has(reference.path)) issues.push(issue(`${path}/${index}`, 'bundle.duplicate-reference', `Duplicate Bundle reference ${reference.id}.`))
    ids.add(reference.id)
    paths.add(reference.path)
  })
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
