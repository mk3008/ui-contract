import { bundleSpecVersion } from '../types'
import { digest, identifier, strictObject, version, type Schema } from '../schema-utils'

const contractPath: Schema = { const: 'contract.json' }
const patternReference = (prefix: string, versionKey: string): Schema => strictObject({ id: identifier, path: { type: 'string', pattern: `^${prefix}/[a-z][a-z0-9]*(?:-[a-z0-9]+)*/${prefix === 'interaction-scenarios' ? 'scenario' : 'pattern'}\\.json$` }, [versionKey]: version, digest })

export const bundleManifestJsonSchema: Schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://ui-contract-editor.local/schema/bundle-manifest-0.1.0.json',
  title: 'Bundle Manifest', type: 'object',
  required: ['bundleSpecVersion', 'contract', 'screenPatterns', 'compositionPatterns', 'interactionScenarios'],
  properties: {
    bundleSpecVersion: { const: bundleSpecVersion },
    contract: strictObject({ path: contractPath, schemaVersion: version, digest }),
    screenPatterns: { type: 'array', items: patternReference('screen-patterns', 'patternVersion') },
    compositionPatterns: { type: 'array', items: patternReference('composition-patterns', 'patternVersion') },
    interactionScenarios: { type: 'array', items: patternReference('interaction-scenarios', 'scenarioVersion') },
  }, additionalProperties: false,
}
