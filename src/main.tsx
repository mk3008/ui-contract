import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  ChevronRight,
  FileJson,
  FolderOpen,
  LoaderCircle,
  Moon,
  PanelLeft,
  Plus,
  Save,
  Sun,
  FileCode2,
} from 'lucide-react'
import overviewContentSource from './content/overview-content.json'
import {
  CheckboxPreviewStage,
  CheckboxSectionedContractPanel,
  TabsPreviewStage,
  TabsSectionedContractPanel,
  TogglePreviewStage,
  ToggleSectionedContractPanel,
  checkboxChoiceSurfaceOptions,
  checkboxGroupLayoutOptions,
  checkboxMixedStateOptions,
  tabsAdornmentOptions,
  tabsTreatmentOptions,
  toggleLabelPolicyOptions,
  toggleTreatmentOptions,
  type CheckboxPolicy,
  type TabsPolicy,
  type TogglePolicy,
} from './control-contracts'
import {
  SelectPreviewStage,
  SelectSectionedContractPanel,
  selectMultiSelectedItemDisplayOptions,
  type SelectPolicy,
} from './select-contract'
import './styles.css'

declare global {
  var uiContractEditorRoot: Root | undefined
}

type Theme = 'light' | 'dark'
type OverviewLanguage = 'ja' | 'en'
type OverviewSection = {
  eyebrow: string
  title: string
  body: string
  items?: string[]
}
type OverviewContent = {
  languageLabel: string
  translationNote: string
  tagline: string
  title: string
  lead: string
  keywords: string[]
  sections: OverviewSection[]
}
type MenuItem =
  | 'Overview'
  | 'Contract Editor / Button'
  | 'Contract Editor / Text Field'
  | 'Contract Editor / Focus'
  | 'Contract Editor / Validation'
  | 'Contract Editor / Availability'
  | 'Contract Editor / Select'
  | 'Contract Editor / Tabs'
  | 'Contract Editor / Toggle'
  | 'Contract Editor / Checkbox'
  | 'Contract Editor / Card'
  | 'Contract Editor / Side Panel'
  | 'Contract Editor / Confirmation'
  | 'Color Settings'
  | 'Screen Patterns'
  | 'Settings'
type MenuStatus = 'active' | 'placeholder'
type MenuEntry = {
  label: string
  page?: MenuItem
  status: MenuStatus
  children?: Array<{
    label: string
    page: MenuItem
    status: MenuStatus
  }>
}
type PrimaryEmphasis = 'filled' | 'tonal' | 'outline'
type SecondaryEmphasis = 'outline' | 'neutral-filled' | 'tonal'
type DangerPlacement = 'separated' | 'inline'
type DangerEmphasis = 'low-emphasis' | 'quiet-outline' | 'strong-danger'
type IconAdornment = 'text-only-default' | 'icons-when-clarifying'
type IconOnlyPolicy = 'avoid-icon-only' | 'allow-recognizable-with-accessible-name'
type TextFieldStyle = 'outlined' | 'filled'
type TextFieldLabelPlacement = 'top' | 'side-left' | 'side-right'
type TextFieldRequiredIndicator =
  | 'mark-optional'
  | 'mark-required-default'
  | 'mark-required-danger'
type TextFieldMessageAreaBehavior = 'reserved-message-area' | 'dynamic-message-area'
type TextFieldPlaceholderUsage = 'avoid-placeholder' | 'format-example-only'
type FocusVisibility = 'keyboard-and-active-inputs' | 'all-focused-controls'
type FocusIndicatorStyle = 'outer-ring' | 'high-contrast-highlight'
type ValidationTrigger = 'submit-or-step' | 'blur-after-edit'
type ValidationPresentation = 'field-and-summary' | 'field-message-only'
type AvailabilityTreatment =
  | 'keep-enabled-explain-on-action'
  | 'readonly-for-fixed-values'
  | 'disabled-when-impossible'
  | 'hidden-when-not-applicable'
type AvailabilityLayout = 'preserve-space-for-temporary-state' | 'allow-reflow-when-not-applicable'
type CardTreatment = 'outlined-card' | 'filled-card' | 'elevated-card'
type CardInteraction = 'static-card' | 'clickable-card' | 'selectable-card'
type SidePanelRelationship = 'persistent-inspector' | 'temporary-drawer'
type SidePanelResponsive = 'collapse-to-toggle' | 'full-screen-sheet'
type ConfirmationSurface = 'danger-dialog' | 'typed-confirmation' | 'undo-when-reversible'
type ConfirmationScope = 'destructive-only' | 'destructive-bulk-unsaved'
type ContractEditorComponent =
  | 'button'
  | 'textField'
  | 'focus'
  | 'validation'
  | 'availability'
  | 'select'
  | 'tabs'
  | 'toggle'
  | 'checkbox'
  | 'card'
  | 'sidePanel'
  | 'confirmation'
type ColorProfileId =
  | 'default'
  | 'deep-slate-blue'
  | 'enterprise-blue'
  | 'productivity-indigo'
  | 'trust-green'
  | 'teal-operations'
  | 'neutral-graphite'
  | 'corporate-red'
  | 'operations-orange'
  | 'office-neutral'
  | 'financial-navy'
  | 'horizon-cyan'
type ActiveColorProfileId = ColorProfileId | 'custom'
type ColorModeKey = 'light' | 'dark'
type ColorRoleKey =
  | 'brandBackground'
  | 'brandText'
  | 'primary'
  | 'primaryText'
  | 'secondary'
  | 'secondaryText'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'focusOuter'
  | 'focusInner'
  | 'background'
  | 'surface'
  | 'surfaceSoft'
  | 'border'
  | 'text'
  | 'mutedText'

type ColorPolicy = Record<ColorModeKey, Record<ColorRoleKey, string>>

type BrandIdentityPolicy = {
  mark: string
  markBackground: string
  markBorder: string
}

type ColorProfile = {
  brandIdentity: BrandIdentityPolicy
  color: ColorPolicy
  description: string
  id: ColorProfileId
  name: string
}

type UiContract = {
  schemaVersion: string
  meta: {
    name: string
    description: string
  }
  product: {
    systemType: string
    informationDensity: string
    visualTone: string
  }
  designPolicy: {
    brandIdentity: BrandIdentityPolicy
    colorProfileId: ActiveColorProfileId
    color: ColorPolicy
  }
  interactionPolicy: {
    focus: {
      visibility: FocusVisibility
      indicatorStyle: FocusIndicatorStyle
    }
    validation: {
      trigger: ValidationTrigger
      presentation: ValidationPresentation
    }
    availability: {
      treatment: AvailabilityTreatment
      layout: AvailabilityLayout
    }
    confirmation: {
      surface: ConfirmationSurface
      scope: ConfirmationScope
    }
  }
  componentPolicy: {
    button: {
      primaryEmphasis: PrimaryEmphasis
      secondaryEmphasis: SecondaryEmphasis
      dangerPlacement: DangerPlacement
      dangerEmphasis: DangerEmphasis
      iconAdornment: IconAdornment
      iconOnlyPolicy: IconOnlyPolicy
    }
    textField: {
      fieldStyle: TextFieldStyle
      labelPlacement: TextFieldLabelPlacement
      requiredIndicator: TextFieldRequiredIndicator
      messageAreaBehavior: TextFieldMessageAreaBehavior
      placeholderUsage: TextFieldPlaceholderUsage
    }
    select: {
      emptyDisplay: SelectPolicy['emptyDisplay']
      multiSelectedItemDisplay: SelectPolicy['multiSelectedItemDisplay']
      multiRemoveAffordance: SelectPolicy['multiRemoveAffordance']
      searchFieldTreatment: SelectPolicy['searchFieldTreatment']
    }
    tabs: TabsPolicy
    toggle: TogglePolicy
    checkbox: CheckboxPolicy
    card: {
      treatment: CardTreatment
      interaction: CardInteraction
    }
    sidePanel: {
      relationship: SidePanelRelationship
      responsive: SidePanelResponsive
    }
  }
}

type LoadedFile = {
  name: string
  loadedAt: string
}

const defaultColorPolicy: ColorPolicy = {
      light: {
        brandBackground: '#eff6ff',
        brandText: '#172554',
        primary: '#2563eb',
        primaryText: '#ffffff',
        secondary: '#475569',
        secondaryText: '#ffffff',
        success: '#15803d',
        warning: '#b45309',
        danger: '#b91c1c',
        info: '#0f766e',
        focusOuter: '#111827',
        focusInner: '#facc15',
        background: '#f1f5f9',
        surface: '#ffffff',
        surfaceSoft: '#f8fafc',
        border: '#cbd5e1',
        text: '#0f172a',
        mutedText: '#64748b',
      },
      dark: {
        brandBackground: '#020617',
        brandText: '#f8fafc',
        primary: '#60a5fa',
        primaryText: '#0f172a',
        secondary: '#94a3b8',
        secondaryText: '#0f172a',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#2dd4bf',
        focusOuter: '#facc15',
        focusInner: '#111827',
        background: '#0f172a',
        surface: '#111827',
        surfaceSoft: '#1f2937',
        border: '#334155',
        text: '#f8fafc',
        mutedText: '#cbd5e1',
      },
}

const defaultBrandIdentity: BrandIdentityPolicy = {
  mark: '#2563eb',
  markBackground: '#ffffff',
  markBorder: '#cbd5e1',
}

const colorProfiles: ColorProfile[] = [
  {
    id: 'default',
    name: 'Default Slate Blue',
    description: 'General blue.',
    brandIdentity: defaultBrandIdentity,
    color: defaultColorPolicy,
  },
  {
    id: 'deep-slate-blue',
    name: 'Deep Slate Blue',
    description: 'Dark header, blue actions.',
    brandIdentity: { mark: '#0f172a', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#0f172a',
      lightBrandText: '#ffffff',
      lightPrimary: '#2563eb',
      lightSecondary: '#475569',
      lightInfo: '#0f766e',
      lightSuccess: '#047857',
      lightWarning: '#b45309',
      lightDanger: '#b91c1c',
      lightBackground: '#f4f7fb',
      lightSurface: '#ffffff',
      lightSurfaceSoft: '#f8fafc',
      lightBorder: '#d8e2ef',
      lightText: '#0f172a',
      lightMutedText: '#64748b',
      darkBrandBackground: '#020617',
      darkBrandText: '#f8fafc',
      darkPrimary: '#60a5fa',
      darkPrimaryText: '#0f172a',
      darkSecondary: '#94a3b8',
      darkInfo: '#2dd4bf',
      darkSuccess: '#4ade80',
      darkWarning: '#fbbf24',
      darkDanger: '#f87171',
      darkBackground: '#0f172a',
      darkSurface: '#111827',
      darkSurfaceSoft: '#1f2937',
      darkBorder: '#334155',
      darkText: '#f8fafc',
      darkMutedText: '#cbd5e1',
    }),
  },
  {
    id: 'corporate-red',
    name: 'Corporate Red',
    description: 'Red brand.',
    brandIdentity: { mark: '#dc2626', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#fef2f2',
      lightBrandText: '#450a0a',
      lightPrimary: '#0066cc',
      lightSecondary: '#57534e',
      lightInfo: '#0369a1',
      lightDanger: '#991b1b',
      darkBrandBackground: '#450a0a',
      darkPrimary: '#92c5f9',
      darkPrimaryText: '#032142',
      darkSecondary: '#a8a29e',
      darkInfo: '#38bdf8',
      darkDanger: '#f87171',
    }),
  },
  {
    id: 'operations-orange',
    name: 'Operations Orange',
    description: 'Orange brand.',
    brandIdentity: { mark: '#fc6d26', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#fff7ed',
      lightBrandText: '#431407',
      lightPrimary: '#1f75cb',
      lightSecondary: '#45424d',
      lightInfo: '#0f766e',
      lightWarning: '#ab6100',
      darkBrandBackground: '#2a160d',
      darkBrandText: '#fff7ed',
      darkPrimary: '#63a6e9',
      darkPrimaryText: '#1d283e',
      darkSecondary: '#a2a1a6',
      darkInfo: '#2dd4bf',
      darkWarning: '#e9be74',
    }),
  },
  {
    id: 'trust-green',
    name: 'Trust Green',
    description: 'Stable green.',
    brandIdentity: { mark: '#15803d', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#ecfdf3',
      lightBrandText: '#052e16',
      lightPrimary: '#2563eb',
      lightSecondary: '#4b5563',
      lightInfo: '#0f766e',
      darkBrandBackground: '#052e16',
      darkPrimary: '#60a5fa',
      darkPrimaryText: '#0f172a',
      darkSecondary: '#9ca3af',
      darkInfo: '#2dd4bf',
    }),
  },
  {
    id: 'teal-operations',
    name: 'Teal Operations',
    description: 'Teal tools.',
    brandIdentity: { mark: '#0f766e', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#f0fdfa',
      lightBrandText: '#042f2e',
      lightPrimary: '#0f766e',
      lightSecondary: '#475569',
      lightInfo: '#0369a1',
      darkBrandBackground: '#042f2e',
      darkPrimary: '#2dd4bf',
      darkSecondary: '#94a3b8',
      darkInfo: '#38bdf8',
    }),
  },
  {
    id: 'horizon-cyan',
    name: 'Horizon Cyan',
    description: 'Clean cyan.',
    brandIdentity: { mark: '#0891b2', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#ecfeff',
      lightBrandText: '#164e63',
      lightPrimary: '#0e7490',
      lightSecondary: '#475569',
      lightInfo: '#0284c7',
      darkBrandBackground: '#083344',
      darkBrandText: '#cffafe',
      darkPrimary: '#67e8f9',
      darkPrimaryText: '#164e63',
      darkSecondary: '#94a3b8',
      darkInfo: '#38bdf8',
    }),
  },
  {
    id: 'enterprise-blue',
    name: 'Enterprise Blue',
    description: 'Clear blue.',
    brandIdentity: { mark: '#0f62fe', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#edf5ff',
      lightBrandText: '#001d6c',
      lightPrimary: '#0f62fe',
      lightSecondary: '#525252',
      lightInfo: '#0072c3',
      darkBrandBackground: '#000000',
      darkPrimary: '#78a9ff',
      darkSecondary: '#c6c6c6',
      darkInfo: '#33b1ff',
    }),
  },
  {
    id: 'financial-navy',
    name: 'Financial Navy',
    description: 'Conservative navy.',
    brandIdentity: { mark: '#1e3a8a', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#eff6ff',
      lightBrandText: '#172554',
      lightPrimary: '#1d4ed8',
      lightSecondary: '#334155',
      lightInfo: '#0369a1',
      darkBrandBackground: '#0f172a',
      darkBrandText: '#dbeafe',
      darkPrimary: '#93c5fd',
      darkPrimaryText: '#172554',
      darkSecondary: '#94a3b8',
      darkInfo: '#38bdf8',
    }),
  },
  {
    id: 'productivity-indigo',
    name: 'Productivity Indigo',
    description: 'Indigo work.',
    brandIdentity: { mark: '#4f46e5', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#eef2ff',
      lightBrandText: '#312e81',
      lightPrimary: '#4f46e5',
      lightSecondary: '#64748b',
      lightInfo: '#2563eb',
      darkBrandBackground: '#111827',
      darkPrimary: '#818cf8',
      darkSecondary: '#94a3b8',
      darkInfo: '#60a5fa',
    }),
  },
  {
    id: 'neutral-graphite',
    name: 'Neutral Graphite',
    description: 'Graphite.',
    brandIdentity: { mark: '#3b82f6', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#f4f4f5',
      lightBrandText: '#18181b',
      lightPrimary: '#334155',
      lightSecondary: '#64748b',
      lightInfo: '#2563eb',
      darkBrandBackground: '#09090b',
      darkPrimary: '#cbd5e1',
      darkPrimaryText: '#0f172a',
      darkSecondary: '#94a3b8',
      darkInfo: '#60a5fa',
    }),
  },
  {
    id: 'office-neutral',
    name: 'Office Neutral',
    description: 'Low color.',
    brandIdentity: { mark: '#475569', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#f8fafc',
      lightBrandText: '#0f172a',
      lightPrimary: '#334155',
      lightSecondary: '#64748b',
      lightInfo: '#2563eb',
      darkBrandBackground: '#111827',
      darkBrandText: '#f8fafc',
      darkPrimary: '#cbd5e1',
      darkPrimaryText: '#0f172a',
      darkSecondary: '#94a3b8',
      darkInfo: '#60a5fa',
    }),
  },
]

const sampleContract: UiContract = {
  schemaVersion: '0.1.0',
  meta: {
    name: 'Business UI Contract',
    description: 'Button policy prototype for the UI Contract Editor.',
  },
  product: {
    systemType: 'business-admin',
    informationDensity: 'compact',
    visualTone: 'calm',
  },
  designPolicy: {
    brandIdentity: defaultBrandIdentity,
    colorProfileId: 'default',
    color: defaultColorPolicy,
  },
  interactionPolicy: {
    focus: {
      visibility: 'keyboard-and-active-inputs',
      indicatorStyle: 'outer-ring',
    },
    validation: {
      trigger: 'submit-or-step',
      presentation: 'field-and-summary',
    },
    availability: {
      treatment: 'keep-enabled-explain-on-action',
      layout: 'preserve-space-for-temporary-state',
    },
    confirmation: {
      surface: 'danger-dialog',
      scope: 'destructive-only',
    },
  },
  componentPolicy: {
    button: {
      primaryEmphasis: 'filled',
      secondaryEmphasis: 'outline',
      dangerPlacement: 'separated',
      dangerEmphasis: 'quiet-outline',
      iconAdornment: 'text-only-default',
      iconOnlyPolicy: 'avoid-icon-only',
    },
    textField: {
      fieldStyle: 'outlined',
      labelPlacement: 'top',
      requiredIndicator: 'mark-optional',
      messageAreaBehavior: 'reserved-message-area',
      placeholderUsage: 'avoid-placeholder',
    },
    select: {
      emptyDisplay: 'placeholder-text',
      multiSelectedItemDisplay: 'chips',
      multiRemoveAffordance: 'chip-remove-button',
      searchFieldTreatment: 'embedded-search-field',
    },
    tabs: {
      treatment: 'segmented-contained',
      adornment: 'text-only',
    },
    toggle: {
      treatment: 'switch-control',
      labelPolicy: 'visible-label',
    },
    checkbox: {
      groupLayout: 'stacked-list',
      choiceSurface: 'plain-label',
      mixedState: 'show-indeterminate',
    },
    card: {
      treatment: 'outlined-card',
      interaction: 'static-card',
    },
    sidePanel: {
      relationship: 'persistent-inspector',
      responsive: 'collapse-to-toggle',
    },
  },
}

const menuItems: MenuEntry[] = [
  { label: 'Overview', page: 'Overview', status: 'active' },
  {
    label: 'Contract Editor',
    status: 'active',
    children: [
      { label: 'Button', page: 'Contract Editor / Button', status: 'active' },
      { label: 'Text Field', page: 'Contract Editor / Text Field', status: 'active' },
      { label: 'Select', page: 'Contract Editor / Select', status: 'active' },
      { label: 'Tabs', page: 'Contract Editor / Tabs', status: 'active' },
      { label: 'Toggle', page: 'Contract Editor / Toggle', status: 'active' },
      { label: 'Checkbox', page: 'Contract Editor / Checkbox', status: 'active' },
      { label: 'Card', page: 'Contract Editor / Card', status: 'active' },
      { label: 'Side Panel', page: 'Contract Editor / Side Panel', status: 'active' },
      { label: 'Focus', page: 'Contract Editor / Focus', status: 'active' },
      { label: 'Validation', page: 'Contract Editor / Validation', status: 'active' },
      { label: 'Availability', page: 'Contract Editor / Availability', status: 'active' },
      { label: 'Confirmation', page: 'Contract Editor / Confirmation', status: 'active' },
    ],
  },
  { label: 'Color Settings', page: 'Color Settings', status: 'active' },
  { label: 'Screen Patterns', page: 'Screen Patterns', status: 'active' },
  { label: 'Settings', page: 'Settings', status: 'placeholder' },
]

const primaryEmphasisOptions: Array<{ value: PrimaryEmphasis; label: string; note: string }> = [
  { value: 'filled', label: 'Filled', note: 'Primary actions are visually strongest.' },
  { value: 'tonal', label: 'Tonal', note: 'Primary actions are clear but quieter.' },
  { value: 'outline', label: 'Outline', note: 'Primary actions avoid heavy emphasis.' },
]

const secondaryEmphasisOptions: Array<{ value: SecondaryEmphasis; label: string; note: string }> = [
  { value: 'outline', label: 'Outline', note: 'Secondary actions remain visible.' },
  { value: 'neutral-filled', label: 'Neutral filled', note: 'Secondary actions keep a clear button shape.' },
  { value: 'tonal', label: 'Tonal', note: 'Secondary actions get a soft surface.' },
]

const dangerPlacementOptions: Array<{ value: DangerPlacement; label: string; note: string }> = [
  { value: 'separated', label: 'Separated', note: 'Keep danger actions away from normal actions.' },
  { value: 'inline', label: 'Inline', note: 'Allow danger actions near related actions.' },
]

const dangerEmphasisOptions: Array<{ value: DangerEmphasis; label: string; note: string }> = [
  { value: 'low-emphasis', label: 'Low emphasis', note: 'Lowest visual weight for destructive actions.' },
  { value: 'quiet-outline', label: 'Quiet outline', note: 'Visible destructive action without primary weight.' },
  { value: 'strong-danger', label: 'Strong danger', note: 'Strong destructive action for required destructive steps.' },
]

const iconAdornmentOptions: Array<{ value: IconAdornment; label: string; note: string }> = [
  { value: 'text-only-default', label: 'Text first', note: 'Do not add icons to labeled buttons by default.' },
  {
    value: 'icons-when-clarifying',
    label: 'Clarifying icons',
    note: 'Add icons only when they make the labeled action clearer.',
  },
]

const iconOnlyPolicyOptions: Array<{ value: IconOnlyPolicy; label: string; note: string }> = [
  {
    value: 'avoid-icon-only',
    label: 'Avoid icon-only',
    note: 'Prefer visible text for ordinary business actions.',
  },
  {
    value: 'allow-recognizable-with-accessible-name',
    label: 'Constrained icon-only',
    note: 'Allow only recognizable, space-limited actions with an accessible name.',
  },
]

const focusVisibilityOptions: Array<{ value: FocusVisibility; label: string; note: string }> = [
  {
    value: 'keyboard-and-active-inputs',
    label: 'Keyboard focus only',
    note: 'Show rings for keyboard navigation; pointer focus stays quiet.',
  },
  {
    value: 'all-focused-controls',
    label: 'Keyboard + pointer focus',
    note: 'Show rings for keyboard and mouse-click focus.',
  },
]

const focusIndicatorStyleOptions: Array<{ value: FocusIndicatorStyle; label: string; note: string }> = [
  {
    value: 'outer-ring',
    label: 'Outer ring',
    note: 'Offset ring preserves the control shape and border.',
  },
  {
    value: 'high-contrast-highlight',
    label: 'High contrast',
    note: 'Bold focus treatment for accessibility-critical apps.',
  },
]

const validationTriggerOptions: Array<{ value: ValidationTrigger; label: string; note: string }> = [
  {
    value: 'submit-or-step',
    label: 'Submit or step',
    note: 'Show validation after submit or moving to the next step.',
  },
  {
    value: 'blur-after-edit',
    label: 'After field exit',
    note: 'Validate after the user edits a field and leaves it.',
  },
]

const validationPresentationOptions: Array<{ value: ValidationPresentation; label: string; note: string }> = [
  {
    value: 'field-and-summary',
    label: 'Field + summary',
    note: 'Show field errors and a page-level error summary.',
  },
  {
    value: 'field-message-only',
    label: 'Field message only',
    note: 'Show errors beside the relevant field.',
  },
]

const availabilityTreatmentOptions: Array<{ value: AvailabilityTreatment; label: string; note: string }> = [
  {
    value: 'keep-enabled-explain-on-action',
    label: 'Keep enabled',
    note: 'Let the action explain missing requirements when used.',
  },
  {
    value: 'readonly-for-fixed-values',
    label: 'Read-only',
    note: 'Show values that can be reviewed but not changed.',
  },
  {
    value: 'disabled-when-impossible',
    label: 'Disabled',
    note: 'Disable only when the control truly cannot be used.',
  },
  {
    value: 'hidden-when-not-applicable',
    label: 'Hidden',
    note: 'Remove controls that do not apply in the current context.',
  },
]

const availabilityLayoutOptions: Array<{ value: AvailabilityLayout; label: string; note: string }> = [
  {
    value: 'preserve-space-for-temporary-state',
    label: 'Preserve',
    note: 'Keep temporary unavailable controls from shifting layout.',
  },
  {
    value: 'allow-reflow-when-not-applicable',
    label: 'Reflow',
    note: 'Let layout close gaps when controls are not applicable.',
  },
]

const cardTreatmentOptions: Array<{ value: CardTreatment; label: string; note: string }> = [
  {
    value: 'outlined-card',
    label: 'Outlined',
    note: 'Use a border to group related content without adding depth.',
  },
  {
    value: 'filled-card',
    label: 'Filled',
    note: 'Use a quiet surface when cards sit on a plain background.',
  },
  {
    value: 'elevated-card',
    label: 'Elevated',
    note: 'Use shadow only when layered content needs separation.',
  },
]

const cardInteractionOptions: Array<{ value: CardInteraction; label: string; note: string }> = [
  {
    value: 'static-card',
    label: 'Static content',
    note: 'Cards group information; actions remain explicit controls.',
  },
  {
    value: 'clickable-card',
    label: 'Clickable card',
    note: 'The whole card opens one target; avoid nested primary actions.',
  },
  {
    value: 'selectable-card',
    label: 'Selectable card',
    note: 'Show selected state clearly when cards behave like choices.',
  },
]

const sidePanelRelationshipOptions: Array<{ value: SidePanelRelationship; label: string; note: string }> = [
  {
    value: 'persistent-inspector',
    label: 'Persistent inspector',
    note: 'Keep companion details beside the main work area.',
  },
  {
    value: 'temporary-drawer',
    label: 'Temporary drawer',
    note: 'Open supporting details only when the user asks for them.',
  },
]

const sidePanelResponsiveOptions: Array<{ value: SidePanelResponsive; label: string; note: string }> = [
  {
    value: 'collapse-to-toggle',
    label: 'Collapse to toggle',
    note: 'Keep the main task visible and expose the panel from a control.',
  },
  {
    value: 'full-screen-sheet',
    label: 'Full-screen sheet',
    note: 'Let the panel take the screen when side-by-side space is gone.',
  },
]

const confirmationSurfaceOptions: Array<{ value: ConfirmationSurface; label: string; note: string }> = [
  {
    value: 'danger-dialog',
    label: 'Danger dialog',
    note: 'Interrupt destructive actions with an explicit confirmation.',
  },
  {
    value: 'typed-confirmation',
    label: 'Typed confirmation',
    note: 'Require typed intent for rare, high-impact destructive actions.',
  },
  {
    value: 'undo-when-reversible',
    label: 'Undo when reversible',
    note: 'Prefer undo feedback when the action can be safely reversed.',
  },
]

const confirmationScopeOptions: Array<{ value: ConfirmationScope; label: string; note: string }> = [
  {
    value: 'destructive-only',
    label: 'Destructive only',
    note: 'Confirm destructive or irreversible actions.',
  },
  {
    value: 'destructive-bulk-unsaved',
    label: 'Destructive + bulk',
    note: 'Also cover bulk actions and leaving unsaved work.',
  },
]

const overviewContent = overviewContentSource as Record<OverviewLanguage, OverviewContent>

const textFieldStyleOptions: Array<{ value: TextFieldStyle; label: string; note: string }> = [
  { value: 'outlined', label: 'Outlined', note: 'Clear field boundary for forms.' },
  { value: 'filled', label: 'Filled', note: 'Soft field surface for dense screens.' },
]

const textFieldLabelPlacementOptions: Array<{
  value: TextFieldLabelPlacement
  label: string
  note: string
}> = [
  { value: 'top', label: 'Top label', note: 'Most readable default.' },
  { value: 'side-right', label: 'Side right', note: 'Side label kept close to the field.' },
  { value: 'side-left', label: 'Side left', note: 'Side labels share one visual start line.' },
]

const textFieldRequiredIndicatorOptions: Array<{
  value: TextFieldRequiredIndicator
  label: string
  note: string
}> = [
  { value: 'mark-optional', label: 'Mark optional', note: 'Required is the default assumption.' },
  {
    value: 'mark-required-default',
    label: 'Required mark default',
    note: 'Use the normal text color for required marks.',
  },
  {
    value: 'mark-required-danger',
    label: 'Required mark danger',
    note: 'Use the danger color for required marks.',
  },
]

const textFieldMessageAreaBehaviorOptions: Array<{
  value: TextFieldMessageAreaBehavior
  label: string
  note: string
}> = [
  {
    value: 'reserved-message-area',
    label: 'Reserved message area',
    note: 'Keeps helper and error placement stable.',
  },
  {
    value: 'dynamic-message-area',
    label: 'Dynamic message area',
    note: 'Uses space only when guidance or validation appears.',
  },
]

const textFieldPlaceholderUsageOptions: Array<{
  value: TextFieldPlaceholderUsage
  label: string
  note: string
}> = [
  {
    value: 'avoid-placeholder',
    label: 'Avoid placeholder',
    note: 'Keep guidance in label or helper text.',
  },
  {
    value: 'format-example-only',
    label: 'Format example only',
    note: 'Use placeholder only for short examples or formats.',
  },
]

const colorRoleFields: Array<{ key: ColorRoleKey; group: string; label: string; note: string }> = [
  { key: 'brandBackground', group: 'Brand', label: 'Brand background', note: 'Header and product chrome.' },
  { key: 'brandText', group: 'Brand', label: 'Brand text', note: 'Text shown on brand background.' },
  { key: 'primary', group: 'Actions', label: 'Primary action', note: 'Main action and active control.' },
  { key: 'primaryText', group: 'Actions', label: 'Primary text', note: 'Text on primary action color.' },
  { key: 'secondary', group: 'Actions', label: 'Secondary action', note: 'Supporting action color.' },
  { key: 'secondaryText', group: 'Actions', label: 'Secondary text', note: 'Text on secondary action color.' },
  { key: 'success', group: 'Semantic', label: 'Success', note: 'Positive status and completed work.' },
  { key: 'warning', group: 'Semantic', label: 'Warning', note: 'Attention needed, not destructive.' },
  { key: 'danger', group: 'Semantic', label: 'Danger / error', note: 'Errors and destructive actions.' },
  { key: 'info', group: 'Semantic', label: 'Information', note: 'Neutral informational status.' },
  { key: 'focusOuter', group: 'Interaction', label: 'Focus outer', note: 'Outer edge of the focus indicator.' },
  { key: 'focusInner', group: 'Interaction', label: 'Focus inner', note: 'Contrast layer for focus indicators.' },
  { key: 'background', group: 'Neutral', label: 'Background', note: 'Page and workspace background.' },
  { key: 'surface', group: 'Neutral', label: 'Surface', note: 'Default panel background.' },
  { key: 'surfaceSoft', group: 'Neutral', label: 'Soft surface', note: 'Secondary panel and table background.' },
  { key: 'border', group: 'Neutral', label: 'Border', note: 'Rules, dividers, and panel borders.' },
  { key: 'text', group: 'Neutral', label: 'Text', note: 'Primary readable text color.' },
  { key: 'mutedText', group: 'Neutral', label: 'Muted text', note: 'Secondary labels and helper text.' },
]

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('ui-contract-theme') as Theme | null) ?? 'light'
  })
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>('Overview')
  const [contract, setContract] = useState<UiContract>(sampleContract)
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null)
  const [loadMessage, setLoadMessage] = useState('Using built-in sample contract.')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ui-contract-theme', theme)
  }, [theme])

  const contractText = useMemo(() => JSON.stringify(contract, null, 2), [contract])

  const buttonPolicy = contract.componentPolicy.button
  const textFieldPolicy = contract.componentPolicy.textField
  const selectPolicy = contract.componentPolicy.select
  const tabsPolicy = contract.componentPolicy.tabs
  const togglePolicy = contract.componentPolicy.toggle
  const checkboxPolicy = contract.componentPolicy.checkbox
  const cardPolicy = contract.componentPolicy.card
  const sidePanelPolicy = contract.componentPolicy.sidePanel
  const focusPolicy = contract.interactionPolicy.focus
  const validationPolicy = contract.interactionPolicy.validation
  const availabilityPolicy = contract.interactionPolicy.availability
  const confirmationPolicy = contract.interactionPolicy.confirmation
  const brandIdentity = contract.designPolicy.brandIdentity
  const colorPolicy = contract.designPolicy.color
  const colorProfileId = contract.designPolicy.colorProfileId
  const inspectorSourceText = loadedFile
    ? `Loaded: ${loadedFile.name} · ${loadedFile.loadedAt}`
    : loadMessage === 'Using built-in sample contract.'
      ? 'Built-in sample contract'
      : loadMessage

  const updateButtonPolicy = <Key extends keyof UiContract['componentPolicy']['button']>(
    key: Key,
    value: UiContract['componentPolicy']['button'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        button: {
          ...current.componentPolicy.button,
          [key]: value,
        },
      },
    }))
  }

  const updateTextFieldPolicy = <Key extends keyof UiContract['componentPolicy']['textField']>(
    key: Key,
    value: UiContract['componentPolicy']['textField'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        textField: {
          ...current.componentPolicy.textField,
          [key]: value,
        },
      },
    }))
  }

  const updateFocusPolicy = <Key extends keyof UiContract['interactionPolicy']['focus']>(
    key: Key,
    value: UiContract['interactionPolicy']['focus'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      interactionPolicy: {
        ...current.interactionPolicy,
        focus: {
          ...current.interactionPolicy.focus,
          [key]: value,
        },
      },
    }))
  }

  const updateValidationPolicy = <Key extends keyof UiContract['interactionPolicy']['validation']>(
    key: Key,
    value: UiContract['interactionPolicy']['validation'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      interactionPolicy: {
        ...current.interactionPolicy,
        validation: {
          ...current.interactionPolicy.validation,
          [key]: value,
        },
      },
    }))
  }

  const updateAvailabilityPolicy = <Key extends keyof UiContract['interactionPolicy']['availability']>(
    key: Key,
    value: UiContract['interactionPolicy']['availability'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      interactionPolicy: {
        ...current.interactionPolicy,
        availability: {
          ...current.interactionPolicy.availability,
          [key]: value,
        },
      },
    }))
  }

  const updateSelectPolicy = <Key extends keyof UiContract['componentPolicy']['select']>(
    key: Key,
    value: UiContract['componentPolicy']['select'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        select: {
          ...current.componentPolicy.select,
          [key]: value,
        },
      },
    }))
  }

  const updateConfirmationPolicy = <Key extends keyof UiContract['interactionPolicy']['confirmation']>(
    key: Key,
    value: UiContract['interactionPolicy']['confirmation'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      interactionPolicy: {
        ...current.interactionPolicy,
        confirmation: {
          ...current.interactionPolicy.confirmation,
          [key]: value,
        },
      },
    }))
  }

  const updateTabsPolicy = <Key extends keyof UiContract['componentPolicy']['tabs']>(
    key: Key,
    value: UiContract['componentPolicy']['tabs'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        tabs: {
          ...current.componentPolicy.tabs,
          [key]: value,
        },
      },
    }))
  }

  const updateTogglePolicy = <Key extends keyof UiContract['componentPolicy']['toggle']>(
    key: Key,
    value: UiContract['componentPolicy']['toggle'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        toggle: {
          ...current.componentPolicy.toggle,
          [key]: value,
        },
      },
    }))
  }

  const updateCheckboxPolicy = <Key extends keyof UiContract['componentPolicy']['checkbox']>(
    key: Key,
    value: UiContract['componentPolicy']['checkbox'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        checkbox: {
          ...current.componentPolicy.checkbox,
          [key]: value,
        },
      },
    }))
  }

  const updateCardPolicy = <Key extends keyof UiContract['componentPolicy']['card']>(
    key: Key,
    value: UiContract['componentPolicy']['card'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        card: {
          ...current.componentPolicy.card,
          [key]: value,
        },
      },
    }))
  }

  const updateSidePanelPolicy = <Key extends keyof UiContract['componentPolicy']['sidePanel']>(
    key: Key,
    value: UiContract['componentPolicy']['sidePanel'][Key],
  ) => {
    setContract((current) => ({
      ...current,
      componentPolicy: {
        ...current.componentPolicy,
        sidePanel: {
          ...current.componentPolicy.sidePanel,
          [key]: value,
        },
      },
    }))
  }

  const updateColorRole = (mode: ColorModeKey, key: ColorRoleKey, value: string) => {
    if (!isHexColor(value)) return
    setContract((current) => ({
      ...current,
      designPolicy: {
        ...current.designPolicy,
        colorProfileId: 'custom',
        color: {
          ...current.designPolicy.color,
          [mode]: {
            ...current.designPolicy.color[mode],
            [key]: value.toLowerCase(),
          },
        },
      },
    }))
  }

  const updateBrandIdentity = (key: keyof BrandIdentityPolicy, value: string) => {
    if (key === 'mark' && !isHexColor(value)) return
    if (key !== 'mark' && !isIdentitySurfaceValue(value)) return
    setContract((current) => ({
      ...current,
      designPolicy: {
        ...current.designPolicy,
        brandIdentity: {
          ...current.designPolicy.brandIdentity,
          [key]: value.toLowerCase(),
        },
        colorProfileId: 'custom',
      },
    }))
  }

  const applyColorProfile = (profileId: ColorProfileId) => {
    const profile = colorProfiles.find((item) => item.id === profileId)
    if (!profile) return

    setContract((current) => ({
      ...current,
      designPolicy: {
        ...current.designPolicy,
        brandIdentity: cloneBrandIdentity(profile.brandIdentity),
        colorProfileId: profile.id,
        color: cloneColorPolicy(profile.color),
      },
    }))
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const parsed = JSON.parse(content) as Partial<UiContract>
      setContract(normalizeContract(parsed))
      setLoadedFile({
        name: file.name,
        loadedAt: new Date().toLocaleString(),
      })
      setLoadMessage('Loaded JSON into the editable contract state.')
    } catch {
      setLoadMessage('Could not load this file as a UI Contract JSON.')
    } finally {
      event.target.value = ''
    }
  }

  const handleSave = () => {
    const blob = new Blob([contractText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = loadedFile?.name || 'ui-contract.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleSidebarToggle = () => {
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const restoreScroll = () => window.scrollTo(scrollX, scrollY)
    setIsSidebarOpen((current) => !current)
    window.requestAnimationFrame(() => {
      restoreScroll()
      window.requestAnimationFrame(restoreScroll)
      window.setTimeout(restoreScroll, 80)
    })
  }

  const isContractEditorPage =
    selectedMenu === 'Contract Editor / Button' ||
    selectedMenu === 'Contract Editor / Text Field' ||
    selectedMenu === 'Contract Editor / Select' ||
    selectedMenu === 'Contract Editor / Tabs' ||
    selectedMenu === 'Contract Editor / Toggle' ||
    selectedMenu === 'Contract Editor / Checkbox' ||
    selectedMenu === 'Contract Editor / Card' ||
    selectedMenu === 'Contract Editor / Side Panel' ||
    selectedMenu === 'Contract Editor / Confirmation' ||
    selectedMenu === 'Contract Editor / Focus' ||
    selectedMenu === 'Contract Editor / Validation' ||
    selectedMenu === 'Contract Editor / Availability'
  const selectedComponent: ContractEditorComponent =
    selectedMenu === 'Contract Editor / Text Field'
        ? 'textField'
        : selectedMenu === 'Contract Editor / Select'
          ? 'select'
          : selectedMenu === 'Contract Editor / Tabs'
            ? 'tabs'
            : selectedMenu === 'Contract Editor / Toggle'
              ? 'toggle'
              : selectedMenu === 'Contract Editor / Checkbox'
                ? 'checkbox'
                : selectedMenu === 'Contract Editor / Card'
                  ? 'card'
                  : selectedMenu === 'Contract Editor / Side Panel'
                    ? 'sidePanel'
                    : selectedMenu === 'Contract Editor / Confirmation'
                      ? 'confirmation'
                      : selectedMenu === 'Contract Editor / Focus'
                        ? 'focus'
                        : selectedMenu === 'Contract Editor / Validation'
                          ? 'validation'
                          : selectedMenu === 'Contract Editor / Availability'
                            ? 'availability'
        : 'button'
  const pageTitle =
    selectedMenu === 'Contract Editor / Button'
      ? 'Button Contract'
      : selectedMenu === 'Contract Editor / Text Field'
        ? 'Text Field Contract'
        : selectedMenu === 'Contract Editor / Select'
          ? 'Select Contract'
          : selectedMenu === 'Contract Editor / Tabs'
            ? 'Tabs Contract'
            : selectedMenu === 'Contract Editor / Toggle'
              ? 'Toggle Contract'
              : selectedMenu === 'Contract Editor / Checkbox'
                ? 'Checkbox Contract'
                : selectedMenu === 'Contract Editor / Card'
                  ? 'Card Contract'
                  : selectedMenu === 'Contract Editor / Side Panel'
                    ? 'Side Panel Contract'
                    : selectedMenu === 'Contract Editor / Confirmation'
                      ? 'Confirmation Policy'
                      : selectedMenu === 'Contract Editor / Focus'
                        ? 'Focus Policy'
                        : selectedMenu === 'Contract Editor / Validation'
                          ? 'Validation Policy'
                          : selectedMenu === 'Contract Editor / Availability'
                            ? 'Availability Policy'
                : selectedMenu
  const pageEyebrow = isContractEditorPage ? 'Contract Editor' : 'Main page'
  const pageStatus =
    isContractEditorPage || selectedMenu === 'Color Settings' || selectedMenu === 'Screen Patterns'
      ? 'Editable'
      : 'Placeholder'
  const isOverviewPage = selectedMenu === 'Overview'

  const renderMainContent = () => {
    if (isContractEditorPage) {
      return (
        <ContractEditorPanel
          brandIdentity={brandIdentity}
          availabilityPolicy={availabilityPolicy}
          buttonPolicy={buttonPolicy}
          cardPolicy={cardPolicy}
          checkboxPolicy={checkboxPolicy}
          colorPolicy={colorPolicy}
          confirmationPolicy={confirmationPolicy}
          focusPolicy={focusPolicy}
          selectPolicy={selectPolicy}
          selectedComponent={selectedComponent}
          sidePanelPolicy={sidePanelPolicy}
          tabsPolicy={tabsPolicy}
          textFieldPolicy={textFieldPolicy}
          theme={theme}
          togglePolicy={togglePolicy}
          validationPolicy={validationPolicy}
          onAvailabilityUpdate={updateAvailabilityPolicy}
          onButtonUpdate={updateButtonPolicy}
          onCardUpdate={updateCardPolicy}
          onCheckboxUpdate={updateCheckboxPolicy}
          onConfirmationUpdate={updateConfirmationPolicy}
          onFocusUpdate={updateFocusPolicy}
          onSelectUpdate={updateSelectPolicy}
          onSidePanelUpdate={updateSidePanelPolicy}
          onTabsUpdate={updateTabsPolicy}
          onTextFieldUpdate={updateTextFieldPolicy}
          onToggleUpdate={updateTogglePolicy}
          onValidationUpdate={updateValidationPolicy}
        />
      )
    }

    if (selectedMenu === 'Color Settings') {
      return (
        <ColorSettingsPanel
          brandIdentity={brandIdentity}
          colorPolicy={colorPolicy}
          colorProfileId={colorProfileId}
          onBrandIdentityUpdate={updateBrandIdentity}
          onProfileChange={applyColorProfile}
          onUpdate={updateColorRole}
        />
      )
    }

    if (selectedMenu === 'Screen Patterns') {
      return <ScreenPatternsPanel />
    }

    if (selectedMenu === 'Settings') {
      return <SettingsPanel theme={theme} onThemeChange={setTheme} />
    }

    return <OverviewPanel />
  }

  return (
    <div className={`app-shell ${isSidebarOpen ? '' : 'is-sidebar-collapsed'}`}>
      <header className="topbar">
        <div className="topbar-start">
          <button
            className="sidebar-toggle-button"
            onClick={handleSidebarToggle}
            type="button"
            aria-controls="main-sidebar"
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <PanelLeft size={19} />
          </button>

          <div className="brand">
            <div>
              <div className="brand-name">UI Contract Editor</div>
              <div className="brand-subtitle">Business UI rules</div>
            </div>
          </div>
        </div>

        <div className="topbar-title">
          <h1>Contract Workspace</h1>
          <p>Component and color policy are the first editable slices.</p>
        </div>

        <div className="topbar-actions">
          <input
            accept="application/json,.json"
            className="visually-hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <button className="toolbar-button" onClick={handleLoad} type="button">
            <FolderOpen size={17} />
            Load
          </button>
          <button className="toolbar-button" onClick={handleSave} type="button">
            <Save size={17} />
            Save
          </button>
          <button
            className={`icon-button ${isInspectorOpen ? 'is-active' : ''}`}
            onClick={() => setIsInspectorOpen((current) => !current)}
            type="button"
            aria-controls="contract-inspector"
            aria-expanded={isInspectorOpen}
            aria-label={isInspectorOpen ? 'Hide contract JSON' : 'Show contract JSON'}
            title={isInspectorOpen ? 'Hide contract JSON' : 'Show contract JSON'}
          >
            <FileCode2 size={18} />
          </button>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            type="button"
            aria-label="Switch theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <div className="app-body">
        {isSidebarOpen ? (
          <aside className="sidebar" id="main-sidebar" aria-label="Main menu">
            <nav className="menu-list">
              {menuItems.map((item) => {
                const isGroupActive =
                  item.children?.some((child) => child.page === selectedMenu) ??
                  item.page === selectedMenu
                const fallbackPage = item.page ?? item.children?.[0]?.page

                return (
                  <div className="menu-group" key={item.label}>
                    <button
                      className={`menu-item ${item.children ? 'is-parent' : ''} ${
                        isGroupActive && !item.children ? 'is-active' : ''
                      } ${isGroupActive && item.children ? 'is-group-active' : ''}`}
                      onClick={() => fallbackPage && setSelectedMenu(fallbackPage)}
                      type="button"
                    >
                      <span>{item.label}</span>
                      <span className="menu-meta">
                        {item.status === 'active' ? 'Now' : 'Soon'}
                        <ChevronRight size={15} />
                      </span>
                    </button>
                    {item.children ? (
                      <div className="submenu-list" aria-label={`${item.label} sections`}>
                        {item.children.map((child) => (
                          <button
                            className={`submenu-item ${
                              selectedMenu === child.page ? 'is-active' : ''
                            }`}
                            key={child.page}
                            onClick={() => setSelectedMenu(child.page)}
                            type="button"
                          >
                            <span>{child.label}</span>
                            <span className="menu-meta">
                              {child.status === 'active' ? 'Now' : 'Soon'}
                              <ChevronRight size={14} />
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </nav>

            <div className="sidebar-card">
              <div className="card-kicker">Current focus</div>
              <p>Component and color contract editing are wired to focused previews.</p>
            </div>
          </aside>
        ) : null}

        <main className="workspace">
          <section className={`content-grid ${isInspectorOpen ? '' : 'is-inspector-collapsed'}`}>
            <section className="main-panel">
              {!isOverviewPage ? (
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{pageEyebrow}</p>
                    <h2>{pageTitle}</h2>
                  </div>
                  <span className="state-pill">{pageStatus}</span>
                </div>
              ) : null}

              {renderMainContent()}

            </section>

            {isInspectorOpen ? (
              <aside className="inspector" id="contract-inspector">
                <div className="inspector-header">
                  <div>
                    <p className="eyebrow">Inspector</p>
                    <h2>Contract JSON</h2>
                    <p className="inspector-meta">{inspectorSourceText}</p>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setIsInspectorOpen(false)}
                    type="button"
                    aria-label="Hide contract JSON"
                  >
                    <FileJson size={20} />
                  </button>
                </div>

                <pre className="json-preview">{contractText}</pre>
              </aside>
            ) : null}
          </section>
        </main>
      </div>

    </div>
  )
}

function ContractEditorPanel({
  brandIdentity,
  availabilityPolicy,
  buttonPolicy,
  cardPolicy,
  checkboxPolicy,
  colorPolicy,
  confirmationPolicy,
  focusPolicy,
  selectPolicy,
  selectedComponent,
  sidePanelPolicy,
  tabsPolicy,
  textFieldPolicy,
  theme,
  togglePolicy,
  validationPolicy,
  onAvailabilityUpdate,
  onButtonUpdate,
  onCardUpdate,
  onCheckboxUpdate,
  onConfirmationUpdate,
  onFocusUpdate,
  onSelectUpdate,
  onSidePanelUpdate,
  onTabsUpdate,
  onTextFieldUpdate,
  onToggleUpdate,
  onValidationUpdate,
}: {
  brandIdentity: BrandIdentityPolicy
  availabilityPolicy: UiContract['interactionPolicy']['availability']
  buttonPolicy: UiContract['componentPolicy']['button']
  cardPolicy: UiContract['componentPolicy']['card']
  checkboxPolicy: UiContract['componentPolicy']['checkbox']
  colorPolicy: ColorPolicy
  confirmationPolicy: UiContract['interactionPolicy']['confirmation']
  focusPolicy: UiContract['interactionPolicy']['focus']
  selectPolicy: UiContract['componentPolicy']['select']
  selectedComponent: ContractEditorComponent
  sidePanelPolicy: UiContract['componentPolicy']['sidePanel']
  tabsPolicy: UiContract['componentPolicy']['tabs']
  textFieldPolicy: UiContract['componentPolicy']['textField']
  theme: Theme
  togglePolicy: UiContract['componentPolicy']['toggle']
  validationPolicy: UiContract['interactionPolicy']['validation']
  onAvailabilityUpdate: <Key extends keyof UiContract['interactionPolicy']['availability']>(
    key: Key,
    value: UiContract['interactionPolicy']['availability'][Key],
  ) => void
  onButtonUpdate: <Key extends keyof UiContract['componentPolicy']['button']>(
    key: Key,
    value: UiContract['componentPolicy']['button'][Key],
  ) => void
  onCardUpdate: <Key extends keyof UiContract['componentPolicy']['card']>(
    key: Key,
    value: UiContract['componentPolicy']['card'][Key],
  ) => void
  onCheckboxUpdate: <Key extends keyof UiContract['componentPolicy']['checkbox']>(
    key: Key,
    value: UiContract['componentPolicy']['checkbox'][Key],
  ) => void
  onConfirmationUpdate: <Key extends keyof UiContract['interactionPolicy']['confirmation']>(
    key: Key,
    value: UiContract['interactionPolicy']['confirmation'][Key],
  ) => void
  onFocusUpdate: <Key extends keyof UiContract['interactionPolicy']['focus']>(
    key: Key,
    value: UiContract['interactionPolicy']['focus'][Key],
  ) => void
  onSelectUpdate: <Key extends keyof UiContract['componentPolicy']['select']>(
    key: Key,
    value: UiContract['componentPolicy']['select'][Key],
  ) => void
  onSidePanelUpdate: <Key extends keyof UiContract['componentPolicy']['sidePanel']>(
    key: Key,
    value: UiContract['componentPolicy']['sidePanel'][Key],
  ) => void
  onTabsUpdate: <Key extends keyof UiContract['componentPolicy']['tabs']>(
    key: Key,
    value: UiContract['componentPolicy']['tabs'][Key],
  ) => void
  onTextFieldUpdate: <Key extends keyof UiContract['componentPolicy']['textField']>(
    key: Key,
    value: UiContract['componentPolicy']['textField'][Key],
  ) => void
  onToggleUpdate: <Key extends keyof UiContract['componentPolicy']['toggle']>(
    key: Key,
    value: UiContract['componentPolicy']['toggle'][Key],
  ) => void
  onValidationUpdate: <Key extends keyof UiContract['interactionPolicy']['validation']>(
    key: Key,
    value: UiContract['interactionPolicy']['validation'][Key],
  ) => void
}) {
  if (selectedComponent === 'select') {
    return (
      <SelectSectionedContractPanel
        selectPolicy={selectPolicy}
        onUpdate={onSelectUpdate}
      />
    )
  }

  if (selectedComponent === 'tabs') {
    return (
      <TabsSectionedContractPanel
        tabsPolicy={tabsPolicy}
        onUpdate={onTabsUpdate}
      />
    )
  }

  if (selectedComponent === 'toggle') {
    return (
      <ToggleSectionedContractPanel
        togglePolicy={togglePolicy}
        onUpdate={onToggleUpdate}
      />
    )
  }

  if (selectedComponent === 'checkbox') {
    return (
      <CheckboxSectionedContractPanel
        checkboxPolicy={checkboxPolicy}
        onUpdate={onCheckboxUpdate}
      />
    )
  }

  if (selectedComponent === 'card') {
    return (
      <CardContractPanel
        cardPolicy={cardPolicy}
        onUpdate={onCardUpdate}
      />
    )
  }

  if (selectedComponent === 'sidePanel') {
    return (
      <SidePanelContractPanel
        sidePanelPolicy={sidePanelPolicy}
        onUpdate={onSidePanelUpdate}
      />
    )
  }

  if (selectedComponent === 'confirmation') {
    return (
      <ConfirmationContractPanel
        confirmationPolicy={confirmationPolicy}
        onUpdate={onConfirmationUpdate}
      />
    )
  }

  if (selectedComponent === 'button') {
    return (
      <ButtonSectionedContractPanel
        buttonPolicy={buttonPolicy}
        onUpdate={onButtonUpdate}
      />
    )
  }

  if (selectedComponent === 'textField') {
    return (
      <TextFieldSectionedContractPanel
        textFieldPolicy={textFieldPolicy}
        onUpdate={onTextFieldUpdate}
      />
    )
  }

  if (selectedComponent === 'focus') {
    return (
      <FocusSectionedContractPanel
        focusPolicy={focusPolicy}
        onUpdate={onFocusUpdate}
      />
    )
  }

  if (selectedComponent === 'validation') {
    return (
      <ValidationSectionedContractPanel
        validationPolicy={validationPolicy}
        onUpdate={onValidationUpdate}
      />
    )
  }

  if (selectedComponent === 'availability') {
    return (
      <AvailabilitySectionedContractPanel
        availabilityPolicy={availabilityPolicy}
        onUpdate={onAvailabilityUpdate}
      />
    )
  }

  return (
    <div className="editor-panel">
      <div className="contract-workbench">
        <div className="contract-controls" />

        <ComponentPreviewPanel
          brandIdentity={brandIdentity}
          availabilityPolicy={availabilityPolicy}
          buttonPolicy={buttonPolicy}
          cardPolicy={cardPolicy}
          checkboxPolicy={checkboxPolicy}
          colorPolicy={colorPolicy}
          confirmationPolicy={confirmationPolicy}
          focusPolicy={focusPolicy}
          selectPolicy={selectPolicy}
          selectedComponent={selectedComponent}
          sidePanelPolicy={sidePanelPolicy}
          tabsPolicy={tabsPolicy}
          textFieldPolicy={textFieldPolicy}
          theme={theme}
          togglePolicy={togglePolicy}
          validationPolicy={validationPolicy}
        />
      </div>
    </div>
  )
}

function ButtonSectionedContractPanel({
  buttonPolicy,
  onUpdate,
}: {
  buttonPolicy: UiContract['componentPolicy']['button']
  onUpdate: <Key extends keyof UiContract['componentPolicy']['button']>(
    key: Key,
    value: UiContract['componentPolicy']['button'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Action intent"
        description="Choose visual weight for normal actions. Size remains product-owned."
        controls={
          <>
            <OptionGroup
              title="Primary emphasis"
              value={buttonPolicy.primaryEmphasis}
              options={primaryEmphasisOptions}
              onChange={(value) => onUpdate('primaryEmphasis', value)}
            />
            <OptionGroup
              title="Secondary emphasis"
              value={buttonPolicy.secondaryEmphasis}
              options={secondaryEmphasisOptions}
              onChange={(value) => onUpdate('secondaryEmphasis', value)}
            />
          </>
        }
        preview={<ButtonIntentPreview buttonPolicy={buttonPolicy} />}
      />

      <SelectLikePolicySection
        title="Danger action"
        description="Separate placement and emphasis so destructive actions stay understandable."
        controls={
          <>
            <OptionGroup
              title="Danger placement"
              value={buttonPolicy.dangerPlacement}
              options={dangerPlacementOptions}
              onChange={(value) => onUpdate('dangerPlacement', value)}
            />
            <OptionGroup
              title="Danger emphasis"
              value={buttonPolicy.dangerEmphasis}
              options={dangerEmphasisOptions}
              onChange={(value) => onUpdate('dangerEmphasis', value)}
            />
          </>
        }
        preview={<ButtonDangerPreview buttonPolicy={buttonPolicy} />}
      />

      <SelectLikePolicySection
        title="Icon usage"
        description="Keep labeled actions readable; icon-only actions need a clear accessible name."
        controls={
          <>
            <OptionGroup
              title="Icon adornment"
              value={buttonPolicy.iconAdornment}
              options={iconAdornmentOptions}
              onChange={(value) => onUpdate('iconAdornment', value)}
            />
            <OptionGroup
              title="Icon-only policy"
              value={buttonPolicy.iconOnlyPolicy}
              options={iconOnlyPolicyOptions}
              onChange={(value) => onUpdate('iconOnlyPolicy', value)}
            />
          </>
        }
        preview={<ButtonIconPreview buttonPolicy={buttonPolicy} />}
      />
    </div>
  )
}

function SelectLikePolicySection({
  controls,
  description,
  preview,
  title,
}: {
  controls: React.ReactNode
  description?: string
  preview: React.ReactNode
  title: string
}) {
  return (
    <section className="select-policy-section">
      <div className="select-policy-heading">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="select-policy-section-grid">
        <div className="select-policy-controls">
          <span className="select-column-label">Settings</span>
          {controls}
        </div>
        <div className="select-policy-preview">
          <span className="select-column-label">Preview</span>
          {preview}
        </div>
      </div>
    </section>
  )
}

function CardContractPanel({
  cardPolicy,
  onUpdate,
}: {
  cardPolicy: UiContract['componentPolicy']['card']
  onUpdate: <Key extends keyof UiContract['componentPolicy']['card']>(
    key: Key,
    value: UiContract['componentPolicy']['card'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Card treatment"
        description="Choose the container treatment for grouped content. Size and grid placement remain product-owned."
        controls={
          <OptionGroup
            title="Container treatment"
            value={cardPolicy.treatment}
            options={cardTreatmentOptions}
            onChange={(value) => onUpdate('treatment', value)}
          />
        }
        preview={<CardTreatmentPreview cardPolicy={cardPolicy} />}
      />

      <SelectLikePolicySection
        title="Card interaction"
        description="Define whether a card is only a content group, a single target, or a selectable choice."
        controls={
          <OptionGroup
            title="Interaction role"
            value={cardPolicy.interaction}
            options={cardInteractionOptions}
            onChange={(value) => onUpdate('interaction', value)}
          />
        }
        preview={<CardInteractionPreview cardPolicy={cardPolicy} />}
      />
    </div>
  )
}

function SidePanelContractPanel({
  sidePanelPolicy,
  onUpdate,
}: {
  sidePanelPolicy: UiContract['componentPolicy']['sidePanel']
  onUpdate: <Key extends keyof UiContract['componentPolicy']['sidePanel']>(
    key: Key,
    value: UiContract['componentPolicy']['sidePanel'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Panel relationship"
        description="Choose how supporting information relates to the main work area."
        controls={
          <OptionGroup
            title="Relationship"
            value={sidePanelPolicy.relationship}
            options={sidePanelRelationshipOptions}
            onChange={(value) => onUpdate('relationship', value)}
          />
        }
        preview={<SidePanelRelationshipPreview sidePanelPolicy={sidePanelPolicy} />}
      />

      <SelectLikePolicySection
        title="Small viewport fallback"
        description="Define what happens when side-by-side workspace is no longer usable."
        controls={
          <OptionGroup
            title="Responsive behavior"
            value={sidePanelPolicy.responsive}
            options={sidePanelResponsiveOptions}
            onChange={(value) => onUpdate('responsive', value)}
          />
        }
        preview={<SidePanelResponsivePreview sidePanelPolicy={sidePanelPolicy} />}
      />
    </div>
  )
}

function ConfirmationContractPanel({
  confirmationPolicy,
  onUpdate,
}: {
  confirmationPolicy: UiContract['interactionPolicy']['confirmation']
  onUpdate: <Key extends keyof UiContract['interactionPolicy']['confirmation']>(
    key: Key,
    value: UiContract['interactionPolicy']['confirmation'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Confirmation surface"
        description="Choose the default confirmation surface for risky actions. Button danger styling stays button-owned."
        controls={
          <OptionGroup
            title="Surface"
            value={confirmationPolicy.surface}
            options={confirmationSurfaceOptions}
            onChange={(value) => onUpdate('surface', value)}
          />
        }
        preview={<ConfirmationSurfacePreview confirmationPolicy={confirmationPolicy} />}
      />

      <SelectLikePolicySection
        title="Confirmation scope"
        description="Define which action classes should interrupt the flow."
        controls={
          <OptionGroup
            title="Scope"
            value={confirmationPolicy.scope}
            options={confirmationScopeOptions}
            onChange={(value) => onUpdate('scope', value)}
          />
        }
        preview={<ConfirmationScopePreview confirmationPolicy={confirmationPolicy} />}
      />
    </div>
  )
}

function CardTreatmentPreview({
  cardPolicy,
}: {
  cardPolicy: UiContract['componentPolicy']['card']
}) {
  return (
    <div className="classification-preview">
      <article className={`contract-card-preview ${cardPolicy.treatment}`}>
        <div>
          <span className="classification-kicker">Summary card</span>
          <strong>Monthly revenue</strong>
          <p>Grouped business information remains visually contained.</p>
        </div>
        <span className="classification-pill">{optionLabel(cardTreatmentOptions, cardPolicy.treatment)}</span>
      </article>
      <article className={`contract-card-preview ${cardPolicy.treatment}`}>
        <div>
          <span className="classification-kicker">Detail card</span>
          <strong>North America</strong>
          <p>Actions and metadata stay inside one content group.</p>
        </div>
        <button type="button">Open details</button>
      </article>
    </div>
  )
}

function CardInteractionPreview({
  cardPolicy,
}: {
  cardPolicy: UiContract['componentPolicy']['card']
}) {
  const isClickable = cardPolicy.interaction === 'clickable-card'
  const isSelectable = cardPolicy.interaction === 'selectable-card'

  return (
    <div className="classification-preview">
      <article
        className={`contract-card-preview ${cardPolicy.treatment} ${isSelectable ? 'is-selected' : ''} ${
          isClickable ? 'is-clickable' : ''
        }`}
      >
        <div>
          <span className="classification-kicker">
            {isSelectable ? 'Selectable card' : isClickable ? 'Clickable card' : 'Static card'}
          </span>
          <strong>{isSelectable ? 'Operations' : 'Customer health'}</strong>
          <p>
            {isSelectable
              ? 'Selected state is visible on the card itself.'
              : isClickable
                ? 'The whole card opens one destination.'
                : 'The card groups content; action remains separate.'}
          </p>
        </div>
        {isSelectable ? (
          <span className="classification-pill">Selected</span>
        ) : isClickable ? (
          <span className="classification-pill">Open</span>
        ) : (
          <button type="button">Review</button>
        )}
      </article>
    </div>
  )
}

function SidePanelRelationshipPreview({
  sidePanelPolicy,
}: {
  sidePanelPolicy: UiContract['componentPolicy']['sidePanel']
}) {
  const isDrawer = sidePanelPolicy.relationship === 'temporary-drawer'

  return (
    <div className={`side-panel-preview ${isDrawer ? 'is-drawer' : ''}`}>
      <div className="side-panel-main">
        <span className="classification-kicker">Main workspace</span>
        <strong>Customer list</strong>
        <p>{isDrawer ? 'Main work stays primary until details are opened.' : 'Main content and inspector stay side by side.'}</p>
      </div>
      <aside className="side-panel-aside">
        <span className="classification-kicker">{isDrawer ? 'Drawer' : 'Inspector'}</span>
        <strong>Customer details</strong>
        <p>{isDrawer ? 'Temporary supporting panel overlays or slides in.' : 'Companion information remains visible.'}</p>
      </aside>
    </div>
  )
}

function SidePanelResponsivePreview({
  sidePanelPolicy,
}: {
  sidePanelPolicy: UiContract['componentPolicy']['sidePanel']
}) {
  const isSheet = sidePanelPolicy.responsive === 'full-screen-sheet'

  return (
    <div className={`side-panel-mobile-preview ${isSheet ? 'is-sheet' : ''}`}>
      <div className="mobile-preview-header">
        <span>Customers</span>
        <button type="button">{isSheet ? 'Details' : 'Panel'}</button>
      </div>
      <div className="mobile-preview-body">
        <strong>{isSheet ? 'Details sheet' : 'Collapsed workspace'}</strong>
        <p>
          {isSheet
            ? 'Panel content takes the screen when side-by-side layout breaks.'
            : 'The main task remains visible; panel access moves to a toggle.'}
        </p>
      </div>
    </div>
  )
}

function ConfirmationSurfacePreview({
  confirmationPolicy,
}: {
  confirmationPolicy: UiContract['interactionPolicy']['confirmation']
}) {
  if (confirmationPolicy.surface === 'undo-when-reversible') {
    return (
      <div className="classification-preview">
        <div className="confirmation-preview-row">
          <button className="contract-button danger-emphasis-quiet-outline" type="button">Archive record</button>
          <span>Action is reversible.</span>
        </div>
        <div className="confirmation-toast-preview">
          <strong>Record archived</strong>
          <button type="button">Undo</button>
        </div>
      </div>
    )
  }

  const isTyped = confirmationPolicy.surface === 'typed-confirmation'

  return (
    <div className="classification-preview">
      <div className="confirmation-preview-row">
        <button className="contract-button danger-emphasis-quiet-outline" type="button">Delete record</button>
        <span>Danger intent starts on the action.</span>
      </div>
      <div className="confirmation-box-preview">
        <strong>{isTyped ? 'Type DELETE to confirm' : 'Confirm delete'}</strong>
        <p>{isTyped ? 'Use typed intent for rare high-impact actions.' : 'Explain the consequence before continuing.'}</p>
        {isTyped ? <div className="confirmation-input-preview">DELETE</div> : null}
        <div>
          <button className="contract-button secondary-outline" type="button">Cancel</button>
          <button className="contract-button danger-emphasis-strong-danger" type="button">Delete</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmationScopePreview({
  confirmationPolicy,
}: {
  confirmationPolicy: UiContract['interactionPolicy']['confirmation']
}) {
  const includesBulk = confirmationPolicy.scope === 'destructive-bulk-unsaved'

  return (
    <div className="classification-preview">
      <div className="confirmation-scope-list">
        <div className="is-active">
          <strong>Delete record</strong>
          <span>Confirmed</span>
        </div>
        <div className={includesBulk ? 'is-active' : ''}>
          <strong>Delete 24 records</strong>
          <span>{includesBulk ? 'Confirmed' : 'Screen-owned'}</span>
        </div>
        <div className={includesBulk ? 'is-active' : ''}>
          <strong>Leave unsaved edits</strong>
          <span>{includesBulk ? 'Guarded' : 'Screen-owned'}</span>
        </div>
      </div>
    </div>
  )
}

function TextFieldSectionedContractPanel({
  textFieldPolicy,
  onUpdate,
}: {
  textFieldPolicy: UiContract['componentPolicy']['textField']
  onUpdate: <Key extends keyof UiContract['componentPolicy']['textField']>(
    key: Key,
    value: UiContract['componentPolicy']['textField'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Field structure"
        description="Define the field surface and label placement. Exact size remains product-owned."
        controls={
          <>
            <OptionGroup
              title="Field style"
              value={textFieldPolicy.fieldStyle}
              options={textFieldStyleOptions}
              onChange={(value) => onUpdate('fieldStyle', value)}
            />
            <OptionGroup
              title="Label placement"
              value={textFieldPolicy.labelPlacement}
              options={textFieldLabelPlacementOptions}
              onChange={(value) => onUpdate('labelPlacement', value)}
            />
          </>
        }
        preview={<TextFieldStructurePreview textFieldPolicy={textFieldPolicy} />}
      />

      <SelectLikePolicySection
        title="Requirement cue"
        description="Show required or optional meaning without changing label alignment."
        controls={
          <OptionGroup
            title="Required indicator"
            value={textFieldPolicy.requiredIndicator}
            options={textFieldRequiredIndicatorOptions}
            onChange={(value) => onUpdate('requiredIndicator', value)}
          />
        }
        preview={<TextFieldRequirementPreview textFieldPolicy={textFieldPolicy} />}
      />

      <SelectLikePolicySection
        title="Assistive text"
        description="Keep labels durable; use helper, validation, and examples for field guidance."
        controls={
          <>
            <OptionGroup
              title="Message area behavior"
              value={textFieldPolicy.messageAreaBehavior}
              options={textFieldMessageAreaBehaviorOptions}
              onChange={(value) => onUpdate('messageAreaBehavior', value)}
            />
            <OptionGroup
              title="Placeholder usage"
              value={textFieldPolicy.placeholderUsage}
              options={textFieldPlaceholderUsageOptions}
              onChange={(value) => onUpdate('placeholderUsage', value)}
            />
          </>
        }
        preview={<TextFieldAssistivePreview textFieldPolicy={textFieldPolicy} />}
      />
    </div>
  )
}

function FocusSectionedContractPanel({
  focusPolicy,
  onUpdate,
}: {
  focusPolicy: UiContract['interactionPolicy']['focus']
  onUpdate: <Key extends keyof UiContract['interactionPolicy']['focus']>(
    key: Key,
    value: UiContract['interactionPolicy']['focus'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Focus policy"
        description="Define when focus is visible and how the indicator is drawn."
        controls={
          <>
            <OptionGroup
              title="Focus visibility"
              value={focusPolicy.visibility}
              options={focusVisibilityOptions}
              onChange={(value) => onUpdate('visibility', value)}
            />
            <OptionGroup
              title="Focus indicator"
              value={focusPolicy.indicatorStyle}
              options={focusIndicatorStyleOptions}
              onChange={(value) => onUpdate('indicatorStyle', value)}
            />
          </>
        }
        preview={<FocusPreviewStage focusPolicy={focusPolicy} />}
      />
    </div>
  )
}

function ValidationSectionedContractPanel({
  validationPolicy,
  onUpdate,
}: {
  validationPolicy: UiContract['interactionPolicy']['validation']
  onUpdate: <Key extends keyof UiContract['interactionPolicy']['validation']>(
    key: Key,
    value: UiContract['interactionPolicy']['validation'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Validation policy"
        description="Define when errors appear and where users can read them."
        controls={
          <>
            <OptionGroup
              title="Validation timing"
              value={validationPolicy.trigger}
              options={validationTriggerOptions}
              onChange={(value) => onUpdate('trigger', value)}
            />
            <OptionGroup
              title="Error presentation"
              value={validationPolicy.presentation}
              options={validationPresentationOptions}
              onChange={(value) => onUpdate('presentation', value)}
            />
          </>
        }
        preview={<ValidationPreviewStage validationPolicy={validationPolicy} />}
      />
    </div>
  )
}

function AvailabilitySectionedContractPanel({
  availabilityPolicy,
  onUpdate,
}: {
  availabilityPolicy: UiContract['interactionPolicy']['availability']
  onUpdate: <Key extends keyof UiContract['interactionPolicy']['availability']>(
    key: Key,
    value: UiContract['interactionPolicy']['availability'][Key],
  ) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Availability policy"
        description="Define how unavailable controls are shown and whether layout may move."
        controls={
          <>
            <OptionGroup
              title="Unavailable treatment"
              value={availabilityPolicy.treatment}
              options={availabilityTreatmentOptions}
              onChange={(value) => onUpdate('treatment', value)}
            />
            <OptionGroup
              title="Unavailable layout"
              value={availabilityPolicy.layout}
              options={availabilityLayoutOptions}
              onChange={(value) => onUpdate('layout', value)}
            />
          </>
        }
        preview={<AvailabilityPreviewStage availabilityPolicy={availabilityPolicy} />}
      />
    </div>
  )
}

function ComponentPreviewPanel({
  brandIdentity,
  availabilityPolicy,
  buttonPolicy,
  cardPolicy,
  checkboxPolicy,
  colorPolicy,
  confirmationPolicy,
  focusPolicy,
  selectPolicy,
  selectedComponent,
  sidePanelPolicy,
  tabsPolicy,
  textFieldPolicy,
  theme,
  togglePolicy,
  validationPolicy,
}: {
  brandIdentity: BrandIdentityPolicy
  availabilityPolicy: UiContract['interactionPolicy']['availability']
  buttonPolicy: UiContract['componentPolicy']['button']
  cardPolicy: UiContract['componentPolicy']['card']
  checkboxPolicy: UiContract['componentPolicy']['checkbox']
  colorPolicy: ColorPolicy
  confirmationPolicy: UiContract['interactionPolicy']['confirmation']
  focusPolicy: UiContract['interactionPolicy']['focus']
  selectPolicy: UiContract['componentPolicy']['select']
  selectedComponent: ContractEditorComponent
  sidePanelPolicy: UiContract['componentPolicy']['sidePanel']
  tabsPolicy: UiContract['componentPolicy']['tabs']
  textFieldPolicy: UiContract['componentPolicy']['textField']
  theme: Theme
  togglePolicy: UiContract['componentPolicy']['toggle']
  validationPolicy: UiContract['interactionPolicy']['validation']
}) {
  const previewTitle =
    selectedComponent === 'button'
      ? 'Buttons'
      : selectedComponent === 'textField'
        ? 'Text Fields'
        : selectedComponent === 'select'
          ? 'Selects'
          : selectedComponent === 'tabs'
            ? 'Tabs'
            : selectedComponent === 'toggle'
              ? 'Toggles'
              : selectedComponent === 'checkbox'
                ? 'Checkboxes'
                : selectedComponent === 'card'
                  ? 'Cards'
                  : selectedComponent === 'sidePanel'
                    ? 'Side Panels'
                    : selectedComponent === 'confirmation'
                      ? 'Confirmation'
                      : selectedComponent === 'focus'
                        ? 'Focus States'
                        : selectedComponent === 'validation'
                          ? 'Validation'
                          : 'Availability'

  return (
    <div
      className="component-preview preview-panel"
      style={toColorPreviewStyle(colorPolicy, brandIdentity, theme)}
    >
      <div className="policy-intro">
        <div>
          <p className="eyebrow">Component Preview</p>
          <h3>{previewTitle}</h3>
        </div>
        <p>Preview focuses on the selected component while the full contract remains in JSON.</p>
      </div>

      {selectedComponent === 'button' ? (
        <ButtonPreviewStage buttonPolicy={buttonPolicy} />
      ) : selectedComponent === 'textField' ? (
        <TextFieldPreviewStage textFieldPolicy={textFieldPolicy} />
      ) : selectedComponent === 'select' ? (
        <SelectPreviewStage selectPolicy={selectPolicy} />
      ) : selectedComponent === 'tabs' ? (
        <TabsPreviewStage tabsPolicy={tabsPolicy} />
      ) : selectedComponent === 'toggle' ? (
        <TogglePreviewStage togglePolicy={togglePolicy} />
      ) : selectedComponent === 'checkbox' ? (
        <CheckboxPreviewStage checkboxPolicy={checkboxPolicy} />
      ) : selectedComponent === 'card' ? (
        <CardInteractionPreview cardPolicy={cardPolicy} />
      ) : selectedComponent === 'sidePanel' ? (
        <SidePanelRelationshipPreview sidePanelPolicy={sidePanelPolicy} />
      ) : selectedComponent === 'confirmation' ? (
        <ConfirmationSurfacePreview confirmationPolicy={confirmationPolicy} />
      ) : selectedComponent === 'focus' ? (
        <FocusPreviewStage focusPolicy={focusPolicy} />
      ) : selectedComponent === 'validation' ? (
        <ValidationPreviewStage validationPolicy={validationPolicy} />
      ) : (
        <AvailabilityPreviewStage availabilityPolicy={availabilityPolicy} />
      )}

      <div className="guidance-grid">
        {selectedComponent === 'button' ? (
          <>
            <GuidanceCard title="Primary action" value={optionLabel(primaryEmphasisOptions, buttonPolicy.primaryEmphasis)} />
            <GuidanceCard title="Secondary action" value={optionLabel(secondaryEmphasisOptions, buttonPolicy.secondaryEmphasis)} />
            <GuidanceCard title="Danger placement" value={optionLabel(dangerPlacementOptions, buttonPolicy.dangerPlacement)} />
            <GuidanceCard title="Danger emphasis" value={optionLabel(dangerEmphasisOptions, buttonPolicy.dangerEmphasis)} />
            <GuidanceCard title="Loading preview" value="spinner with label" />
            <GuidanceCard title="Icon adornment" value={optionLabel(iconAdornmentOptions, buttonPolicy.iconAdornment)} />
            <GuidanceCard title="Icon-only policy" value={optionLabel(iconOnlyPolicyOptions, buttonPolicy.iconOnlyPolicy)} />
            <GuidanceCard title="Unavailable preview" value="standard disabled state" />
          </>
        ) : selectedComponent === 'textField' ? (
          <>
            <GuidanceCard title="Field style" value={optionLabel(textFieldStyleOptions, textFieldPolicy.fieldStyle)} />
            <GuidanceCard title="Label placement" value={optionLabel(textFieldLabelPlacementOptions, textFieldPolicy.labelPlacement)} />
            <GuidanceCard title="Required marker" value={optionLabel(textFieldRequiredIndicatorOptions, textFieldPolicy.requiredIndicator)} />
            <GuidanceCard title="Message area" value={optionLabel(textFieldMessageAreaBehaviorOptions, textFieldPolicy.messageAreaBehavior)} />
            <GuidanceCard title="Placeholder" value={optionLabel(textFieldPlaceholderUsageOptions, textFieldPolicy.placeholderUsage)} />
          </>
        ) : selectedComponent === 'select' ? (
          <>
            <GuidanceCard title="Scenes" value="3 previews" />
            <GuidanceCard title="Selected row" value="background + checkmark" />
            <GuidanceCard title="Multi items" value={optionLabel(selectMultiSelectedItemDisplayOptions, selectPolicy.multiSelectedItemDisplay)} />
            <GuidanceCard title="No results" value="plain message" />
          </>
        ) : selectedComponent === 'tabs' ? (
          <>
            <GuidanceCard title="Treatment" value={optionLabel(tabsTreatmentOptions, tabsPolicy.treatment)} />
            <GuidanceCard title="Adornment" value={optionLabel(tabsAdornmentOptions, tabsPolicy.adornment)} />
            <GuidanceCard title="Purpose" value="related panels" />
            <GuidanceCard title="Boundary" value="panel switching" />
          </>
        ) : selectedComponent === 'toggle' ? (
          <>
            <GuidanceCard title="Treatment" value={optionLabel(toggleTreatmentOptions, togglePolicy.treatment)} />
            <GuidanceCard title="State label" value={optionLabel(toggleLabelPolicyOptions, togglePolicy.labelPolicy)} />
            <GuidanceCard title="Boundary" value="immediate setting" />
            <GuidanceCard title="Not checkbox" value="not deferred choice" />
          </>
        ) : selectedComponent === 'checkbox' ? (
          <>
            <GuidanceCard title="Layout" value={optionLabel(checkboxGroupLayoutOptions, checkboxPolicy.groupLayout)} />
            <GuidanceCard title="Choice surface" value={optionLabel(checkboxChoiceSurfaceOptions, checkboxPolicy.choiceSurface)} />
            <GuidanceCard title="Mixed state" value={optionLabel(checkboxMixedStateOptions, checkboxPolicy.mixedState)} />
            <GuidanceCard title="Boundary" value="independent choices" />
          </>
        ) : selectedComponent === 'card' ? (
          <>
            <GuidanceCard title="Treatment" value={optionLabel(cardTreatmentOptions, cardPolicy.treatment)} />
            <GuidanceCard title="Interaction" value={optionLabel(cardInteractionOptions, cardPolicy.interaction)} />
            <GuidanceCard title="Boundary" value="content container" />
            <GuidanceCard title="Not owned" value="page grid size" />
          </>
        ) : selectedComponent === 'sidePanel' ? (
          <>
            <GuidanceCard title="Relationship" value={optionLabel(sidePanelRelationshipOptions, sidePanelPolicy.relationship)} />
            <GuidanceCard title="Responsive" value={optionLabel(sidePanelResponsiveOptions, sidePanelPolicy.responsive)} />
            <GuidanceCard title="Boundary" value="workspace companion" />
            <GuidanceCard title="Not dialog" value="persistent or invoked panel" />
          </>
        ) : selectedComponent === 'confirmation' ? (
          <>
            <GuidanceCard title="Surface" value={optionLabel(confirmationSurfaceOptions, confirmationPolicy.surface)} />
            <GuidanceCard title="Scope" value={optionLabel(confirmationScopeOptions, confirmationPolicy.scope)} />
            <GuidanceCard title="Boundary" value="interaction policy" />
            <GuidanceCard title="Not owned" value="button color" />
          </>
        ) : selectedComponent === 'focus' ? (
          <>
            <GuidanceCard title="Visibility" value={optionLabel(focusVisibilityOptions, focusPolicy.visibility)} />
            <GuidanceCard title="Indicator" value={optionLabel(focusIndicatorStyleOptions, focusPolicy.indicatorStyle)} />
            <GuidanceCard title="Scope" value="all interactive controls" />
            <GuidanceCard title="Anti-pattern" value="never hide focus" />
          </>
        ) : selectedComponent === 'validation' ? (
          <>
            <GuidanceCard title="Timing" value={optionLabel(validationTriggerOptions, validationPolicy.trigger)} />
            <GuidanceCard title="Presentation" value={optionLabel(validationPresentationOptions, validationPolicy.presentation)} />
            <GuidanceCard title="Anti-pattern" value="avoid while-typing errors" />
            <GuidanceCard title="Message" value="plain and actionable" />
          </>
        ) : (
          <>
            <GuidanceCard title="Treatment" value={availabilityTreatmentSummary(availabilityPolicy.treatment)} />
            <GuidanceCard title="Layout" value={optionLabel(availabilityLayoutOptions, availabilityPolicy.layout)} />
            <GuidanceCard title="Default" value="Recoverable" />
            <GuidanceCard title="Boundary" value="Policy only" />
          </>
        )}
      </div>
    </div>
  )
}

function ButtonPreviewStage({
  buttonPolicy,
}: {
  buttonPolicy: UiContract['componentPolicy']['button']
}) {
  return (
    <div className="button-stage">
      <div className="button-row">
        <PreviewButton kind="primary" policy={buttonPolicy}>
          Save changes
        </PreviewButton>
        <PreviewButton kind="secondary" policy={buttonPolicy}>
          Cancel
        </PreviewButton>
        <PreviewButton kind="danger" policy={buttonPolicy}>
          Delete record
        </PreviewButton>
      </div>

      <div className="button-row">
        <PreviewButton kind="loading" policy={buttonPolicy}>
          Saving
        </PreviewButton>
        <PreviewButton
          iconOnly={buttonPolicy.iconOnlyPolicy === 'allow-recognizable-with-accessible-name'}
          kind="secondary"
          policy={buttonPolicy}
        >
          Preview
        </PreviewButton>
      </div>

      <div className="button-row disabled-preview-row">
        <PreviewButton kind="disabled-primary" policy={buttonPolicy}>
          Submit request
        </PreviewButton>
        <PreviewButton kind="disabled-secondary" policy={buttonPolicy}>
          Export
        </PreviewButton>
        <PreviewButton kind="disabled-danger" policy={buttonPolicy}>
          Delete locked record
        </PreviewButton>
      </div>
    </div>
  )
}

function ButtonIntentPreview({
  buttonPolicy,
}: {
  buttonPolicy: UiContract['componentPolicy']['button']
}) {
  return (
    <div className="button-section-preview">
      <ButtonStateCard title="Normal actions" caption="Primary and secondary actions together">
        <div className="button-row">
          <PreviewButton kind="primary" policy={buttonPolicy}>
            Save changes
          </PreviewButton>
          <PreviewButton kind="secondary" policy={buttonPolicy}>
            Cancel
          </PreviewButton>
        </div>
      </ButtonStateCard>
      <ButtonStateCard title="In progress" caption="Keep the label visible while work is running">
        <div className="button-row">
          <PreviewButton kind="loading" policy={buttonPolicy}>
            Saving
          </PreviewButton>
          <PreviewButton kind="secondary" policy={buttonPolicy}>
            Preview
          </PreviewButton>
        </div>
      </ButtonStateCard>
      <ButtonStateCard title="Unavailable" caption="Disabled style is state-owned, not original intent color">
        <div className="button-row">
          <PreviewButton kind="disabled-primary" policy={buttonPolicy}>
            Submit request
          </PreviewButton>
          <PreviewButton kind="disabled-secondary" policy={buttonPolicy}>
            Export
          </PreviewButton>
        </div>
      </ButtonStateCard>
    </div>
  )
}

function ButtonDangerPreview({
  buttonPolicy,
}: {
  buttonPolicy: UiContract['componentPolicy']['button']
}) {
  return (
    <div className="button-section-preview">
      <ButtonStateCard title="Action row" caption="Danger action placement is independent from color weight">
        <div className="button-row button-preview-spread">
          <PreviewButton kind="primary" policy={buttonPolicy}>
            Save changes
          </PreviewButton>
          <PreviewButton kind="secondary" policy={buttonPolicy}>
            Cancel
          </PreviewButton>
          <PreviewButton kind="danger" policy={buttonPolicy}>
            Delete record
          </PreviewButton>
        </div>
      </ButtonStateCard>
      <ButtonStateCard title="Locked destructive action" caption="Unavailable danger uses disabled treatment">
        <div className="button-row">
          <PreviewButton kind="disabled-danger" policy={buttonPolicy}>
            Delete locked record
          </PreviewButton>
        </div>
      </ButtonStateCard>
    </div>
  )
}

function ButtonIconPreview({
  buttonPolicy,
}: {
  buttonPolicy: UiContract['componentPolicy']['button']
}) {
  return (
    <div className="button-section-preview">
      <ButtonStateCard title="Labeled actions" caption="Icons support text only when they clarify the action">
        <div className="button-row">
          <PreviewButton kind="primary" policy={buttonPolicy}>
            Save changes
          </PreviewButton>
          <PreviewButton kind="secondary" policy={buttonPolicy}>
            Preview
          </PreviewButton>
        </div>
      </ButtonStateCard>
      <ButtonStateCard title="Icon-only action" caption="Only for recognizable space-limited actions">
        <div className="button-row">
          <PreviewButton
            iconOnly={buttonPolicy.iconOnlyPolicy === 'allow-recognizable-with-accessible-name'}
            kind="secondary"
            policy={buttonPolicy}
          >
            Preview
          </PreviewButton>
          <span className="button-preview-note">
            {buttonPolicy.iconOnlyPolicy === 'allow-recognizable-with-accessible-name'
              ? 'Accessible name remains required.'
              : 'Visible text remains the default.'}
          </span>
        </div>
      </ButtonStateCard>
    </div>
  )
}

function ButtonStateCard({
  caption,
  children,
  title,
}: {
  caption: string
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="select-state-card">
      <div>
        <span className="select-scene-title">{title}</span>
        <p>{caption}</p>
      </div>
      {children}
    </div>
  )
}

function TextFieldPreviewStage({
  textFieldPolicy,
}: {
  textFieldPolicy: UiContract['componentPolicy']['textField']
}) {
  return (
    <div className="text-field-stage">
      <PreviewTextField
        helper="Shown below the field and replaced by validation when needed."
        label="Customer name"
        required
        textFieldPolicy={textFieldPolicy}
        value="Northwind Co."
      />
      <PreviewTextField
        helper="Use a short example instead of repeating the label."
        label="Account code"
        textFieldPolicy={textFieldPolicy}
        value=""
      />
      <PreviewTextField
        error="Enter a valid email address."
        helper="Work email used for notifications."
        label="Billing email"
        required
        textFieldPolicy={textFieldPolicy}
        value="billing@"
      />
    </div>
  )
}

function TextFieldStructurePreview({
  textFieldPolicy,
}: {
  textFieldPolicy: UiContract['componentPolicy']['textField']
}) {
  return (
    <div className="text-field-section-preview">
      <TextFieldStateCard title="Resting" caption="Label remains visible outside the input">
        <PreviewTextField
          helper="Shown below the field and replaced by validation when needed."
          label="Customer name"
          required
          textFieldPolicy={textFieldPolicy}
          value="Northwind Co."
        />
      </TextFieldStateCard>
      <TextFieldStateCard title="Empty" caption="Empty field keeps the label as the durable name">
        <PreviewTextField
          helper="Use helper text for guidance."
          label="Account code"
          textFieldPolicy={textFieldPolicy}
          value=""
        />
      </TextFieldStateCard>
    </div>
  )
}

function TextFieldRequirementPreview({
  textFieldPolicy,
}: {
  textFieldPolicy: UiContract['componentPolicy']['textField']
}) {
  return (
    <div className="text-field-section-preview">
      <TextFieldStateCard title="Required" caption="Required cue has its own reserved marker slot">
        <PreviewTextField
          helper="Required fields should not shift label alignment."
          label="Customer name"
          required
          textFieldPolicy={textFieldPolicy}
          value="Northwind Co."
        />
      </TextFieldStateCard>
      <TextFieldStateCard title="Optional" caption="Optional text belongs to the label, not the marker slot">
        <PreviewTextField
          helper="Optional fields stay readable beside required fields."
          label="Account code"
          textFieldPolicy={textFieldPolicy}
          value="AC-1042"
        />
      </TextFieldStateCard>
    </div>
  )
}

function TextFieldAssistivePreview({
  textFieldPolicy,
}: {
  textFieldPolicy: UiContract['componentPolicy']['textField']
}) {
  return (
    <div className="text-field-section-preview">
      <TextFieldStateCard title="Helper" caption="Guidance stays outside the value area">
        <PreviewTextField
          helper="Use a short example instead of repeating the label."
          label="Account code"
          textFieldPolicy={textFieldPolicy}
          value=""
        />
      </TextFieldStateCard>
      <TextFieldStateCard title="Validation" caption="Validation replaces or occupies the same message area">
        <PreviewTextField
          error="Enter a valid email address."
          helper="Work email used for notifications."
          label="Billing email"
          required
          textFieldPolicy={textFieldPolicy}
          value="billing@"
        />
      </TextFieldStateCard>
    </div>
  )
}

function TextFieldStateCard({
  caption,
  children,
  title,
}: {
  caption: string
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="select-state-card text-field-state-card">
      <div>
        <span className="select-scene-title">{title}</span>
        <p>{caption}</p>
      </div>
      {children}
    </div>
  )
}

function ValidationPreviewStage({
  validationPolicy,
}: {
  validationPolicy: UiContract['interactionPolicy']['validation']
}) {
  return (
    <div className="validation-stage">
      {validationPolicy.presentation === 'field-and-summary' ? (
        <div className="error-summary-preview">
          <strong>There is a problem</strong>
          <span>Billing email must include a valid domain.</span>
        </div>
      ) : null}

      <label className="validation-field-preview">
        <span>Billing email</span>
        <input readOnly value="billing@" />
        <strong>Enter a valid email address.</strong>
      </label>

      <p className="focus-preview-note">
        {validationPolicy.trigger === 'submit-or-step'
          ? 'Errors appear after submit or when moving to the next workflow step.'
          : 'Errors appear after the edited field loses focus.'}
      </p>
    </div>
  )
}

function AvailabilityPreviewStage({
  availabilityPolicy,
}: {
  availabilityPolicy: UiContract['interactionPolicy']['availability']
}) {
  const hidden = availabilityPolicy.treatment === 'hidden-when-not-applicable'
  const disabled = availabilityPolicy.treatment === 'disabled-when-impossible'
  const readonly = availabilityPolicy.treatment === 'readonly-for-fixed-values'

  return (
    <div className="availability-stage">
      <div className="availability-row">
        <button className="contract-button primary-filled size-medium" type="button">
          Submit request
        </button>
        {hidden ? null : (
          <button
            className={`contract-button secondary-outline size-medium ${disabled ? 'is-disabled-preview' : ''}`}
            type="button"
          >
            Export
          </button>
        )}
        <span className="availability-status">
          {availabilityPolicy.layout === 'preserve-space-for-temporary-state'
            ? 'Temporary states keep layout stable.'
            : 'Not-applicable controls may close their space.'}
        </span>
      </div>

      <label className="availability-field-preview">
        <span>Account status</span>
        <input readOnly value={readonly ? 'Approved - read only' : 'Ready for review'} />
      </label>

      {availabilityPolicy.treatment === 'keep-enabled-explain-on-action' ? (
        <div className="availability-message">If requirements are missing, explain them when the user acts.</div>
      ) : null}
    </div>
  )
}

function FocusPreviewStage({
  focusPolicy,
}: {
  focusPolicy: UiContract['interactionPolicy']['focus']
}) {
  const focusClass = `focus-style-${focusPolicy.indicatorStyle}`
  const showPointerFocus = focusPolicy.visibility === 'all-focused-controls'

  return (
    <div className={`focus-stage ${focusClass}`}>
      <div className="focus-sample-section">
        <span>Keyboard focus</span>
        <div className="focus-sample-row">
          <button className="focus-sample-control focus-sample-primary is-focused" type="button">
            Save changes
          </button>
          <button className="focus-sample-control" type="button">
            Cancel
          </button>
        </div>
      </div>

      <div className="focus-sample-section">
        <span>Pointer focus</span>
        <div className="focus-sample-row">
          <button
            className={`focus-sample-control ${showPointerFocus ? 'is-focused' : 'is-pointer-quiet'}`}
            type="button"
          >
            Preview
          </button>
          <span className="focus-sample-caption">
            {showPointerFocus ? 'Ring is visible after click.' : 'Click focus has no ring.'}
          </span>
        </div>
      </div>

      <div className="focus-sample-section">
        <span>Active text input</span>
        <label className="focus-sample-field">
          <span>Customer name</span>
          <input className="focus-sample-input is-focused" readOnly value="Northwind Co." />
        </label>
      </div>

      <div className="focus-preview-result">
        <span>{focusPolicy.visibility === 'keyboard-and-active-inputs' ? 'Keyboard only' : 'Keyboard + pointer'}</span>
        <span>{focusPolicy.indicatorStyle === 'outer-ring' ? 'Outer ring' : 'High contrast'}</span>
      </div>
    </div>
  )
}

function PreviewTextField({
  error,
  helper,
  label,
  required = false,
  textFieldPolicy,
  value,
}: {
  error?: string
  helper: string
  label: string
  required?: boolean
  textFieldPolicy: UiContract['componentPolicy']['textField']
  value: string
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const shouldShowPlaceholder = textFieldPolicy.placeholderUsage === 'format-example-only' && !value
  const placeholder = shouldShowPlaceholder ? examplePlaceholder(label) : ''
  const usesRequiredMark =
    textFieldPolicy.requiredIndicator === 'mark-required-default' ||
    textFieldPolicy.requiredIndicator === 'mark-required-danger'
  const indicator =
    required && usesRequiredMark
      ? '*'
      : !required && textFieldPolicy.requiredIndicator === 'mark-optional'
        ? '(optional)'
        : ''
  const message = error ?? helper
  const showAssistiveText = error || textFieldPolicy.messageAreaBehavior === 'reserved-message-area'
  const reservesRequiredSlot = usesRequiredMark
  const indicatorTone =
    textFieldPolicy.requiredIndicator === 'mark-required-danger'
      ? 'indicator-danger'
      : textFieldPolicy.requiredIndicator === 'mark-required-default'
        ? 'indicator-default'
        : 'indicator-muted'

  return (
    <div className={`preview-field-row ${labelPlacementClass(textFieldPolicy.labelPlacement)}`}>
      <label
        className={`preview-field-label ${labelAlignmentClass(textFieldPolicy.labelPlacement)} ${
          reservesRequiredSlot ? 'reserves-required-slot' : ''
        }`}
        htmlFor={id}
      >
        <span className="preview-field-label-text">{label}</span>
        <span className={`preview-field-label-indicator ${indicatorTone}`}>{indicator}</span>
      </label>
      <div className="preview-field-control">
        <input
          aria-describedby={`${id}-message`}
          aria-invalid={error ? true : undefined}
          className={`preview-text-input style-${textFieldPolicy.fieldStyle} ${error ? 'has-error' : ''}`}
          id={id}
          placeholder={placeholder}
          readOnly
          value={value}
        />
        <p
          className={`preview-field-message ${error ? 'is-error' : ''} ${showAssistiveText ? '' : 'is-empty'}`}
          id={`${id}-message`}
        >
          {showAssistiveText ? message : '\u00a0'}
        </p>
      </div>
    </div>
  )
}

function examplePlaceholder(label: string): string {
  if (label === 'Account code') return 'AC-1042'
  return 'Example'
}

function labelPlacementClass(labelPlacement: TextFieldLabelPlacement): string {
  return labelPlacement === 'top' ? 'label-top' : 'label-side'
}

function labelAlignmentClass(labelPlacement: TextFieldLabelPlacement): string {
  if (labelPlacement === 'side-left') return 'align-left'
  if (labelPlacement === 'side-right') return 'align-right'
  return ''
}

function ColorSettingsPanel({
  brandIdentity,
  colorPolicy,
  colorProfileId,
  onBrandIdentityUpdate,
  onProfileChange,
  onUpdate,
}: {
  brandIdentity: BrandIdentityPolicy
  colorPolicy: ColorPolicy
  colorProfileId: ActiveColorProfileId
  onBrandIdentityUpdate: (key: keyof BrandIdentityPolicy, value: string) => void
  onProfileChange: (profileId: ColorProfileId) => void
  onUpdate: (mode: ColorModeKey, key: ColorRoleKey, value: string) => void
}) {
  const colorGroups = Array.from(new Set(colorRoleFields.map((field) => field.group)))
  const selectedProfile = colorProfiles.find((profile) => profile.id === colorProfileId)

  return (
    <div className="editor-panel">
      <div className="color-workbench">
        <div className="color-controls">
          <section className="color-section">
            <div className="profile-header">
              <div>
                <h4>Profile Preset</h4>
                <p>
                  {selectedProfile?.description ??
                    'Custom colors based on a preset or imported contract.'}
                </p>
              </div>
              <select
                aria-label="Color profile preset"
                className="profile-select"
                onChange={(event) => {
                  if (event.target.value !== 'custom') {
                    onProfileChange(event.target.value as ColorProfileId)
                  }
                }}
                value={colorProfileId}
              >
                {colorProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="profile-grid">
              {colorProfiles.map((profile) => (
                <button
                  className={`profile-card ${colorProfileId === profile.id ? 'is-selected' : ''}`}
                  key={profile.id}
                  onClick={() => onProfileChange(profile.id)}
                  type="button"
                >
                  <span className="profile-card-name">{profile.name}</span>
                  <span aria-hidden="true" className="profile-card-swatches">
                    <span
                      style={{ background: profile.brandIdentity.mark }}
                      title="Brand mark"
                    />
                    <span
                      style={{ background: profile.color.light.primary }}
                      title="Primary action"
                    />
                    <span
                      style={{ background: profile.color.light.secondary }}
                      title="Secondary action"
                    />
                  </span>
                </button>
              ))}
            </div>
          </section>
          <ColorSection title="Brand identity">
            <div className="identity-grid">
              <IdentityColorField
                label="Brand mark"
                note="Logo mark color, shared across modes."
                value={brandIdentity.mark}
                onChange={(value) => onBrandIdentityUpdate('mark', value)}
              />
              <IdentityColorField
                label="Mark background"
                note="Stable backing plate for logo visibility."
                value={brandIdentity.markBackground}
                onChange={(value) => onBrandIdentityUpdate('markBackground', value)}
                allowTransparent
              />
              <IdentityColorField
                label="Mark border"
                note="Optional edge for mark backing plate."
                value={brandIdentity.markBorder}
                onChange={(value) => onBrandIdentityUpdate('markBorder', value)}
                allowTransparent
              />
            </div>
          </ColorSection>
          {colorGroups.map((group) => (
            <ColorSection key={group} title={group}>
              <div className="color-matrix-head">
                <span>Role</span>
                <span>Light</span>
                <span>Dark</span>
              </div>
              {colorRoleFields
                .filter((field) => field.group === group)
                .map((field) => (
                  <ColorRoleRow
                    key={field.key}
                    field={field}
                    lightValue={colorPolicy.light[field.key]}
                    darkValue={colorPolicy.dark[field.key]}
                    onChange={(mode, value) => onUpdate(mode, field.key, value)}
                  />
                ))}
            </ColorSection>
          ))}
        </div>
        <ColorPreviewPanel brandIdentity={brandIdentity} colorPolicy={colorPolicy} />
      </div>
    </div>
  )
}

function IdentityColorField({
  allowTransparent = false,
  label,
  note,
  onChange,
  value,
}: {
  allowTransparent?: boolean
  label: string
  note: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div className="identity-color-field">
      <span className="color-copy">
        <strong>{label}</strong>
        <span>{note}</span>
      </span>
      <FlexibleColorValueInput
        allowTransparent={allowTransparent}
        label={label}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

function ColorSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="color-section">
      <h4>{title}</h4>
      <div className="color-section-fields">{children}</div>
    </section>
  )
}

function ColorRoleRow({
  darkValue,
  field,
  lightValue,
  onChange,
}: {
  darkValue: string
  field: { key: ColorRoleKey; label: string; note: string }
  lightValue: string
  onChange: (mode: ColorModeKey, value: string) => void
}) {
  return (
    <div className="color-role-row">
      <span className="color-copy">
        <strong>{field.label}</strong>
        <span>{field.note}</span>
      </span>
      <ColorValueInput
        label={`${field.label} light`}
        value={lightValue}
        onChange={(value) => onChange('light', value)}
      />
      <ColorValueInput
        label={`${field.label} dark`}
        value={darkValue}
        onChange={(value) => onChange('dark', value)}
      />
    </div>
  )
}

function ColorValueInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <span className="color-value-input">
      <input
        aria-label={`${label} color`}
        className="color-picker"
        onChange={(event) => onChange(event.target.value)}
        type="color"
        value={value}
      />
      <input
        aria-label={`${label} hex value`}
        className="color-code-input"
        maxLength={7}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        type="text"
        value={value}
      />
    </span>
  )
}

function FlexibleColorValueInput({
  allowTransparent,
  label,
  onChange,
  value,
}: {
  allowTransparent: boolean
  label: string
  onChange: (value: string) => void
  value: string
}) {
  const isTransparent = value === 'transparent'
  const colorValue = isTransparent ? '#ffffff' : value

  return (
    <span className="flexible-color-input">
      <input
        aria-label={`${label} color`}
        className="color-picker"
        disabled={isTransparent}
        onChange={(event) => onChange(event.target.value)}
        type="color"
        value={colorValue}
      />
      <input
        aria-label={`${label} hex value`}
        className="color-code-input"
        maxLength={allowTransparent ? 11 : 7}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        type="text"
        value={value}
      />
      {allowTransparent ? (
        <label className="transparent-toggle">
          <input
            checked={isTransparent}
            onChange={(event) => {
              onChange(event.target.checked ? 'transparent' : '#ffffff')
            }}
            type="checkbox"
          />
          <span>Transparent</span>
        </label>
      ) : null}
    </span>
  )
}

function ColorPreviewPanel({
  brandIdentity,
  colorPolicy,
}: {
  brandIdentity: BrandIdentityPolicy
  colorPolicy: ColorPolicy
}) {
  return (
    <div className="component-preview preview-panel">
      <div className="policy-intro">
        <div>
          <p className="eyebrow">Color Preview</p>
          <h3>Business Screen Sample</h3>
        </div>
        <p>Check brand, action, semantic, and neutral colors in both modes.</p>
      </div>

      <div className="mode-preview-grid">
        <ModeColorPreview brandIdentity={brandIdentity} colorPolicy={colorPolicy} mode="light" />
        <ModeColorPreview brandIdentity={brandIdentity} colorPolicy={colorPolicy} mode="dark" />
      </div>

      <div className="guidance-grid">
        <GuidanceCard title="Light primary" value={colorPolicy.light.primary} />
        <GuidanceCard title="Dark primary" value={colorPolicy.dark.primary} />
        <GuidanceCard title="Light surface" value={colorPolicy.light.surface} />
        <GuidanceCard title="Dark surface" value={colorPolicy.dark.surface} />
      </div>
    </div>
  )
}

function ModeColorPreview({
  brandIdentity,
  colorPolicy,
  mode,
}: {
  brandIdentity: BrandIdentityPolicy
  colorPolicy: ColorPolicy
  mode: ColorModeKey
}) {
  return (
    <div
      className="color-preview-shell"
      style={toColorPreviewStyle(colorPolicy, brandIdentity, mode)}
    >
      <div className="color-preview-topbar">
        <div className="color-preview-mark" />
        <strong>{mode === 'light' ? 'Light mode' : 'Dark mode'}</strong>
      </div>

      <div className="color-preview-surface">
        <div className="color-preview-header">
          <div>
            <span>Quarterly operations</span>
            <strong>Account review queue</strong>
          </div>
          <div className="color-preview-actions">
            <button className="contract-button secondary-neutral-filled" type="button">
              Export
            </button>
            <button className="contract-button primary-filled" type="button">
              Save changes
            </button>
          </div>
        </div>

        <div className="status-row">
          <StatusChip label="Complete" tone="success" value="18" />
          <StatusChip label="Needs review" tone="warning" value="4" />
          <StatusChip label="Blocked" tone="danger" value="2" />
          <StatusChip label="Info" tone="info" value="7" />
        </div>

        <div className="sample-table">
          <div className="sample-table-row sample-table-head">
            <span>Customer</span>
            <span>Status</span>
            <span>Owner</span>
          </div>
          <div className="sample-table-row">
            <span>Northwind Co.</span>
            <span className="status-text success">Complete</span>
            <span>A. Tanaka</span>
          </div>
          <div className="sample-table-row">
            <span>Contoso Ltd.</span>
            <span className="status-text warning">Needs review</span>
            <span>M. Suzuki</span>
          </div>
          <div className="sample-table-row">
            <span>Fabrikam</span>
            <span className="status-text danger">Blocked</span>
            <span>K. Sato</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusChip({
  label,
  tone,
  value,
}: {
  label: string
  tone: 'success' | 'warning' | 'danger' | 'info'
  value: string
}) {
  return (
    <div className={`status-chip ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ScreenPatternsPanel() {
  return (
    <div className="screen-pattern-panel">
      <section className="screen-pattern-intro">
        <div>
          <p className="eyebrow">Screen policy backlog</p>
          <h3>画面全体で扱うべき規約</h3>
        </div>
        <p>
          Component ContractやInteraction Policyではなく、アプリシェルや画面全体の振る舞いとして扱う候補を整理します。
          Card、Side Panel、ConfirmationはContract Editor側へ移動しました。
        </p>
      </section>

      <div className="screen-pattern-grid">
        <ScreenPatternCard
          title="Navigation history"
          scope="SPAの戻る/進む"
          status="candidate"
          body="ブラウザの戻るボタンで、選択中ページ、プレビュータブ、開閉パネル、Inspector選択をどこまで復元するかを決めます。視覚デザインではなく、作業復帰のポリシーです。"
          points={[
            'ページ遷移はpushする',
            '軽い開閉状態はreplaceまたはlocal stateにする',
            '作業対象の選択は復帰できるようにする',
          ]}
        />

        <ScreenPatternCard
          title="Small viewport"
          scope="モバイル/狭い画面"
          status="candidate"
          body="業務アプリでも狭い画面の破綻は避ける必要があります。すべてをスマホ最適化するのではなく、主要操作が壊れない最低ラインを決めます。"
          points={[
            'サイドバーとInspectorは折りたたむ',
            '設定とプレビューは縦積みにする',
            '固定ヘッダーや操作ボタンが内容を隠さない',
          ]}
        />
      </div>
    </div>
  )
}

function ScreenPatternCard({
  body,
  points,
  scope,
  status,
  title,
}: {
  body: string
  points: string[]
  scope: string
  status: 'candidate' | 'review'
  title: string
}) {
  return (
    <article className="screen-pattern-card">
      <div className="screen-pattern-card-heading">
        <div>
          <span className="screen-pattern-scope">{scope}</span>
          <h3>{title}</h3>
        </div>
        <span className={`screen-pattern-status ${status}`}>{status === 'review' ? 'Review' : 'Candidate'}</span>
      </div>
      <p>{body}</p>
      <ul>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  )
}

function SettingsPanel({
  theme,
  onThemeChange,
}: {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}) {
  return (
    <div className="settings-panel">
      <div className="setting-row">
        <div>
          <strong>Theme</strong>
          <span>Stored locally in this browser.</span>
        </div>
        <button
          className="toolbar-button"
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
          type="button"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          {theme === 'light' ? 'Use dark' : 'Use light'}
        </button>
      </div>
    </div>
  )
}

function OverviewPanel() {
  const [language, setLanguage] = useState<OverviewLanguage>('ja')
  const content = overviewContent[language]

  return (
    <div className="overview-panel">
      <div className="overview-hero">
        <div>
          <strong className="overview-tagline">{content.tagline}</strong>
          <h3>{content.title}</h3>
          <p>{content.lead}</p>
          <div className="overview-keywords" aria-label="Overview keywords">
            {content.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
        <div className="overview-language-switch" aria-label="Overview language">
          {(['ja', 'en'] as OverviewLanguage[]).map((option) => (
            <button
              className={language === option ? 'is-active' : ''}
              key={option}
              onClick={() => setLanguage(option)}
              type="button"
            >
              <span>{overviewContent[option].languageLabel}</span>
              <small>{overviewContent[option].translationNote}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="overview-flow">
        {content.sections.map((section) => (
          <section className="overview-item" key={section.title}>
            <p className="eyebrow">{section.eyebrow}</p>
            <h4>{section.title}</h4>
            <p>{section.body}</p>
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  )
}

function OptionGroup<T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title: string
  value: T
  options: Array<{ value: T; label: string; note: string }>
  onChange: (value: T) => void
}) {
  return (
    <section className="option-group">
      <h4>{title}</h4>
      <div className="option-grid">
        {options.map((option) => (
          <button
            className={`option-card ${value === option.value ? 'is-selected' : ''}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <span className="option-title">{option.label}</span>
            <span className="option-note">{option.note}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function optionLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T): string {
  return options.find((option) => option.value === value)?.label ?? value
}

function availabilityTreatmentSummary(value: AvailabilityTreatment): string {
  if (value === 'keep-enabled-explain-on-action') return 'Enabled'
  if (value === 'readonly-for-fixed-values') return 'Read-only'
  if (value === 'disabled-when-impossible') return 'Disabled'
  return 'Hidden'
}

function PreviewButton({
  children,
  iconOnly = false,
  kind,
  policy,
}: {
  children: React.ReactNode
  iconOnly?: boolean
  kind:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'loading'
    | 'disabled-primary'
    | 'disabled-secondary'
    | 'disabled-danger'
  policy: UiContract['componentPolicy']['button']
}) {
  const classNames = ['contract-button']
  const wrapClassNames = ['preview-button-wrap']

  if (kind === 'primary') classNames.push(`primary-${policy.primaryEmphasis}`)
  if (kind === 'secondary') classNames.push(`secondary-${policy.secondaryEmphasis}`)
  if (iconOnly) classNames.push('icon-only-preview')
  if (kind === 'danger') {
    wrapClassNames.push(`danger-placement-${policy.dangerPlacement}`)
    classNames.push(`danger-emphasis-${policy.dangerEmphasis}`)
  }
  if (kind === 'loading') classNames.push('is-loading', `primary-${policy.primaryEmphasis}`)
  if (kind.startsWith('disabled')) {
    classNames.push('is-disabled-preview')
  }

  return (
    <span className={wrapClassNames.join(' ')}>
      <button
        aria-disabled={kind.startsWith('disabled') ? true : undefined}
        aria-label={iconOnly && typeof children === 'string' ? children : undefined}
        className={classNames.join(' ')}
        type="button"
      >
        {shouldShowIcon(kind, policy) || iconOnly ? <Plus size={15} /> : null}
        {kind === 'loading' ? (
          <LoaderCircle className="spin-icon" size={16} />
        ) : null}
        {iconOnly ? (
          <span className="visually-hidden">{children}</span>
        ) : (
          children
        )}
      </button>
    </span>
  )
}

function shouldShowIcon(
  kind:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'loading'
    | 'disabled-primary'
    | 'disabled-secondary'
    | 'disabled-danger',
  policy: UiContract['componentPolicy']['button'],
): boolean {
  if (kind.startsWith('disabled') || kind === 'loading') return false
  return policy.iconAdornment === 'icons-when-clarifying'
}

function GuidanceCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="guidance-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  )
}

type LegacyButtonPolicy = Omit<
  Partial<UiContract['componentPolicy']['button']>,
  'dangerEmphasis' | 'iconAdornment' | 'iconOnlyPolicy' | 'secondaryEmphasis'
> & {
  dangerTreatment?: string
  secondaryEmphasis?: SecondaryEmphasis | 'ghost'
  iconAdornment?: IconAdornment
  iconOnlyPolicy?: IconOnlyPolicy
  iconUsage?: 'text-only' | 'label-with-icon-when-clarifying' | 'icon-only-for-recognizable-actions'
  disabledTreatment?: 'muted' | 'outline-muted' | 'reason-hint' | 'low-opacity'
  disabledReasonPolicy?: string
  loadingState?: 'spinner-with-label' | 'spinner-replaces-label-preserve-width' | 'spinner-replaces-label' | 'spinner-only' | 'disabled-label'
  dangerEmphasis?: DangerEmphasis | 'subtle' | 'outline' | 'filled' | 'ghost' | 'tertiary' | 'primary'
  buttonSize?: string
}

function normalizeContract(parsed: Partial<UiContract>): UiContract {
  const parsedButton = parsed.componentPolicy?.button as LegacyButtonPolicy | undefined
  const parsedTextField = parsed.componentPolicy?.textField as
    | Partial<UiContract['componentPolicy']['textField']>
    | undefined
  const parsedFocus = parsed.interactionPolicy?.focus as
    | Partial<UiContract['interactionPolicy']['focus']>
    | undefined
  const parsedValidation = parsed.interactionPolicy?.validation as
    | Partial<UiContract['interactionPolicy']['validation']>
    | undefined
  const parsedAvailability = parsed.interactionPolicy?.availability as
    | Partial<UiContract['interactionPolicy']['availability']>
    | undefined
  const parsedConfirmation = parsed.interactionPolicy?.confirmation as
    | Partial<UiContract['interactionPolicy']['confirmation']>
    | undefined
  const parsedSelect = parsed.componentPolicy?.select as
    | Partial<UiContract['componentPolicy']['select']>
    | undefined
  const parsedTabs = parsed.componentPolicy?.tabs as
    | Partial<UiContract['componentPolicy']['tabs']>
    | undefined
  const parsedToggle = parsed.componentPolicy?.toggle as
    | Partial<UiContract['componentPolicy']['toggle']>
    | undefined
  const parsedCheckbox = parsed.componentPolicy?.checkbox as
    | Partial<UiContract['componentPolicy']['checkbox']>
    | undefined
  const parsedCard = parsed.componentPolicy?.card as
    | Partial<UiContract['componentPolicy']['card']>
    | undefined
  const parsedSidePanel = parsed.componentPolicy?.sidePanel as
    | Partial<UiContract['componentPolicy']['sidePanel']>
    | undefined
  const parsedColor = parsed.designPolicy?.color as LegacyColorPolicy | undefined
  const parsedBrandIdentity = parsed.designPolicy?.brandIdentity as Partial<BrandIdentityPolicy> | undefined
  const legacyDanger = parsedButton?.dangerTreatment
  const legacyDangerPlacement: DangerPlacement =
    legacyDanger === 'inline' ? 'inline' : sampleContract.componentPolicy.button.dangerPlacement
  const legacyDangerEmphasis: DangerEmphasis =
    legacyDanger === 'confirmation-required'
      ? 'strong-danger'
      : normalizeDangerEmphasis(parsedButton?.dangerEmphasis)
  const buttonWithoutLegacy = removeLegacyDangerTreatment(parsedButton)
  const legacySecondaryEmphasis = normalizeSecondaryEmphasis(parsedButton?.secondaryEmphasis)
  const legacyIconAdornment = normalizeIconAdornment(parsedButton)
  const legacyIconOnlyPolicy = normalizeIconOnlyPolicy(parsedButton)

  return {
    ...sampleContract,
    ...parsed,
    meta: {
      ...sampleContract.meta,
      ...parsed.meta,
    },
    product: {
      ...sampleContract.product,
      ...parsed.product,
    },
    designPolicy: {
      ...sampleContract.designPolicy,
      ...parsed.designPolicy,
      brandIdentity: normalizeBrandIdentity(parsedBrandIdentity, parsedColor),
      colorProfileId: normalizeColorProfileId(parsed.designPolicy?.colorProfileId),
      color: normalizeColorTokens(parsedColor),
    },
    interactionPolicy: {
      ...sampleContract.interactionPolicy,
      ...parsed.interactionPolicy,
      focus: normalizeFocusPolicy(parsedFocus),
      validation: normalizeValidationPolicy(parsedValidation),
      availability: normalizeAvailabilityPolicy(parsedAvailability),
      confirmation: normalizeConfirmationPolicy(parsedConfirmation),
    },
    componentPolicy: {
      ...sampleContract.componentPolicy,
      ...parsed.componentPolicy,
      button: {
        ...sampleContract.componentPolicy.button,
        dangerPlacement: legacyDangerPlacement,
        dangerEmphasis: legacyDangerEmphasis,
        ...buttonWithoutLegacy,
        secondaryEmphasis: legacySecondaryEmphasis,
        iconAdornment: legacyIconAdornment,
        iconOnlyPolicy: legacyIconOnlyPolicy,
      },
      textField: normalizeTextFieldPolicy(parsedTextField),
      select: normalizeSelectPolicy(parsedSelect),
      tabs: normalizeTabsPolicy(parsedTabs),
      toggle: normalizeTogglePolicy(parsedToggle),
      checkbox: normalizeCheckboxPolicy(parsedCheckbox),
      card: normalizeCardPolicy(parsedCard),
      sidePanel: normalizeSidePanelPolicy(parsedSidePanel),
    },
  }
}

function normalizeFocusPolicy(
  value: Partial<UiContract['interactionPolicy']['focus']> | undefined,
): UiContract['interactionPolicy']['focus'] {
  const sample = sampleContract.interactionPolicy.focus

  return {
    visibility: isOneOf(value?.visibility, ['keyboard-and-active-inputs', 'all-focused-controls'])
      ? value.visibility
      : sample.visibility,
    indicatorStyle: isOneOf(value?.indicatorStyle, ['outer-ring', 'high-contrast-highlight'])
      ? value.indicatorStyle
      : sample.indicatorStyle,
  }
}

function normalizeValidationPolicy(
  value: Partial<UiContract['interactionPolicy']['validation']> | undefined,
): UiContract['interactionPolicy']['validation'] {
  const sample = sampleContract.interactionPolicy.validation

  return {
    trigger: isOneOf(value?.trigger, ['submit-or-step', 'blur-after-edit'])
      ? value.trigger
      : sample.trigger,
    presentation: isOneOf(value?.presentation, ['field-and-summary', 'field-message-only'])
      ? value.presentation
      : sample.presentation,
  }
}

function normalizeAvailabilityPolicy(
  value: Partial<UiContract['interactionPolicy']['availability']> | undefined,
): UiContract['interactionPolicy']['availability'] {
  const sample = sampleContract.interactionPolicy.availability

  return {
    treatment: isOneOf(value?.treatment, [
      'keep-enabled-explain-on-action',
      'readonly-for-fixed-values',
      'disabled-when-impossible',
      'hidden-when-not-applicable',
    ])
      ? value.treatment
      : sample.treatment,
    layout: isOneOf(value?.layout, [
      'preserve-space-for-temporary-state',
      'allow-reflow-when-not-applicable',
    ])
      ? value.layout
      : sample.layout,
  }
}

function normalizeConfirmationPolicy(
  value: Partial<UiContract['interactionPolicy']['confirmation']> | undefined,
): UiContract['interactionPolicy']['confirmation'] {
  const sample = sampleContract.interactionPolicy.confirmation

  return {
    surface: isOneOf(value?.surface, ['danger-dialog', 'typed-confirmation', 'undo-when-reversible'])
      ? value.surface
      : sample.surface,
    scope: isOneOf(value?.scope, ['destructive-only', 'destructive-bulk-unsaved'])
      ? value.scope
      : sample.scope,
  }
}

function normalizeSelectPolicy(
  value: Partial<UiContract['componentPolicy']['select']> | undefined,
): UiContract['componentPolicy']['select'] {
  const sample = sampleContract.componentPolicy.select
  const legacyValue = value as
    | {
        multiSelectedItemDisplay?: string
      }
    | undefined
  const migratedMultiSelectedItemDisplay =
    legacyValue?.multiSelectedItemDisplay === 'summary-count' ||
    legacyValue?.multiSelectedItemDisplay === 'count-badge'
      ? 'count-summary'
      : undefined

  return {
    emptyDisplay: isOneOf(value?.emptyDisplay, ['placeholder-text', 'blank-field'])
      ? value.emptyDisplay
      : sample.emptyDisplay,
    multiSelectedItemDisplay: isOneOf(value?.multiSelectedItemDisplay, [
      'chips',
      'inline-text',
      'chips-overflow-count',
      'count-summary',
    ])
      ? value.multiSelectedItemDisplay
      : migratedMultiSelectedItemDisplay ?? sample.multiSelectedItemDisplay,
    multiRemoveAffordance: isOneOf(value?.multiRemoveAffordance, [
      'chip-remove-button',
      'list-toggle-only',
    ])
      ? value.multiRemoveAffordance
      : sample.multiRemoveAffordance,
    searchFieldTreatment: isOneOf(value?.searchFieldTreatment, [
      'embedded-search-field',
      'separate-search-field',
    ])
      ? value.searchFieldTreatment
      : sample.searchFieldTreatment,
  }
}

function normalizeTabsPolicy(
  value: Partial<UiContract['componentPolicy']['tabs']> | undefined,
): UiContract['componentPolicy']['tabs'] {
  const sample = sampleContract.componentPolicy.tabs

  return {
    treatment: isOneOf(value?.treatment, ['segmented-contained', 'underline-tabs'])
      ? value.treatment
      : sample.treatment,
    adornment: isOneOf(value?.adornment, ['text-only', 'icon-when-clarifying', 'count-when-useful'])
      ? value.adornment
      : sample.adornment,
  }
}

function normalizeTogglePolicy(
  value: Partial<UiContract['componentPolicy']['toggle']> | undefined,
): UiContract['componentPolicy']['toggle'] {
  const sample = sampleContract.componentPolicy.toggle

  return {
    treatment: isOneOf(value?.treatment, ['switch-control', 'segmented-binary'])
      ? value.treatment
      : sample.treatment,
    labelPolicy: isOneOf(value?.labelPolicy, ['visible-label', 'label-plus-state-text'])
      ? value.labelPolicy
      : sample.labelPolicy,
  }
}

function normalizeCheckboxPolicy(
  value: Partial<UiContract['componentPolicy']['checkbox']> | undefined,
): UiContract['componentPolicy']['checkbox'] {
  const sample = sampleContract.componentPolicy.checkbox

  return {
    groupLayout: isOneOf(value?.groupLayout, ['stacked-list', 'inline-compact'])
      ? value.groupLayout
      : sample.groupLayout,
    choiceSurface: isOneOf(value?.choiceSurface, ['plain-label', 'row-surface', 'bordered-choice-row'])
      ? value.choiceSurface
      : sample.choiceSurface,
    mixedState: isOneOf(value?.mixedState, ['show-indeterminate', 'avoid-parent-checkbox'])
      ? value.mixedState
      : sample.mixedState,
  }
}

function normalizeCardPolicy(
  value: Partial<UiContract['componentPolicy']['card']> | undefined,
): UiContract['componentPolicy']['card'] {
  const sample = sampleContract.componentPolicy.card

  return {
    treatment: isOneOf(value?.treatment, ['outlined-card', 'filled-card', 'elevated-card'])
      ? value.treatment
      : sample.treatment,
    interaction: isOneOf(value?.interaction, ['static-card', 'clickable-card', 'selectable-card'])
      ? value.interaction
      : sample.interaction,
  }
}

function normalizeSidePanelPolicy(
  value: Partial<UiContract['componentPolicy']['sidePanel']> | undefined,
): UiContract['componentPolicy']['sidePanel'] {
  const sample = sampleContract.componentPolicy.sidePanel

  return {
    relationship: isOneOf(value?.relationship, ['persistent-inspector', 'temporary-drawer'])
      ? value.relationship
      : sample.relationship,
    responsive: isOneOf(value?.responsive, ['collapse-to-toggle', 'full-screen-sheet'])
      ? value.responsive
      : sample.responsive,
  }
}

function normalizeTextFieldPolicy(
  value: Partial<UiContract['componentPolicy']['textField']> | undefined,
): UiContract['componentPolicy']['textField'] {
  const sample = sampleContract.componentPolicy.textField
  const legacyValue = value as
    | (Partial<UiContract['componentPolicy']['textField']> & {
        assistiveText?: string
        fieldSize?: string
        labelPlacement?: string
        placeholderUsage?: string
        sideLabelAlignment?: string
      })
    | undefined
  const normalizedLabelPlacement = normalizeTextFieldLabelPlacement(
    legacyValue?.labelPlacement,
    legacyValue?.sideLabelAlignment,
  )

  return {
    fieldStyle: isOneOf(value?.fieldStyle, ['outlined', 'filled']) ? value.fieldStyle : sample.fieldStyle,
    labelPlacement: normalizedLabelPlacement ?? sample.labelPlacement,
    requiredIndicator: normalizeTextFieldRequiredIndicator(value?.requiredIndicator) ?? sample.requiredIndicator,
    messageAreaBehavior:
      normalizeTextFieldMessageAreaBehavior(
        legacyValue?.messageAreaBehavior,
        legacyValue?.assistiveText,
      ) ?? sample.messageAreaBehavior,
    placeholderUsage:
      normalizeTextFieldPlaceholderUsage(legacyValue?.placeholderUsage) ?? sample.placeholderUsage,
  }
}

function normalizeTextFieldLabelPlacement(
  labelPlacement: string | undefined,
  sideLabelAlignment: string | undefined,
): TextFieldLabelPlacement | undefined {
  if (isOneOf(labelPlacement, ['top', 'side-left', 'side-right'])) return labelPlacement
  if (labelPlacement === 'side') {
    return sideLabelAlignment === 'left' ? 'side-left' : 'side-right'
  }
  return undefined
}

function normalizeTextFieldRequiredIndicator(
  value: string | undefined,
): TextFieldRequiredIndicator | undefined {
  if (isOneOf(value, ['mark-optional', 'mark-required-default', 'mark-required-danger'])) return value
  if (value === 'mark-required') return 'mark-required-default'
  return undefined
}

function normalizeTextFieldMessageAreaBehavior(
  value: string | undefined,
  legacyAssistiveText: string | undefined,
): TextFieldMessageAreaBehavior | undefined {
  if (isOneOf(value, ['reserved-message-area', 'dynamic-message-area'])) return value
  if (legacyAssistiveText === 'helper-reserved') return 'reserved-message-area'
  if (legacyAssistiveText === 'message-when-needed') return 'dynamic-message-area'
  return undefined
}

function normalizeTextFieldPlaceholderUsage(
  value: string | undefined,
): TextFieldPlaceholderUsage | undefined {
  if (isOneOf(value, ['avoid-placeholder', 'format-example-only'])) return value
  if (value === 'example-only') return 'format-example-only'
  if (value === 'avoid-repeating-label') return 'avoid-placeholder'
  return undefined
}

function isOneOf<T extends string>(value: string | undefined, allowed: readonly T[]): value is T {
  return allowed.includes(value as T)
}

function normalizeColorProfileId(value: unknown): ActiveColorProfileId {
  if (value === 'lineage-slate') return 'deep-slate-blue'
  if (colorProfiles.some((profile) => profile.id === value)) return value as ColorProfileId
  if (value === 'custom') return 'custom'
  return sampleContract.designPolicy.colorProfileId
}

type LegacyColorPolicy = {
  action?: Partial<Record<'primary' | 'secondary', string>>
  background?: string
  border?: string
  brand?: Partial<Record<'header' | 'mark', string>> | string
  dark?: Partial<Record<ColorRoleKey | 'brandMark', string>>
  danger?: string
  info?: string
  light?: Partial<Record<ColorRoleKey | 'brandMark', string>>
  modes?: Partial<Record<ColorModeKey, Partial<Record<string, string>>>>
  mutedText?: string
  semantic?: Partial<Record<'success' | 'warning' | 'danger' | 'info', string>>
  success?: string
  surface?: string
  surfaceSoft?: string
  text?: string
  warning?: string
}

type ColorPolicySeed = {
  darkBackground?: string
  darkBrandBackground?: string
  darkBrandText?: string
  darkDanger?: string
  darkFocusInner?: string
  darkFocusOuter?: string
  darkInfo?: string
  darkMutedText?: string
  darkPrimary?: string
  darkPrimaryText?: string
  darkSecondary?: string
  darkSecondaryText?: string
  darkSuccess?: string
  darkSurface?: string
  darkSurfaceSoft?: string
  darkBorder?: string
  darkText?: string
  darkWarning?: string
  lightBackground?: string
  lightBrandBackground?: string
  lightBrandText?: string
  lightBorder?: string
  lightDanger?: string
  lightFocusInner?: string
  lightFocusOuter?: string
  lightInfo?: string
  lightMutedText?: string
  lightPrimary?: string
  lightSecondary?: string
  lightSuccess?: string
  lightSurface?: string
  lightSurfaceSoft?: string
  lightText?: string
  lightWarning?: string
}

function createColorPolicy(seed: ColorPolicySeed): ColorPolicy {
  return {
    light: {
      ...defaultColorPolicy.light,
      brandBackground: seed.lightBrandBackground ?? defaultColorPolicy.light.brandBackground,
      brandText: seed.lightBrandText ?? defaultColorPolicy.light.brandText,
      primary: seed.lightPrimary ?? defaultColorPolicy.light.primary,
      secondary: seed.lightSecondary ?? defaultColorPolicy.light.secondary,
      success: seed.lightSuccess ?? defaultColorPolicy.light.success,
      warning: seed.lightWarning ?? defaultColorPolicy.light.warning,
      danger: seed.lightDanger ?? defaultColorPolicy.light.danger,
      info: seed.lightInfo ?? defaultColorPolicy.light.info,
      focusOuter: seed.lightFocusOuter ?? defaultColorPolicy.light.focusOuter,
      focusInner: seed.lightFocusInner ?? defaultColorPolicy.light.focusInner,
      background: seed.lightBackground ?? defaultColorPolicy.light.background,
      surface: seed.lightSurface ?? defaultColorPolicy.light.surface,
      surfaceSoft: seed.lightSurfaceSoft ?? defaultColorPolicy.light.surfaceSoft,
      border: seed.lightBorder ?? defaultColorPolicy.light.border,
      text: seed.lightText ?? defaultColorPolicy.light.text,
      mutedText: seed.lightMutedText ?? defaultColorPolicy.light.mutedText,
    },
    dark: {
      ...defaultColorPolicy.dark,
      brandBackground: seed.darkBrandBackground ?? defaultColorPolicy.dark.brandBackground,
      brandText: seed.darkBrandText ?? defaultColorPolicy.dark.brandText,
      primary: seed.darkPrimary ?? defaultColorPolicy.dark.primary,
      primaryText: seed.darkPrimaryText ?? defaultColorPolicy.dark.primaryText,
      secondary: seed.darkSecondary ?? defaultColorPolicy.dark.secondary,
      secondaryText: seed.darkSecondaryText ?? defaultColorPolicy.dark.secondaryText,
      success: seed.darkSuccess ?? defaultColorPolicy.dark.success,
      warning: seed.darkWarning ?? defaultColorPolicy.dark.warning,
      danger: seed.darkDanger ?? defaultColorPolicy.dark.danger,
      info: seed.darkInfo ?? defaultColorPolicy.dark.info,
      focusOuter: seed.darkFocusOuter ?? defaultColorPolicy.dark.focusOuter,
      focusInner: seed.darkFocusInner ?? defaultColorPolicy.dark.focusInner,
      background: seed.darkBackground ?? defaultColorPolicy.dark.background,
      surface: seed.darkSurface ?? defaultColorPolicy.dark.surface,
      surfaceSoft: seed.darkSurfaceSoft ?? defaultColorPolicy.dark.surfaceSoft,
      border: seed.darkBorder ?? defaultColorPolicy.dark.border,
      text: seed.darkText ?? defaultColorPolicy.dark.text,
      mutedText: seed.darkMutedText ?? defaultColorPolicy.dark.mutedText,
    },
  }
}

function cloneBrandIdentity(identity: BrandIdentityPolicy): BrandIdentityPolicy {
  return { ...identity }
}

function cloneColorPolicy(policy: ColorPolicy): ColorPolicy {
  return {
    light: { ...policy.light },
    dark: { ...policy.dark },
  }
}

function normalizeBrandIdentity(
  value: Partial<BrandIdentityPolicy> | undefined,
  legacyColor: LegacyColorPolicy | undefined,
): BrandIdentityPolicy {
  const legacyBrand = typeof legacyColor?.brand === 'string' ? legacyColor.brand : undefined
  const brandObject = typeof legacyColor?.brand === 'object' ? legacyColor.brand : undefined
  const legacyMark =
    legacyColor?.light?.brandMark ??
    legacyColor?.dark?.brandMark ??
    legacyColor?.modes?.light?.brandMark ??
    legacyColor?.modes?.dark?.brandMark ??
    brandObject?.mark ??
    legacyBrand

  return {
    mark: pickHex(value?.mark, legacyMark, sampleContract.designPolicy.brandIdentity.mark),
    markBackground: pickIdentitySurfaceValue(
      value?.markBackground,
      undefined,
      sampleContract.designPolicy.brandIdentity.markBackground,
    ),
    markBorder: pickIdentitySurfaceValue(
      value?.markBorder,
      undefined,
      sampleContract.designPolicy.brandIdentity.markBorder,
    ),
  }
}

function normalizeColorTokens(value: LegacyColorPolicy | undefined): ColorPolicy {
  return {
    light: normalizeModeColors(value, 'light'),
    dark: normalizeModeColors(value, 'dark'),
  }
}

function normalizeModeColors(value: LegacyColorPolicy | undefined, mode: ColorModeKey): Record<ColorRoleKey, string> {
  const sampleMode = sampleContract.designPolicy.color[mode]
  return colorRoleFields.reduce<Record<ColorRoleKey, string>>((tokens, field) => {
    tokens[field.key] = pickHex(
      value?.[mode]?.[field.key],
      legacyColorValue(value, mode, field.key),
      sampleMode[field.key],
    )
    return tokens
  }, { ...sampleMode })
}

function legacyColorValue(
  value: LegacyColorPolicy | undefined,
  mode: ColorModeKey,
  key: ColorRoleKey,
): string | undefined {
  if (!value) return undefined
  if (value.modes?.[mode]?.[key]) return value.modes[mode]?.[key]
  if (mode === 'dark') return undefined

  const legacyBrand = typeof value.brand === 'string' ? value.brand : undefined
  const brandObject = typeof value.brand === 'object' ? value.brand : undefined

  const legacyMap: Partial<Record<ColorRoleKey, string | undefined>> = {
    background: value.background,
    border: value.border,
    brandBackground: brandObject?.header ?? legacyBrand,
    danger: value.semantic?.danger ?? value.danger,
    info: value.semantic?.info ?? value.info,
    mutedText: value.mutedText,
    primary: value.action?.primary ?? legacyBrand,
    secondary: value.action?.secondary,
    success: value.semantic?.success ?? value.success,
    surface: value.surface,
    surfaceSoft: value.surfaceSoft,
    text: value.text,
    warning: value.semantic?.warning ?? value.warning,
  }
  return legacyMap[key]
}

function pickHex(primary: string | undefined, fallback: string | undefined, defaultValue: string): string {
  if (isHexColor(primary)) return primary.toLowerCase()
  if (isHexColor(fallback)) return fallback.toLowerCase()
  return defaultValue
}

function pickIdentitySurfaceValue(
  primary: string | undefined,
  fallback: string | undefined,
  defaultValue: string,
): string {
  if (isIdentitySurfaceValue(primary)) return primary.toLowerCase()
  if (isIdentitySurfaceValue(fallback)) return fallback.toLowerCase()
  return defaultValue
}

function isHexColor(value: string | undefined): value is string {
  return /^#[0-9a-fA-F]{6}$/.test(value ?? '')
}

function isIdentitySurfaceValue(value: string | undefined): value is string {
  return value === 'transparent' || isHexColor(value)
}

function toColorPreviewStyle(
  colorPolicy: ColorPolicy,
  brandIdentity: BrandIdentityPolicy,
  mode: ColorModeKey,
): React.CSSProperties {
  const modeColors = colorPolicy[mode]
  return {
    '--page': modeColors.background,
    '--primary': modeColors.primary,
    '--primary-strong': modeColors.primary,
    '--primary-soft': mixHex(modeColors.primary, modeColors.surface, 0.88),
    '--primary-text': modeColors.primaryText,
    '--secondary-action': modeColors.secondary,
    '--secondary-action-text': modeColors.secondaryText,
    '--success': modeColors.success,
    '--warning': modeColors.warning,
    '--danger': modeColors.danger,
    '--info': modeColors.info,
    '--focus-outer': modeColors.focusOuter,
    '--focus-inner': modeColors.focusInner,
    '--brand-header': modeColors.brandBackground,
    '--brand-text': modeColors.brandText,
    '--brand-mark': brandIdentity.mark,
    '--brand-mark-background': brandIdentity.markBackground,
    '--brand-mark-border': brandIdentity.markBorder,
    '--surface': modeColors.surface,
    '--surface-soft': modeColors.surfaceSoft,
    '--surface-raised': modeColors.surface,
    '--text': modeColors.text,
    '--muted': modeColors.mutedText,
    '--subtle': mixHex(modeColors.text, modeColors.surface, 0.55),
    '--line': modeColors.border,
    '--line-strong': mixHex(modeColors.text, modeColors.surface, 0.74),
  } as React.CSSProperties
}

function mixHex(foreground: string, background: string, backgroundWeight: number): string {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  const fgWeight = 1 - backgroundWeight
  const mixed = {
    r: Math.round(fg.r * fgWeight + bg.r * backgroundWeight),
    g: Math.round(fg.g * fgWeight + bg.g * backgroundWeight),
    b: Math.round(fg.b * fgWeight + bg.b * backgroundWeight),
  }
  return rgbToHex(mixed)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

function removeLegacyDangerTreatment(
  button: LegacyButtonPolicy | undefined,
): Partial<UiContract['componentPolicy']['button']> {
  if (!button) return {}
  const copy: Record<string, unknown> = { ...button }
  delete copy.dangerTreatment
  delete copy.disabledReasonPolicy
  delete copy.disabledTreatment
  delete copy.loadingState
  delete copy.iconUsage
  delete copy.buttonSize
  if (copy.secondaryEmphasis === 'ghost') {
    delete copy.secondaryEmphasis
  }
  if (
    copy.dangerEmphasis === 'subtle' ||
    copy.dangerEmphasis === 'outline' ||
    copy.dangerEmphasis === 'filled'
  ) {
    delete copy.dangerEmphasis
  }
  return copy as Partial<UiContract['componentPolicy']['button']>
}

function normalizeSecondaryEmphasis(value: LegacyButtonPolicy['secondaryEmphasis']): SecondaryEmphasis {
  if (value === 'ghost') return sampleContract.componentPolicy.button.secondaryEmphasis
  if (value === 'outline' || value === 'neutral-filled' || value === 'tonal') return value
  return sampleContract.componentPolicy.button.secondaryEmphasis
}

function normalizeIconAdornment(button: LegacyButtonPolicy | undefined): IconAdornment {
  if (button?.iconAdornment === 'text-only-default' || button?.iconAdornment === 'icons-when-clarifying') {
    return button.iconAdornment
  }
  if (button?.iconUsage === 'label-with-icon-when-clarifying') return 'icons-when-clarifying'
  return sampleContract.componentPolicy.button.iconAdornment
}

function normalizeIconOnlyPolicy(button: LegacyButtonPolicy | undefined): IconOnlyPolicy {
  if (
    button?.iconOnlyPolicy === 'avoid-icon-only' ||
    button?.iconOnlyPolicy === 'allow-recognizable-with-accessible-name'
  ) {
    return button.iconOnlyPolicy
  }
  if (button?.iconUsage === 'icon-only-for-recognizable-actions') {
    return 'allow-recognizable-with-accessible-name'
  }
  return sampleContract.componentPolicy.button.iconOnlyPolicy
}

function normalizeDangerEmphasis(value: LegacyButtonPolicy['dangerEmphasis']): DangerEmphasis {
  if (value === 'subtle' || value === 'ghost') return 'low-emphasis'
  if (value === 'outline' || value === 'tertiary') return 'quiet-outline'
  if (value === 'filled' || value === 'primary') return 'strong-danger'
  if (value === 'low-emphasis' || value === 'quiet-outline' || value === 'strong-danger') return value
  return sampleContract.componentPolicy.button.dangerEmphasis
}

globalThis.uiContractEditorRoot ??= createRoot(document.getElementById('root')!)

globalThis.uiContractEditorRoot.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
