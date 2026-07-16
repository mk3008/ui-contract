import { artifactSchemaVersion } from '../types'
import { identifier, semverPattern, strictObject, stringArray, text, version, type Schema } from '../schema-utils'

const region = strictObject({ id: identifier, purpose: text, required: { type: 'boolean' } })
const state = strictObject({ id: identifier, description: text })
const coreRequirements = strictObject({ coreSchemaVersion: { type: 'string', pattern: semverPattern }, coreRuleIds: { type: 'array', items: identifier } })
const compositionRule = strictObject({ id: identifier, statement: text, regionIds: { type: 'array', items: identifier } })
const extensionPoint = strictObject({ id: identifier, regionId: identifier, kind: { enum: ['fields', 'columns', 'filters', 'permissions', 'data', 'actions', 'routes', 'content'] }, description: text, required: { type: 'boolean' } })
const patternDependency = strictObject({ id: identifier, patternVersion: version })
const scenarioDependency = strictObject({ id: identifier, scenarioVersion: version })

export const screenPatternJsonSchema: Schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://ui-contract-editor.local/schema/screen-pattern-0.1.0.json',
  title: 'Screen Pattern Artifact',
  type: 'object',
  required: ['artifactKind', 'patternSchemaVersion', 'id', 'patternVersion', 'title', 'purpose', 'appliesWhen', 'nonGoals', 'requires', 'composes', 'regions', 'requiredStates', 'compositionRules', 'extensionPoints'],
  properties: {
    artifactKind: { const: 'screen-pattern' }, patternSchemaVersion: { const: artifactSchemaVersion }, id: identifier, patternVersion: version, title: text, purpose: text,
    appliesWhen: stringArray(), nonGoals: stringArray(), requires: coreRequirements,
    composes: strictObject({ compositionPatterns: { type: 'array', items: patternDependency }, interactionScenarios: { type: 'array', items: scenarioDependency } }),
    regions: { type: 'array', items: region }, requiredStates: { type: 'array', items: state }, compositionRules: { type: 'array', items: compositionRule }, extensionPoints: { type: 'array', items: extensionPoint },
  }, additionalProperties: false,
}
