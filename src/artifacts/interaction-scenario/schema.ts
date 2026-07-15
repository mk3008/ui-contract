import { artifactSchemaVersion } from '../types'
import { identifier, semverPattern, strictObject, stringArray, text, version, type Schema } from '../schema-utils'

const coreRequirements = strictObject({ coreSchemaVersion: { type: 'string', pattern: semverPattern }, coreRuleIds: { type: 'array', items: identifier } })
const state = strictObject({ id: identifier, description: text })
const compositionRule = strictObject({ id: identifier, statement: text })
const extensionPoint = strictObject({ id: identifier, kind: { enum: ['permissions', 'data', 'actions', 'routes', 'content'] }, description: text, required: { type: 'boolean' } })
const dependency = strictObject({ id: identifier, scenarioVersion: version })

export const interactionScenarioJsonSchema: Schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://ui-contract-editor.local/schema/interaction-scenario-0.1.0.json',
  title: 'Interaction Scenario Artifact', type: 'object',
  required: ['artifactKind', 'scenarioSchemaVersion', 'id', 'scenarioVersion', 'title', 'purpose', 'appliesWhen', 'nonGoals', 'requires', 'composes', 'requiredContext', 'requiredStates', 'compositionRules', 'extensionPoints'],
  properties: {
    artifactKind: { const: 'interaction-scenario' }, scenarioSchemaVersion: { const: artifactSchemaVersion }, id: identifier, scenarioVersion: version, title: text, purpose: text,
    appliesWhen: stringArray(), nonGoals: stringArray(), requires: coreRequirements, composes: strictObject({ interactionScenarios: { type: 'array', items: dependency } }), requiredContext: stringArray(), requiredStates: { type: 'array', items: state }, compositionRules: { type: 'array', items: compositionRule }, extensionPoints: { type: 'array', items: extensionPoint },
  }, additionalProperties: false,
}
