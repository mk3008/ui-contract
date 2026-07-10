export type ContractBoundary = 'foundation' | 'component' | 'interaction-policy' | 'screen-pattern'
export type ContractEntryKind = 'decision' | 'invariant'

export type ContractOption = {
  value: string
  label: string
  note: string
  translationKey: string
}

export type ContractCatalogEntry = {
  id: string
  boundary: ContractBoundary
  kind: ContractEntryKind
  path: string
  defaultValue?: string
  options?: readonly ContractOption[]
  label: string
  note: string
  previewId: string
  translationKey: string
}

const option = (value: string, label: string, note: string): ContractOption => ({
  value, label, note, translationKey: `option.${value}`,
})

const decision = (
  id: string,
  boundary: ContractBoundary,
  path: string,
  defaultValue: string,
  label: string,
  note: string,
  options: readonly ContractOption[],
): ContractCatalogEntry => ({ id, boundary, kind: 'decision', path, defaultValue, label, note, options: options.map((item) => ({ ...item, translationKey: `option.${id}.${item.value}` })), previewId: `preview.${id}`, translationKey: `decision.${id}` })

const invariant = (id: string, boundary: ContractBoundary, path: string, label: string, note: string): ContractCatalogEntry => ({
  id, boundary, kind: 'invariant', path, label, note, previewId: `preview.${id}`, translationKey: `invariant.${id}`,
})

/** The authoritative metadata for all values currently persisted by the editor. */
export const contractCatalog: readonly ContractCatalogEntry[] = [
  decision('color-profile', 'foundation', 'designPolicy.colorProfileId', 'default', 'Color profile', 'Semantic color roles for the product.', ['default', 'deep-slate-blue', 'enterprise-blue', 'productivity-indigo', 'trust-green', 'teal-operations', 'neutral-graphite', 'corporate-red', 'operations-orange', 'office-neutral', 'financial-navy', 'horizon-cyan', 'custom'].map((value) => option(value, value === 'custom' ? 'Custom' : value.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '), 'Semantic color profile.'))),
  decision('button-primary-emphasis', 'component', 'componentPolicy.button.primaryEmphasis', 'filled', 'Primary emphasis', 'Visible treatment for the primary action.', [option('filled', 'Filled', 'Filled action color.'), option('filled-tonal', 'Filled tonal', 'Tonal action surface.'), option('outline', 'Outline', 'Colored text and border.')]),
  decision('button-secondary-emphasis', 'component', 'componentPolicy.button.secondaryEmphasis', 'outline', 'Secondary emphasis', 'Visible treatment for secondary actions.', [option('outline', 'Outline', 'Colored text and border.'), option('neutral-filled', 'Neutral surface', 'Neutral filled surface.'), option('filled-tonal', 'Filled tonal', 'Tonal action surface.')]),
  decision('button-danger-placement', 'component', 'componentPolicy.button.dangerPlacement', 'separated', 'Danger placement', 'Placement of destructive actions.', [option('separated', 'Separated', 'Keep away from normal actions.'), option('inline', 'Inline row', 'Place in related action row.')]),
  decision('button-danger-emphasis', 'component', 'componentPolicy.button.dangerEmphasis', 'outline', 'Danger emphasis', 'Visible treatment for destructive actions.', [option('text', 'Text', 'Colored text only.'), option('outline', 'Outline', 'Colored text and border.'), option('filled', 'Filled', 'Filled danger surface.')]),
  decision('button-icon-adornment', 'component', 'componentPolicy.button.iconAdornment', 'text-only-default', 'Icon adornment', 'Whether labeled buttons use clarifying icons.', [option('text-only-default', 'Text only', 'Visible label carries meaning.'), option('icons-when-clarifying', 'Clarifying icons', 'Use only when meaning is clarified.')]),
  decision('button-icon-only-policy', 'component', 'componentPolicy.button.iconOnlyPolicy', 'avoid-icon-only', 'Icon-only policy', 'Constraints for icon-only actions.', [option('avoid-icon-only', 'Avoid icon-only', 'Prefer visible text.'), option('allow-recognizable-with-accessible-name', 'Constrained icon-only', 'Recognizable, space-limited actions only.')]),
  decision('text-field-style', 'component', 'componentPolicy.textField.fieldStyle', 'outlined', 'Field style', 'Text field surface treatment.', [option('outlined', 'Outlined', 'Bordered field.'), option('filled', 'Filled', 'Filled field surface.')]),
  decision('text-field-label-placement', 'component', 'componentPolicy.textField.labelPlacement', 'top', 'Label placement', 'Position of the field label.', [option('top', 'Top', 'Label above field.'), option('side-left', 'Side left', 'Label left of field.'), option('side-right', 'Side right', 'Label right of field.')]),
  decision('text-field-required-indicator', 'component', 'componentPolicy.textField.requiredIndicator', 'mark-optional', 'Required indicator', 'How requiredness is shown.', [option('mark-optional', 'Mark optional', 'Show optional fields.'), option('mark-required-default', 'Mark required', 'Show required fields.'), option('mark-required-danger', 'Required in danger color', 'Use danger color for required cue.')]),
  decision('text-field-message-area', 'component', 'componentPolicy.textField.messageAreaBehavior', 'reserved-message-area', 'Message area', 'Space behavior for help and errors.', [option('reserved-message-area', 'Reserved', 'Reserve message space.'), option('dynamic-message-area', 'Dynamic', 'Show when needed.')]),
  decision('text-field-placeholder', 'component', 'componentPolicy.textField.placeholderUsage', 'avoid-placeholder', 'Placeholder use', 'Use of placeholder text.', [option('avoid-placeholder', 'Avoid placeholder', 'Do not repeat label.'), option('format-example-only', 'Format example only', 'Use only for format examples.')]),
  decision('focus-visibility', 'interaction-policy', 'interactionPolicy.focus.visibility', 'keyboard-and-active-inputs', 'Focus visibility', 'Controls that receive a visible focus indicator.', [option('keyboard-and-active-inputs', 'Keyboard and active inputs', 'Visible for keyboard and active inputs.'), option('all-focused-controls', 'All focused controls', 'Visible on all focus.')]),
  decision('focus-indicator-style', 'interaction-policy', 'interactionPolicy.focus.indicatorStyle', 'outer-ring', 'Focus indicator', 'Visible focus treatment.', [option('outer-ring', 'Outer ring', 'Ring outside control.'), option('high-contrast-highlight', 'High contrast highlight', 'High contrast focus highlight.')]),
  decision('validation-trigger', 'interaction-policy', 'interactionPolicy.validation.trigger', 'submit-or-step', 'Validation timing', 'When validation appears.', [option('submit-or-step', 'Submit or step', 'After submit or advance.'), option('blur-after-edit', 'Blur after edit', 'After user leaves an edited field.')]),
  decision('validation-presentation', 'interaction-policy', 'interactionPolicy.validation.presentation', 'field-and-summary', 'Validation presentation', 'Where errors appear.', [option('field-and-summary', 'Field and summary', 'Field messages plus summary.'), option('field-message-only', 'Field message only', 'Messages at fields.')]),
  decision('availability-treatment', 'interaction-policy', 'interactionPolicy.availability.treatment', 'keep-enabled-explain-on-action', 'Availability treatment', 'Presentation for unavailable controls.', [option('keep-enabled-explain-on-action', 'Explain on action', 'Keep recoverable action enabled.'), option('readonly-for-fixed-values', 'Read-only', 'Fixed but reviewable values.'), option('disabled-when-impossible', 'Disabled when impossible', 'Use only when impossible.'), option('hidden-when-not-applicable', 'Hidden when not applicable', 'Hide truly inapplicable controls.')]),
  decision('availability-layout', 'interaction-policy', 'interactionPolicy.availability.layout', 'preserve-space-for-temporary-state', 'Availability layout', 'Layout behavior for temporary availability.', [option('preserve-space-for-temporary-state', 'Preserve space', 'Avoid temporary reflow.'), option('allow-reflow-when-not-applicable', 'Allow reflow', 'For permanently inapplicable controls.')]),
  decision('confirmation-surface', 'interaction-policy', 'interactionPolicy.confirmation.surface', 'danger-dialog', 'Confirmation surface', 'Surface for destructive confirmation.', [option('danger-dialog', 'Danger dialog', 'Explicit destructive dialog.'), option('typed-confirmation', 'Typed confirmation', 'Require typed confirmation.'), option('undo-when-reversible', 'Undo when reversible', 'Offer reversal.')]),
  decision('confirmation-scope', 'interaction-policy', 'interactionPolicy.confirmation.scope', 'destructive-only', 'Confirmation scope', 'Classes of destructive action requiring confirmation or recovery.', [option('destructive-only', 'Destructive only', 'Confirm an irreversible destructive action.'), option('destructive-and-bulk', 'Destructive and bulk', 'Also confirm destructive actions affecting multiple records.')]),
  decision('select-empty-display', 'component', 'componentPolicy.select.emptyDisplay', 'placeholder-text', 'Empty display', 'Presentation of an empty select value.', [option('placeholder-text', 'Placeholder text', 'Show a short example.'), option('blank-field', 'Blank field', 'Leave field empty.')]),
  decision('select-multi-selected-display', 'component', 'componentPolicy.select.multiSelectedItemDisplay', 'chips', 'Selected items', 'Presentation of selected multiple values.', [option('chips', 'Chips', 'Show selected items as chips.'), option('chips-overflow-count', 'Chips with overflow', 'Show one chip and count.'), option('inline-text', 'Inline text', 'Show values as text.'), option('count-summary', 'Count summary', 'Show selected count.')]),
  decision('select-multi-remove', 'component', 'componentPolicy.select.multiRemoveAffordance', 'chip-remove-button', 'Remove affordance', 'How selected items can be removed.', [option('chip-remove-button', 'Chip remove button', 'Remove directly from chip.'), option('list-toggle-only', 'List toggle only', 'Remove in option list.')]),
  decision('select-search-treatment', 'component', 'componentPolicy.select.searchFieldTreatment', 'embedded-search-field', 'Search field', 'Placement of lookup filtering.', [option('embedded-search-field', 'Embedded search', 'Search in control.'), option('separate-search-field', 'Separate search', 'Search in list.')]),
  decision('tabs-treatment', 'component', 'componentPolicy.tabs.treatment', 'segmented-contained', 'Tabs treatment', 'Visible tab treatment.', [option('segmented-contained', 'Segmented', 'Contained segments.'), option('underline-tabs', 'Underline', 'Underline active tab.')]),
  decision('tabs-adornment', 'component', 'componentPolicy.tabs.adornment', 'text-only', 'Tabs adornment', 'Tab label adornment.', [option('text-only', 'Text only', 'Use visible text.'), option('icon-when-clarifying', 'Clarifying icon', 'Use only when clarifying.'), option('count-when-useful', 'Count when useful', 'Show useful count.')]),
  decision('toggle-treatment', 'component', 'componentPolicy.toggle.treatment', 'switch-control', 'Toggle treatment', 'Binary control treatment.', [option('switch-control', 'Switch', 'Switch control.'), option('segmented-binary', 'Segmented binary', 'Two contained choices.')]),
  decision('toggle-label-policy', 'component', 'componentPolicy.toggle.labelPolicy', 'visible-label', 'Toggle label', 'Visible toggle labeling.', [option('visible-label', 'Visible label', 'Show label.'), option('label-plus-state-text', 'Label and state', 'Show label and state text.')]),
  decision('checkbox-group-layout', 'component', 'componentPolicy.checkbox.groupLayout', 'stacked-list', 'Checkbox layout', 'Group layout.', [option('stacked-list', 'Stacked list', 'Vertical list.'), option('inline-compact', 'Inline compact', 'Compact inline group.')]),
  decision('checkbox-choice-surface', 'component', 'componentPolicy.checkbox.choiceSurface', 'plain-label', 'Checkbox surface', 'Choice surface treatment.', [option('plain-label', 'Plain label', 'Label beside control.'), option('row-surface', 'Row surface', 'Selectable row.'), option('bordered-choice-row', 'Bordered row', 'Bordered selectable row.')]),
  decision('checkbox-mixed-state', 'component', 'componentPolicy.checkbox.mixedState', 'show-indeterminate', 'Mixed state', 'Parent mixed-state behavior.', [option('show-indeterminate', 'Show indeterminate', 'Show partial selection.'), option('avoid-parent-checkbox', 'Avoid parent checkbox', 'Do not use parent control.')]),
  decision('card-treatment', 'component', 'componentPolicy.card.treatment', 'outlined-card', 'Card treatment', 'Card surface treatment.', [option('outlined-card', 'Outlined', 'Bordered card.'), option('filled-card', 'Filled', 'Filled card.'), option('elevated-card', 'Elevated', 'Raised card.')]),
  decision('card-interaction', 'component', 'componentPolicy.card.interaction', 'static-card', 'Card interaction', 'Card affordance.', [option('static-card', 'Static', 'Non-interactive card.'), option('clickable-card', 'Clickable', 'Click action.'), option('selectable-card', 'Selectable', 'Selection action.')]),
  decision('side-panel-relationship', 'component', 'componentPolicy.sidePanel.relationship', 'persistent-inspector', 'Side panel relationship', 'Panel presence.', [option('persistent-inspector', 'Persistent inspector', 'Stays visible.'), option('temporary-drawer', 'Temporary drawer', 'Opens on demand.')]),
  decision('side-panel-responsive', 'component', 'componentPolicy.sidePanel.responsive', 'collapse-to-toggle', 'Side panel responsive', 'Small viewport behavior.', [option('collapse-to-toggle', 'Collapse to toggle', 'Collapse panel.'), option('full-screen-sheet', 'Full-screen sheet', 'Use full screen sheet.')]),
  decision('search-list-pattern', 'screen-pattern', 'screenPatternPolicy.searchList', 'standard-search-list', 'Search and list', 'A conventional search conditions panel with a results list, sorting, paging, row and bulk action areas.', [option('standard-search-list', 'Standard search and list', 'Use a visible search action, reset, result count, sortable columns, pagination, and contextual row/bulk action areas.')]),
  invariant('visible-focus', 'interaction-policy', 'invariants.visibleFocus', 'Visible focus', 'Keyboard focus must remain visible.'),
  invariant('loading-feedback', 'interaction-policy', 'interactionPolicy.loading.feedback', 'Loading feedback', 'Loading must visibly and programmatically communicate that the affected region is busy. Use skeletons only for structured content; use an inline indicator for a single processing action.'),
  invariant('state-guidance', 'interaction-policy', 'interactionPolicy.stateFeedback.guidance', 'Empty and error guidance', 'Empty and error states must explain the condition in plain language and provide a next step when one is available.'),
  invariant('semantic-button-link', 'component', 'invariants.semanticButtonLink', 'Button/link semantics', 'Buttons perform actions; links navigate.'),
  ...(['light', 'dark'] as const).flatMap((mode) => [
    ['brandBackground', 'Brand background'], ['brandText', 'Brand text'], ['primary', 'Primary action'], ['primaryText', 'Primary action text'], ['success', 'Success'], ['warning', 'Warning'], ['danger', 'Danger'], ['info', 'Information'], ['focusOuter', 'Focus outer'], ['focusInner', 'Focus inner'], ['background', 'Page background'], ['surface', 'Surface'], ['surfaceSoft', 'Soft surface'], ['border', 'Border'], ['text', 'Text'], ['mutedText', 'Muted text'],
  ].map(([role, label]) => {
    const defaults = mode === 'light' ? { brandBackground: '#eff6ff', brandText: '#172554', primary: '#2563eb', primaryText: '#ffffff', success: '#15803d', warning: '#b45309', danger: '#b91c1c', info: '#0f766e', focusOuter: '#111827', focusInner: '#facc15', background: '#f1f5f9', surface: '#ffffff', surfaceSoft: '#f8fafc', border: '#cbd5e1', text: '#0f172a', mutedText: '#64748b' } : { brandBackground: '#020617', brandText: '#f8fafc', primary: '#60a5fa', primaryText: '#0f172a', success: '#4ade80', warning: '#fbbf24', danger: '#f87171', info: '#2dd4bf', focusOuter: '#facc15', focusInner: '#111827', background: '#0f172a', surface: '#111827', surfaceSoft: '#1f2937', border: '#334155', text: '#f8fafc', mutedText: '#cbd5e1' }
    const defaultValue = defaults[role as keyof typeof defaults]
    return decision(`color-${mode}-${role}`, 'foundation', `designPolicy.color.${mode}.${role}`, defaultValue, `${label} (${mode})`, 'Editable semantic color role.', [option(defaultValue, 'Default color', 'A validated hex color for this semantic role.')])
  })),
  ...['mark', 'markBackground', 'markBorder'].map((role) => { const value = ({ mark: '#2563eb', markBackground: '#ffffff', markBorder: '#cbd5e1' } as Record<string, string>)[role]; return decision(`brand-identity-${role}`, 'foundation', `designPolicy.brandIdentity.${role}`, value, `Brand identity ${role}`, 'Editable brand identity color.', [option(value, 'Default color', 'A validated color for this identity role.')]) }),
]

export const previewRegistry = new Set(contractCatalog.map((entry) => entry.previewId))
export const translationRegistry = new Set([
  ...contractCatalog.map((entry) => entry.translationKey),
  ...contractCatalog.flatMap((entry) => entry.options?.map((item) => item.translationKey) ?? []),
])

export type CatalogOptionAdapter<Value extends string> = Pick<ContractOption, 'label' | 'note'> & { value: Value }

export function catalogDecision(id: string): ContractCatalogEntry {
  const entry = contractCatalog.find((candidate) => candidate.id === id)
  if (!entry || entry.kind !== 'decision' || !entry.options || entry.defaultValue === undefined) {
    throw new Error(`Missing decision catalog entry: ${id}`)
  }
  return entry
}

export function catalogOptions<Value extends string>(id: string): Array<CatalogOptionAdapter<Value>> {
  return catalogDecision(id).options!.map((item) => ({ value: item.value as Value, label: item.label, note: item.note }))
}

export function catalogDefault<Value extends string>(id: string): Value {
  return catalogDecision(id).defaultValue as Value
}
