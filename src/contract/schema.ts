import { catalogDecision, contractCatalog } from './catalog'

type Schema = Record<string, unknown>
const hex: Schema = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }
const identitySurface: Schema = { anyOf: [hex, { const: 'transparent' }] }
const decision = (id: string): Schema => ({ enum: catalogDecision(id).options!.map((option) => option.value) })
const strictObject = (properties: Record<string, Schema>): Schema => ({ type: 'object', required: Object.keys(properties), properties, additionalProperties: false })
const colorMode = strictObject(Object.fromEntries(['brandBackground', 'brandText', 'primary', 'primaryText', 'success', 'warning', 'danger', 'info', 'focusOuter', 'focusInner', 'background', 'surface', 'surfaceSoft', 'border', 'text', 'mutedText'].map((role) => [role, hex])))

/** Versioned JSON Schema for every persisted, portable Contract field. */
export const uiContractJsonSchema: Schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://ui-contract-editor.local/schema/ui-contract-0.1.0.json',
  title: 'UI Contract',
  type: 'object',
  required: ['schemaVersion', 'meta', 'product', 'designPolicy', 'interactionPolicy', 'componentPolicy', 'screenPatternPolicy'],
  properties: {
    schemaVersion: { const: '0.1.0' },
    meta: strictObject({ name: { type: 'string' }, description: { type: 'string' } }),
    product: strictObject({ systemType: { type: 'string' }, informationDensity: { type: 'string' }, visualTone: { type: 'string' } }),
    designPolicy: strictObject({ colorProfileId: decision('color-profile'), brandIdentity: strictObject({ mark: hex, markBackground: identitySurface, markBorder: identitySurface }), color: strictObject({ light: colorMode, dark: colorMode }) }),
    interactionPolicy: strictObject({ focus: strictObject({ visibility: decision('focus-visibility'), indicatorStyle: decision('focus-indicator-style') }), validation: strictObject({ trigger: decision('validation-trigger'), presentation: decision('validation-presentation') }), availability: strictObject({ treatment: decision('availability-treatment'), layout: decision('availability-layout') }), confirmation: strictObject({ surface: decision('confirmation-surface'), scope: decision('confirmation-scope') }) }),
    componentPolicy: strictObject({ button: strictObject({ primaryEmphasis: decision('button-primary-emphasis'), secondaryEmphasis: decision('button-secondary-emphasis'), dangerPlacement: decision('button-danger-placement'), dangerEmphasis: decision('button-danger-emphasis'), iconAdornment: decision('button-icon-adornment'), iconOnlyPolicy: decision('button-icon-only-policy') }), textField: strictObject({ fieldStyle: decision('text-field-style'), labelPlacement: decision('text-field-label-placement'), requiredIndicator: decision('text-field-required-indicator'), messageAreaBehavior: decision('text-field-message-area'), placeholderUsage: decision('text-field-placeholder') }), select: strictObject({ emptyDisplay: decision('select-empty-display'), multiSelectedItemDisplay: decision('select-multi-selected-display'), multiRemoveAffordance: decision('select-multi-remove'), searchFieldTreatment: decision('select-search-treatment') }), tabs: strictObject({ treatment: decision('tabs-treatment'), adornment: decision('tabs-adornment') }), toggle: strictObject({ treatment: decision('toggle-treatment'), labelPolicy: decision('toggle-label-policy') }), checkbox: strictObject({ groupLayout: decision('checkbox-group-layout'), choiceSurface: decision('checkbox-choice-surface'), mixedState: decision('checkbox-mixed-state') }), card: strictObject({ treatment: decision('card-treatment'), interaction: decision('card-interaction') }), sidePanel: strictObject({ relationship: decision('side-panel-relationship'), responsive: decision('side-panel-responsive') }) }),
    screenPatternPolicy: strictObject({ searchList: decision('search-list-pattern') }),
  },
  additionalProperties: false,
  $comment: `Decision paths: ${contractCatalog.filter((entry) => entry.kind === 'decision').map((entry) => entry.path).join(', ')}`,
}
