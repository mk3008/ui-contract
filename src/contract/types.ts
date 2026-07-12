export type ButtonColoringPattern = 'filled' | 'outline' | 'neutral-surface' | 'filled-tonal' | 'text'
export type PrimaryEmphasis = Extract<ButtonColoringPattern, 'filled' | 'filled-tonal' | 'outline'>
export type SecondaryEmphasis = 'outline' | 'neutral-filled' | 'filled-tonal'
export type DangerPlacement = 'separated' | 'inline'
export type DangerEmphasis = Extract<ButtonColoringPattern, 'text' | 'outline' | 'filled'>
export type IconAdornment = 'text-only-default' | 'icons-when-clarifying'
export type IconOnlyPolicy = 'avoid-icon-only' | 'allow-recognizable-with-accessible-name'
export type TextFieldStyle = 'outlined' | 'filled'
export type TextFieldLabelPlacement = 'top' | 'side-left' | 'side-right'
export type TextFieldRequiredIndicator = 'mark-optional' | 'mark-required-default' | 'mark-required-danger'
export type TextFieldMessageAreaBehavior = 'reserved-message-area' | 'dynamic-message-area'
export type TextFieldPlaceholderUsage = 'avoid-placeholder' | 'format-example-only'
export type FocusVisibility = 'keyboard-and-active-inputs' | 'all-focused-controls'
export type FocusIndicatorStyle = 'outer-ring' | 'high-contrast-highlight'
export type ValidationTrigger = 'submit-or-step' | 'blur-after-edit'
export type ValidationPresentation = 'field-and-summary' | 'field-message-only'
export type AvailabilityTreatment = 'keep-enabled-explain-on-action' | 'readonly-for-fixed-values' | 'disabled-when-impossible' | 'hidden-when-not-applicable'
export type AvailabilityLayout = 'preserve-space-for-temporary-state' | 'allow-reflow-when-not-applicable'
export type CardTreatment = 'outlined-card' | 'filled-card' | 'elevated-card'
export type CardInteraction = 'static-card' | 'clickable-card' | 'selectable-card'
export type SidePanelRelationship = 'persistent-inspector' | 'temporary-drawer'
export type SidePanelResponsive = 'collapse-to-toggle' | 'full-screen-sheet'
export type ConfirmationSurface = 'danger-dialog' | 'typed-confirmation' | 'undo-when-reversible'
export type ConfirmationScope = 'destructive-only' | 'destructive-and-bulk'
export type ColorProfileId = 'default' | 'deep-slate-blue' | 'enterprise-blue' | 'productivity-indigo' | 'trust-green' | 'teal-operations' | 'neutral-graphite' | 'corporate-red' | 'operations-orange' | 'office-neutral' | 'financial-navy' | 'horizon-cyan'
export type ActiveColorProfileId = ColorProfileId | 'custom'
export type ColorModeKey = 'light' | 'dark'
export type ColorRoleKey = 'brandBackground' | 'brandText' | 'primary' | 'primaryText' | 'success' | 'warning' | 'danger' | 'info' | 'focusOuter' | 'focusInner' | 'background' | 'surface' | 'surfaceSoft' | 'border' | 'text' | 'mutedText'
export type ColorPolicy = Record<ColorModeKey, Record<ColorRoleKey, string>>
export type BrandIdentityPolicy = { mark: string; markBackground: string; markBorder: string }
export type ColorProfile = { brandIdentity: BrandIdentityPolicy; color: ColorPolicy; id: ColorProfileId }
export type SelectPolicy = { emptyDisplay: 'placeholder-text' | 'blank-field'; multiSelectedItemDisplay: 'chips' | 'inline-text' | 'chips-overflow-count' | 'count-summary'; multiRemoveAffordance: 'chip-remove-button' | 'list-toggle-only'; searchFieldTreatment: 'embedded-search-field' | 'separate-search-field' }
export type TabsPolicy = { treatment: 'segmented-contained' | 'underline-tabs'; adornment: 'text-only' | 'icon-when-clarifying' | 'count-when-useful' }
export type TogglePolicy = { treatment: 'switch-control' | 'segmented-binary'; labelPolicy: 'visible-label' | 'label-plus-state-text' }
export type CheckboxPolicy = { groupLayout: 'stacked-list' | 'inline-compact'; choiceSurface: 'plain-label' | 'row-surface' | 'bordered-choice-row'; mixedState: 'show-indeterminate' | 'avoid-parent-checkbox' }
export type RadioGroupPolicy = { treatment: 'visible-label-radio-group' }
export type SearchListPolicy = 'standard-search-list'
export type FormSectionPolicy = 'grouped-form-section'
export type UiContract = {
  schemaVersion: '0.4.0'
  meta: { name: string; description: string }
  product: { systemType: string; informationDensity: string; visualTone: string }
  designPolicy: { brandIdentity: BrandIdentityPolicy; colorProfileId: ActiveColorProfileId; color: ColorPolicy }
  interactionPolicy: { focus: { visibility: FocusVisibility; indicatorStyle: FocusIndicatorStyle }; validation: { trigger: ValidationTrigger; presentation: ValidationPresentation }; availability: { treatment: AvailabilityTreatment; layout: AvailabilityLayout }; confirmation: { surface: ConfirmationSurface; scope: ConfirmationScope }; loading: { feedback: 'communicate-busy-state' }; stateFeedback: { guidance: 'explain-condition-and-next-step' } }
  componentPolicy: { button: { primaryEmphasis: PrimaryEmphasis; secondaryEmphasis: SecondaryEmphasis; dangerPlacement: DangerPlacement; dangerEmphasis: DangerEmphasis; iconAdornment: IconAdornment; iconOnlyPolicy: IconOnlyPolicy }; textField: { fieldStyle: TextFieldStyle; labelPlacement: TextFieldLabelPlacement; requiredIndicator: TextFieldRequiredIndicator; messageAreaBehavior: TextFieldMessageAreaBehavior; placeholderUsage: TextFieldPlaceholderUsage }; select: SelectPolicy; tabs: TabsPolicy; toggle: TogglePolicy; checkbox: CheckboxPolicy; radioGroup: RadioGroupPolicy; card: { treatment: CardTreatment; interaction: CardInteraction }; sidePanel: { relationship: SidePanelRelationship; responsive: SidePanelResponsive } }
  screenPatternPolicy: { searchList: SearchListPolicy; formSection: FormSectionPolicy }
}
export type ImportOutcome = 'valid' | 'migrated' | 'accepted-with-ignored-unknown-fields' | 'invalid' | 'unsupported-version'
export type ImportResult = { outcome: ImportOutcome; diagnostics: string[]; contract?: UiContract }
