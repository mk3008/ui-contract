import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  ChevronRight,
  FolderOpen,
  LoaderCircle,
  Moon,
  PanelLeft,
  Plus,
  Save,
  Sun,
} from 'lucide-react'
import overviewContentSource from './content/overview-content.json'
import {
  CheckboxPreviewStage,
  CheckboxSectionedContractPanel,
  TabsPreviewStage,
  TabsSectionedContractPanel,
  TogglePreviewStage,
  ToggleSectionedContractPanel,
} from './control-contracts'
import {
  SelectPreviewStage,
  SelectSectionedContractPanel,
} from './select-contract'
import { ChoiceGroupLayoutContractPanel } from './choice-group-layout-contract'
import { InteractiveTargetContractPanel } from './interaction-target-contract'
import { SelectLikePolicySection } from './sectioned-policy-section'
import { InteractiveScreenPatterns, ScreenPatternPageArtifact } from './interactive-screen-patterns'
import { screenPatternExampleIds, type ScreenPatternExampleId } from './screen-pattern-evidence'
import { translateUiDocument, translateUiText, type UiLanguage } from './i18n'
import { createDefaultContract, loadContractJson, serializeContract } from './contract'
import { catalogDecision, catalogOptions } from './contract/catalog'
import { renderedMainDecisionIds } from './contract/rendered-decisions'
import type { ActiveColorProfileId, AvailabilityLayout, AvailabilityTreatment, BrandIdentityPolicy, CardInteraction, CardTreatment, ColorModeKey, ColorPolicy, ColorProfile, ColorProfileId, ColorRoleKey, ConfirmationScope, ConfirmationSurface, DangerEmphasis, DangerPlacement, FocusIndicatorStyle, FocusVisibility, IconAdornment, IconOnlyPolicy, PrimaryEmphasis, SecondaryEmphasis, SidePanelRelationship, SidePanelResponsive, TextFieldLabelPlacement, TextFieldMessageAreaBehavior, TextFieldPlaceholderUsage, TextFieldRequiredIndicator, TextFieldStyle, UiContract, ValidationPresentation, ValidationTrigger } from './contract/types'
import './styles.css'

declare global {
  var uiContractEditorRoot: Root | undefined
}

type Theme = 'light' | 'dark'
type LoadFeedback = { kind: 'malformed' | 'unsupported' | 'invalid' | 'warning'; details?: string[] }
type OverviewLanguage = UiLanguage
type OverviewSection = {
  eyebrow: string
  title: string
  body: string
  items?: string[]
}
type OverviewContent = {
  languageLabel: string
  translationNote: string
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
  | 'Contract Editor / State Feedback'
  | 'Contract Editor / Select'
  | 'Contract Editor / Tabs'
  | 'Contract Editor / Toggle'
  | 'Contract Editor / Checkbox'
  | 'Choice Group Layout'
  | 'Interactive Targets'
  | 'Contract Editor / Card'
  | 'Contract Editor / Side Panel'
  | 'Contract Editor / Confirmation'
  | 'Color Settings'
  | 'Screen Patterns / Search/List'
  | 'Screen Patterns / Edit Detail'
  | 'Screen Patterns / Edit List'
  | 'Screen Patterns / Read-only Detail'
  | 'Screen Patterns / Destructive Action'
  | 'Settings'
type MenuEntry = {
  label: string
  page: MenuItem
}
type NavigationGroup = {
  label: string
  children: MenuEntry[]
}
type ScreenPatternPage = Extract<MenuItem, `Screen Patterns / ${string}`>
type ScreenPatternMenuItem = {
  label: string
  page: ScreenPatternPage
  status: 'active'
  example: ScreenPatternExampleId
}
type ContractEditorComponent = 'button' | 'textField' | 'focus' | 'validation' | 'availability' | 'stateFeedback' | 'select' | 'tabs' | 'toggle' | 'checkbox' | 'card' | 'sidePanel' | 'confirmation'
type ButtonColoringOption<Value extends string> = {
  label: string
  note: string
  value: Value
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
    brandIdentity: defaultBrandIdentity,
    color: defaultColorPolicy,
  },
  {
    id: 'deep-slate-blue',
    brandIdentity: { mark: '#0f172a', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#0f172a',
      lightBrandText: '#ffffff',
      lightPrimary: '#2563eb',
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
    brandIdentity: { mark: '#dc2626', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#fef2f2',
      lightBrandText: '#450a0a',
      lightPrimary: '#0066cc',
      lightInfo: '#0369a1',
      lightDanger: '#991b1b',
      darkBrandBackground: '#450a0a',
      darkPrimary: '#92c5f9',
      darkPrimaryText: '#032142',
      darkInfo: '#38bdf8',
      darkDanger: '#f87171',
    }),
  },
  {
    id: 'operations-orange',
    brandIdentity: { mark: '#fc6d26', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#fff7ed',
      lightBrandText: '#431407',
      lightPrimary: '#1f75cb',
      lightInfo: '#0f766e',
      lightWarning: '#ab6100',
      darkBrandBackground: '#2a160d',
      darkBrandText: '#fff7ed',
      darkPrimary: '#63a6e9',
      darkPrimaryText: '#1d283e',
      darkInfo: '#2dd4bf',
      darkWarning: '#e9be74',
    }),
  },
  {
    id: 'trust-green',
    brandIdentity: { mark: '#15803d', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#ecfdf3',
      lightBrandText: '#052e16',
      lightPrimary: '#2563eb',
      lightInfo: '#0f766e',
      darkBrandBackground: '#052e16',
      darkPrimary: '#60a5fa',
      darkPrimaryText: '#0f172a',
      darkInfo: '#2dd4bf',
    }),
  },
  {
    id: 'teal-operations',
    brandIdentity: { mark: '#0f766e', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#f0fdfa',
      lightBrandText: '#042f2e',
      lightPrimary: '#0f766e',
      lightInfo: '#0369a1',
      darkBrandBackground: '#042f2e',
      darkPrimary: '#2dd4bf',
      darkInfo: '#38bdf8',
    }),
  },
  {
    id: 'horizon-cyan',
    brandIdentity: { mark: '#0891b2', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#ecfeff',
      lightBrandText: '#164e63',
      lightPrimary: '#0e7490',
      lightInfo: '#0284c7',
      darkBrandBackground: '#083344',
      darkBrandText: '#cffafe',
      darkPrimary: '#67e8f9',
      darkPrimaryText: '#164e63',
      darkInfo: '#38bdf8',
    }),
  },
  {
    id: 'enterprise-blue',
    brandIdentity: { mark: '#0f62fe', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#edf5ff',
      lightBrandText: '#001d6c',
      lightPrimary: '#0f62fe',
      lightInfo: '#0072c3',
      darkBrandBackground: '#000000',
      darkPrimary: '#78a9ff',
      darkInfo: '#33b1ff',
    }),
  },
  {
    id: 'financial-navy',
    brandIdentity: { mark: '#1e3a8a', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#eff6ff',
      lightBrandText: '#172554',
      lightPrimary: '#1d4ed8',
      lightInfo: '#0369a1',
      darkBrandBackground: '#0f172a',
      darkBrandText: '#dbeafe',
      darkPrimary: '#93c5fd',
      darkPrimaryText: '#172554',
      darkInfo: '#38bdf8',
    }),
  },
  {
    id: 'productivity-indigo',
    brandIdentity: { mark: '#4f46e5', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#eef2ff',
      lightBrandText: '#312e81',
      lightPrimary: '#4f46e5',
      lightInfo: '#2563eb',
      darkBrandBackground: '#111827',
      darkPrimary: '#818cf8',
      darkInfo: '#60a5fa',
    }),
  },
  {
    id: 'neutral-graphite',
    brandIdentity: { mark: '#3b82f6', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#f4f4f5',
      lightBrandText: '#18181b',
      lightPrimary: '#334155',
      lightInfo: '#2563eb',
      darkBrandBackground: '#09090b',
      darkPrimary: '#cbd5e1',
      darkPrimaryText: '#0f172a',
      darkInfo: '#60a5fa',
    }),
  },
  {
    id: 'office-neutral',
    brandIdentity: { mark: '#475569', markBackground: '#ffffff', markBorder: '#cbd5e1' },
    color: createColorPolicy({
      lightBrandBackground: '#f8fafc',
      lightBrandText: '#0f172a',
      lightPrimary: '#334155',
      lightInfo: '#2563eb',
      darkBrandBackground: '#111827',
      darkBrandText: '#f8fafc',
      darkPrimary: '#cbd5e1',
      darkPrimaryText: '#0f172a',
      darkInfo: '#60a5fa',
    }),
  },
]

const screenPatternMenuItems: ScreenPatternMenuItem[] = [
  { label: 'Search/List', page: 'Screen Patterns / Search/List', status: 'active', example: 'search-list' },
  { label: 'Edit Detail', page: 'Screen Patterns / Edit Detail', status: 'active', example: 'edit-detail' },
  { label: 'Edit List', page: 'Screen Patterns / Edit List', status: 'active', example: 'edit-list' },
  { label: 'Read-only Detail', page: 'Screen Patterns / Read-only Detail', status: 'active', example: 'read-only-detail' },
  { label: 'Destructive Action', page: 'Screen Patterns / Destructive Action', status: 'active', example: 'destructive-action' },
]

const navigationGroups: NavigationGroup[] = [
  {
    label: 'Foundations',
    children: [
      { label: 'Color Settings', page: 'Color Settings' },
      { label: 'Choice Group Layout', page: 'Choice Group Layout' },
      { label: 'Interactive Targets', page: 'Interactive Targets' },
    ],
  },
  {
    label: 'Components',
    children: [
      { label: 'Button', page: 'Contract Editor / Button' },
      { label: 'Text Field', page: 'Contract Editor / Text Field' },
      { label: 'Select', page: 'Contract Editor / Select' },
      { label: 'Toggle', page: 'Contract Editor / Toggle' },
      { label: 'Checkbox', page: 'Contract Editor / Checkbox' },
      { label: 'Tabs', page: 'Contract Editor / Tabs' },
      { label: 'Card', page: 'Contract Editor / Card' },
      { label: 'Side Panel', page: 'Contract Editor / Side Panel' },
    ],
  },
  {
    label: 'Interaction Policies',
    children: [
      { label: 'Focus', page: 'Contract Editor / Focus' },
      { label: 'Validation', page: 'Contract Editor / Validation' },
      { label: 'Availability', page: 'Contract Editor / Availability' },
      { label: 'State Feedback', page: 'Contract Editor / State Feedback' },
      { label: 'Confirmation', page: 'Contract Editor / Confirmation' },
    ],
  },
  { label: 'Screen Patterns', children: screenPatternMenuItems },
]

const primaryEmphasisOptions: Array<ButtonColoringOption<PrimaryEmphasis>> = catalogOptions('button-primary-emphasis')
const secondaryEmphasisOptions: Array<ButtonColoringOption<SecondaryEmphasis>> = catalogOptions('button-secondary-emphasis')
const dangerPlacementOptions: Array<{ value: DangerPlacement; label: string; note: string }> = catalogOptions('button-danger-placement')
const dangerEmphasisOptions: Array<ButtonColoringOption<DangerEmphasis>> = catalogOptions('button-danger-emphasis')
const iconAdornmentOptions: Array<{ value: IconAdornment; label: string; note: string }> = catalogOptions('button-icon-adornment')
const iconOnlyPolicyOptions: Array<{ value: IconOnlyPolicy; label: string; note: string }> = catalogOptions('button-icon-only-policy')

const focusVisibilityOptions: Array<{ value: FocusVisibility; label: string; note: string }> = catalogOptions('focus-visibility')
const focusIndicatorStyleOptions: Array<{ value: FocusIndicatorStyle; label: string; note: string }> = catalogOptions('focus-indicator-style')
const validationTriggerOptions: Array<{ value: ValidationTrigger; label: string; note: string }> = catalogOptions('validation-trigger')
const validationPresentationOptions: Array<{ value: ValidationPresentation; label: string; note: string }> = catalogOptions('validation-presentation')

const availabilityTreatmentOptions: Array<{ value: AvailabilityTreatment; label: string; note: string }> = catalogOptions('availability-treatment')
const availabilityLayoutOptions: Array<{ value: AvailabilityLayout; label: string; note: string }> = catalogOptions('availability-layout')

const cardTreatmentOptions: Array<{ value: CardTreatment; label: string; note: string }> = catalogOptions('card-treatment')
const cardInteractionOptions: Array<{ value: CardInteraction; label: string; note: string }> = catalogOptions('card-interaction')
const sidePanelRelationshipOptions: Array<{ value: SidePanelRelationship; label: string; note: string }> = catalogOptions('side-panel-relationship')
const sidePanelResponsiveOptions: Array<{ value: SidePanelResponsive; label: string; note: string }> = catalogOptions('side-panel-responsive')
const confirmationSurfaceOptions: Array<{ value: ConfirmationSurface; label: string; note: string }> = catalogOptions('confirmation-surface')
const confirmationScopeOptions: Array<{ value: ConfirmationScope; label: string; note: string }> = catalogOptions('confirmation-scope')

const overviewContent = overviewContentSource as Record<OverviewLanguage, OverviewContent>

const textFieldStyleOptions: Array<{ value: TextFieldStyle; label: string; note: string }> = catalogOptions('text-field-style')
const textFieldLabelPlacementOptions: Array<{ value: TextFieldLabelPlacement; label: string; note: string }> = catalogOptions('text-field-label-placement')
const textFieldRequiredIndicatorOptions: Array<{ value: TextFieldRequiredIndicator; label: string; note: string }> = catalogOptions('text-field-required-indicator')
const textFieldMessageAreaBehaviorOptions: Array<{ value: TextFieldMessageAreaBehavior; label: string; note: string }> = catalogOptions('text-field-message-area')
const textFieldPlaceholderUsageOptions: Array<{ value: TextFieldPlaceholderUsage; label: string; note: string }> = catalogOptions('text-field-placeholder')

void renderedMainDecisionIds

const colorRoleFields: Array<{ key: ColorRoleKey; group: string }> = [
  { key: 'brandBackground', group: 'Brand' }, { key: 'brandText', group: 'Brand' }, { key: 'primary', group: 'Actions' }, { key: 'primaryText', group: 'Actions' }, { key: 'success', group: 'Semantic' }, { key: 'warning', group: 'Semantic' }, { key: 'danger', group: 'Semantic' }, { key: 'info', group: 'Semantic' }, { key: 'focusOuter', group: 'Interaction' }, { key: 'focusInner', group: 'Interaction' }, { key: 'background', group: 'Neutral' }, { key: 'surface', group: 'Neutral' }, { key: 'surfaceSoft', group: 'Neutral' }, { key: 'border', group: 'Neutral' }, { key: 'text', group: 'Neutral' }, { key: 'mutedText', group: 'Neutral' },
]

function colorProfileOption(id: ActiveColorProfileId) {
  return catalogDecision('color-profile').options?.find((option) => option.value === id)
}

function App() {
  const [language, setLanguage] = useState<OverviewLanguage>(() => {
    return (localStorage.getItem('ui-contract-language') as OverviewLanguage | null) ?? 'ja'
  })
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('ui-contract-theme') as Theme | null) ?? 'light'
  })
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>('Overview')
  const [contract, setContract] = useState<UiContract>(() => createDefaultContract())
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null)
  const [loadFeedback, setLoadFeedback] = useState<LoadFeedback | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ui-contract-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('ui-contract-language', language)
  }, [language])

  useLayoutEffect(() => {
    translateUiDocument(language)
  })

  const buttonPolicy = contract.componentPolicy.button
  const textFieldPolicy = contract.componentPolicy.textField
  const selectPolicy = contract.componentPolicy.select
  const tabsPolicy = contract.componentPolicy.tabs
  const togglePolicy = contract.componentPolicy.toggle
  const checkboxPolicy = contract.componentPolicy.checkbox
  const choiceGroupLayout = contract.designPolicy.choiceGroupLayout
  const cardPolicy = contract.componentPolicy.card
  const sidePanelPolicy = contract.componentPolicy.sidePanel
  const focusPolicy = contract.interactionPolicy.focus
  const validationPolicy = contract.interactionPolicy.validation
  const availabilityPolicy = contract.interactionPolicy.availability
  const confirmationPolicy = contract.interactionPolicy.confirmation
  const brandIdentity = contract.designPolicy.brandIdentity
  const colorPolicy = contract.designPolicy.color
  const colorProfileId = contract.designPolicy.colorProfileId
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
    setContract((current) => {
      const availability = {
        ...current.interactionPolicy.availability,
        [key]: value,
      }

      if (availability.treatment === 'hidden-when-not-applicable') {
        availability.layout = 'allow-reflow-when-not-applicable'
      }

      return {
        ...current,
        interactionPolicy: {
          ...current.interactionPolicy,
          availability,
        },
      }
    })
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
    setLoadFeedback(null)

    try {
      const result = loadContractJson(await file.text())
      if (!result.ok) {
        const code = result.errors[0]?.code
        setLoadFeedback({
          kind: code === 'json.parse' ? 'malformed' : code === 'schema.unsupported-version' ? 'unsupported' : 'invalid',
          details: result.errors.slice(0, 3).map((issue) => `${issue.path}: ${issue.message}`),
        })
        return
      }
      setContract(result.contract)
      setLoadFeedback(result.warnings.length ? { kind: 'warning', details: result.warnings.slice(0, 3).map((issue) => issue.message) } : null)
      setLoadedFile({
        name: file.name,
        loadedAt: new Date().toLocaleString(),
      })
    } catch { setLoadFeedback({ kind: 'invalid' }) } finally {
      event.target.value = ''
    }
  }

  const handleSave = () => {
    const blob = new Blob([serializeContract(contract)], { type: 'application/json' })
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
    selectedMenu === 'Contract Editor / Availability' ||
    selectedMenu === 'Contract Editor / State Feedback'
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
                            : selectedMenu === 'Contract Editor / State Feedback'
                              ? 'stateFeedback'
        : 'button'
  const selectedScreenPattern = screenPatternMenuItems.find((item) => item.page === selectedMenu)
  const pageTitle =
    selectedScreenPattern?.label ?? (selectedMenu === 'Contract Editor / Button'
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
                            : selectedMenu === 'Contract Editor / State Feedback'
                              ? 'State Feedback Policy'
                : selectedMenu)
  const pageEyebrow = isContractEditorPage ? 'Contract Editor' : selectedScreenPattern ? 'Screen Patterns' : selectedMenu === 'Choice Group Layout' || selectedMenu === 'Interactive Targets' ? 'Foundation' : 'Main page'
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

    if (selectedMenu === 'Choice Group Layout') {
      return <ChoiceGroupLayoutContractPanel choiceGroupLayout={choiceGroupLayout} />
    }

    if (selectedMenu === 'Interactive Targets') {
      return <InteractiveTargetContractPanel />
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

    if (selectedScreenPattern) {
      return <ScreenPatternsPanel contract={contract} example={selectedScreenPattern.example} theme={theme} />
    }

    if (selectedMenu === 'Settings') {
      return <SettingsPanel theme={theme} onThemeChange={setTheme} />
    }

    return <OverviewPanel language={language} />
  }

  const artifactCandidate = new URLSearchParams(window.location.search).get('screen-artifact')
  const artifactExample = screenPatternExampleIds.find((example) => example === artifactCandidate)
  if (artifactExample) return <ScreenPatternPageArtifact colorMode={theme} contract={contract} example={artifactExample} />

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
              <div className="brand-name" data-i18n-skip>UI Contract Editor</div>
            </div>
          </div>
        </div>

        <div className="topbar-title">
          <h1>Contract Workspace</h1>
        </div>

        <div className="topbar-actions">
          <div className="topbar-language-switch" aria-label="Language">
            {(['ja', 'en'] as OverviewLanguage[]).map((option) => (
              <button
                className={language === option ? 'is-active' : ''}
                key={option}
                onClick={() => setLanguage(option)}
                type="button"
                aria-pressed={language === option}
              >
                {option === 'ja' ? 'JP' : 'EN'}
              </button>
            ))}
          </div>
          <input
            accept="application/json,.json"
            className="visually-hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <button aria-label="Load UI Contract" className="toolbar-button" onClick={handleLoad} type="button">
            <FolderOpen size={17} />
            <span data-i18n-skip>読込</span>
          </button>
          <button aria-label="Save UI Contract" className="toolbar-button" onClick={handleSave} type="button">
            <Save size={17} />
            <span data-i18n-skip>保存</span>
          </button>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            type="button"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <div className="app-body">
        {isSidebarOpen ? (
          <aside className="sidebar" id="main-sidebar" aria-label="Main menu">
            <nav className="menu-list" aria-label="Contract authoring navigation">
              <button className={`menu-item ${selectedMenu === 'Overview' ? 'is-active' : ''}`} onClick={() => setSelectedMenu('Overview')} type="button">
                <span>Overview</span>
                <span className="menu-meta" aria-hidden="true"><ChevronRight size={15} /></span>
              </button>
              <div className="authored-menu-flow" data-authored-flow="true">
                {navigationGroups.map((group) => (
                  <section className="menu-group" aria-labelledby={`navigation-group-${group.label}`} key={group.label}>
                    <h2 className="menu-group-label" id={`navigation-group-${group.label}`}>{group.label}</h2>
                    <div className="submenu-list" aria-label={`${group.label} sections`}>
                      {group.children.map((child) => (
                          <button
                            className={`submenu-item ${
                              selectedMenu === child.page ? 'is-active' : ''
                            }`}
                            key={child.page}
                            onClick={() => setSelectedMenu(child.page)}
                            type="button"
                          >
                            <span>{child.label}</span>
                            <span className="menu-meta" aria-hidden="true">
                              <ChevronRight size={14} />
                            </span>
                          </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              <div className="menu-settings" data-authored-flow="false">
                <div aria-label="Settings" className="menu-settings-divider" role="separator" />
                <button className={`menu-item ${selectedMenu === 'Settings' ? 'is-active' : ''}`} onClick={() => setSelectedMenu('Settings')} type="button">
                  <span>Settings</span>
                  <span className="menu-meta" aria-hidden="true"><ChevronRight size={15} /></span>
                </button>
              </div>
            </nav>
          </aside>
        ) : null}

        <main className="workspace">
          <section className="content-grid">
            <section className="main-panel">
              {!isOverviewPage ? (
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{pageEyebrow}</p>
                    <h2>{pageTitle}</h2>
                  </div>
                </div>
              ) : null}
              {loadFeedback ? <div className="load-feedback" role={loadFeedback.kind === 'warning' ? 'status' : 'alert'}><p>{translateUiText(loadFeedback.kind === 'malformed' ? 'Could not read this file as JSON. Choose a JSON file and try again.' : loadFeedback.kind === 'warning' ? 'Loaded with migration warnings.' : 'This Contract cannot be loaded. Choose a supported UI Contract file and try again.', language)}</p>{loadFeedback.details?.length ? <ul>{loadFeedback.details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}<button className="contract-button secondary-outline" onClick={handleLoad} type="button">{translateUiText('Try another file', language)}</button></div> : null}

              {renderMainContent()}

            </section>
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
        brandIdentity={brandIdentity}
        colorPolicy={colorPolicy}
        focusPolicy={focusPolicy}
        onUpdate={onFocusUpdate}
        theme={theme}
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

  if (selectedComponent === 'stateFeedback') {
    return <StateFeedbackContractPanel />
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
        title="Confirmation pattern"
        description="Choose how risky actions are confirmed or recovered. Button danger styling stays button-owned."
        controls={
          <OptionGroup
            title="Pattern"
            value={confirmationPolicy.surface}
            options={confirmationSurfaceOptions}
            onChange={(value) => onUpdate('surface', value)}
          />
        }
        preview={<ConfirmationSurfacePreview confirmationPolicy={confirmationPolicy} />}
      />

      <SelectLikePolicySection
        title="Confirmation scope"
        description={
          confirmationPolicy.surface === 'undo-when-reversible'
            ? 'Define which action classes need confirmation or recovery coverage.'
            : 'Define which action classes should interrupt the flow.'
        }
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

function StateFeedbackContractPanel() {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        title="Loading feedback"
        description="Interaction Policy requires observable busy feedback. Search/List owns which result region loads and the data it requests."
        controls={
          <section aria-label="Fixed rules" className="option-group">
            <h4>Invariant</h4>
            <div className="option-grid">
              <div className="option-card is-selected fixed-rule-card">
                <span className="option-note">Busy feedback is required; skeletons are only for structured content and inline indicators are for a single processing action.</span>
              </div>
            </div>
          </section>
        }
        preview={<LoadingFeedbackPreview />}
      />
      <SelectLikePolicySection
        title="Empty state"
        description="Interaction Policy requires plain-language explanation and an available next step. Search/List owns filters, result criteria, and whether no results exist."
        controls={
          <section aria-label="Fixed rules" className="option-group">
            <h4>Invariant</h4>
            <div className="option-grid">
              <div className="option-card is-selected fixed-rule-card">
                <span className="option-note">Explain empty conditions and an available next step; no-result criteria remain screen-owned.</span>
              </div>
            </div>
          </section>
        }
        preview={<EmptyStatePreview />}
      />
      <SelectLikePolicySection
        title="Error guidance"
        description="Interaction Policy requires plain-language recovery guidance. The screen pattern owns the failure cause, retry action, and affected content."
        controls={
          <section aria-label="Fixed rules" className="option-group">
            <h4>Invariant</h4>
            <div className="option-grid">
              <div className="option-card is-selected fixed-rule-card">
                <span className="option-note">Explain the problem and recovery path; error classification and retry behavior remain application-owned.</span>
              </div>
            </div>
          </section>
        }
        preview={<ErrorGuidancePreview />}
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
          <button className="contract-button danger-emphasis-outline" type="button">Archive record</button>
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
        <button className="contract-button danger-emphasis-outline" type="button">Delete record</button>
        <span>Danger intent starts on the action.</span>
      </div>
      <div className="confirmation-box-preview">
        <strong>{isTyped ? 'Type DELETE to confirm' : 'Confirm delete'}</strong>
        <p>{isTyped ? 'Use typed intent for rare high-impact actions.' : 'Explain the consequence before continuing.'}</p>
        {isTyped ? <div className="confirmation-input-preview">DELETE</div> : null}
        <div>
          <button className="contract-button secondary-outline" type="button">Cancel</button>
          <button className="contract-button danger-emphasis-filled" type="button">Delete</button>
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
  const includesBulk = confirmationPolicy.scope === 'destructive-and-bulk'

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
        <div>
          <strong>Leave unsaved edits</strong>
          <span>Screen-owned</span>
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
        title="Required indicator"
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
        title="Helper and error text"
        description="Keep guidance and validation outside the value area. Decide whether helper text and errors reserve space or appear only when needed."
        controls={
          <>
            <OptionGroup
              title="Helper/error text space"
              value={textFieldPolicy.messageAreaBehavior}
              options={textFieldMessageAreaBehaviorOptions}
              onChange={(value) => onUpdate('messageAreaBehavior', value)}
            />
            <OptionGroup
              title="Placeholder rule"
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
  brandIdentity,
  colorPolicy,
  focusPolicy,
  onUpdate,
  theme,
}: {
  brandIdentity: BrandIdentityPolicy
  colorPolicy: ColorPolicy
  focusPolicy: UiContract['interactionPolicy']['focus']
  onUpdate: <Key extends keyof UiContract['interactionPolicy']['focus']>(
    key: Key,
    value: UiContract['interactionPolicy']['focus'][Key],
  ) => void
  theme: Theme
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
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
        preview={<FocusPreviewStage focusPolicy={focusPolicy} previewStyle={toColorPreviewStyle(colorPolicy, brandIdentity, theme)} />}
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
  const hidesNotApplicable = availabilityPolicy.treatment === 'hidden-when-not-applicable'

  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        description="Define how unavailable controls are shown. Temporary unavailable layout is separate from not-applicable hiding."
        controls={
          <>
            <OptionGroup
              title="Unavailable treatment"
              value={availabilityPolicy.treatment}
              options={availabilityTreatmentOptions}
              onChange={(value) => onUpdate('treatment', value)}
            />
            {hidesNotApplicable ? (
              <p className="policy-note">
                Hidden not-applicable controls close their space. Layout preservation only applies to temporary unavailable controls.
              </p>
            ) : (
              <OptionGroup
                title="Unavailable layout"
                value={availabilityPolicy.layout}
                options={availabilityLayoutOptions}
                onChange={(value) => onUpdate('layout', value)}
              />
            )}
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
  return (
    <div
      className="component-preview preview-panel"
      style={toColorPreviewStyle(colorPolicy, brandIdentity, theme)}
    >
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
  children,
}: {
  caption: string
  children: React.ReactNode
  title: string
}) {
  return <div className="select-state-card">{children}</div>
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
      <div className="select-state-card text-field-state-card text-field-preview-frame">
        <PreviewTextField
          label="Customer name"
          required
          textFieldPolicy={textFieldPolicy}
          value="Northwind Co."
        />
        <PreviewTextField
          label="Account code"
          textFieldPolicy={textFieldPolicy}
          value=""
        />
      </div>
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
      <div className="select-state-card text-field-state-card text-field-preview-frame">
        <PreviewTextField
          label="Customer name"
          required
          textFieldPolicy={textFieldPolicy}
          value="Northwind Co."
        />
        <PreviewTextField
          label="Account code"
          textFieldPolicy={textFieldPolicy}
          value="AC-1042"
        />
      </div>
    </div>
  )
}

function TextFieldAssistivePreview({
  textFieldPolicy,
}: {
  textFieldPolicy: UiContract['componentPolicy']['textField']
}) {
  const reservesSpace = textFieldPolicy.messageAreaBehavior === 'reserved-message-area'

  return (
    <div className="text-field-section-preview">
      <div
        className={`select-state-card text-field-state-card text-field-preview-frame text-field-spacing-preview ${
          reservesSpace ? 'is-reserved' : 'is-dynamic'
        }`}
      >
        <PreviewTextField
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
    </div>
  )
}

function LoadingFeedbackPreview() {
  return (
    <div className="state-feedback-stage">
      <section aria-busy="true" className="state-feedback-card">
        <strong>Loading customers</strong>
        <span className="state-feedback-skeleton" />
        <span className="state-feedback-skeleton short" />
        <small>Busy status applies to this results region.</small>
      </section>
    </div>
  )
}

function EmptyStatePreview() {
  return (
    <div className="state-feedback-stage">
      <section className="state-feedback-card">
        <strong>No matching customers</strong>
        <p>Try clearing a filter or using a broader search term.</p>
        <button type="button">Clear filters</button>
      </section>
    </div>
  )
}

function ErrorGuidancePreview() {
  return (
    <div className="state-feedback-stage">
      <section className="state-feedback-card is-error" role="status">
        <strong>Customers could not be loaded</strong>
        <p>Check the connection and try again.</p>
        <button type="button">Try again</button>
      </section>
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
          {disabled ? 'Unavailable' : readonly ? 'Read only' : 'Ready'}
        </span>
      </div>

      <label className="availability-field-preview">
        <span>Account status</span>
        <input readOnly value={readonly ? 'Approved - read only' : 'Ready for review'} />
      </label>

      {availabilityPolicy.treatment === 'keep-enabled-explain-on-action' ? (
        <div className="availability-message">Complete billing details before export.</div>
      ) : null}
    </div>
  )
}

function FocusPreviewStage({
  focusPolicy,
  previewStyle,
}: {
  focusPolicy: UiContract['interactionPolicy']['focus']
  previewStyle?: React.CSSProperties
}) {
  const focusClass = `focus-style-${focusPolicy.indicatorStyle}`
  const showPointerFocus = focusPolicy.visibility === 'all-focused-controls'
  const [inputModality, setInputModality] = useState<'keyboard' | 'pointer'>('keyboard')
  const [customerName, setCustomerName] = useState('Northwind Co.')

  return (
    <div
      className={`focus-stage ${focusClass} focus-visibility-${focusPolicy.visibility}`}
      data-input-modality={inputModality}
      onKeyDownCapture={() => setInputModality('keyboard')}
      onPointerDownCapture={() => setInputModality('pointer')}
      style={previewStyle}
    >
      <section className="focus-state-samples" aria-label="Focus state samples">
        <h4>Static samples</h4>
        <div className="focus-sample-grid">
          <div className="focus-sample-section">
            <span>Keyboard focus</span>
            <div className="focus-static-control focus-sample-primary focus-demo-indicator">Save changes</div>
          </div>

          <div className="focus-sample-section">
            <span>Pointer focus</span>
            <div className={`focus-static-control ${showPointerFocus ? 'focus-demo-indicator' : 'is-pointer-quiet'}`}>Preview</div>
          </div>

          <div className="focus-sample-section">
            <span>Active text input</span>
            <div className="focus-static-input focus-demo-indicator" data-i18n-skip>Northwind Co.</div>
          </div>
        </div>
      </section>

      <section className="focus-interactive-preview" aria-label="Interactive focus preview">
        <h4>Interactive preview</h4>
        <div className="focus-sample-row">
          <button className="focus-sample-control focus-sample-primary" type="button">Save changes</button>
          <button className="focus-sample-control" type="button">Cancel</button>
          <label className="focus-sample-field">
            <span>Customer name</span>
            <input className="focus-sample-input" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>
        </div>
      </section>
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
  helper?: string
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
  const reservesMessageSpace = textFieldPolicy.messageAreaBehavior === 'reserved-message-area'
  const message = error ?? helper ?? ''
  const showAssistiveText = Boolean(message) || reservesMessageSpace
  const messageStateClass = error ? 'is-error' : message ? '' : 'is-reserved-empty'
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
          className={`preview-field-message ${messageStateClass} ${showAssistiveText ? '' : 'is-empty'}`}
          id={`${id}-message`}
        >
          {message || '\u00a0'}
        </p>
      </div>
    </div>
  )
}

function examplePlaceholder(label: string): string {
  if (label === 'Account code') return 'AC-1042'
  return ''
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
  const contrastIssues = getColorContrastIssues(colorPolicy)

  return (
    <div className="editor-panel">
      <div className="color-workbench">
        <div className="color-controls">
          <section className="color-section">
            <div className="profile-header">
              <div>
                <h4>Profile Preset</h4>
                <p>
                  {colorProfileOption(colorProfileId)?.note ??
                    'Custom colors based on a preset or imported contract.'}
                </p>
              </div>
              <select
                aria-label="Color profile preset"
                className="profile-select option-title"
                onChange={(event) => {
                  if (event.target.value !== 'custom') {
                    onProfileChange(event.target.value as ColorProfileId)
                  }
                }}
                value={colorProfileId}
              >
                {colorProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {colorProfileOption(profile.id)?.label}
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
                  <span className="profile-card-name option-title">{colorProfileOption(profile.id)?.label}</span>
                  <span aria-hidden="true" className="profile-card-swatches option-title">
                    <span
                      style={{ background: profile.brandIdentity.mark }}
                      title="Brand mark"
                    />
                    <span
                      style={{ background: profile.color.light.primary }}
                      title="Primary action"
                    />
                    <span
                      style={{ background: profile.color.light.surfaceSoft }}
                      title="Soft surface"
                    />
                  </span>
                </button>
              ))}
            </div>
          </section>
          <ColorSection title="Contrast checks">
            {contrastIssues.length ? (
              <div className="contrast-warning-list" role="status">
                {contrastIssues.map((issue) => (
                  <div className="contrast-warning" key={`${issue.mode}-${issue.pair}`}>
                    <strong>{issue.mode === 'light' ? 'Light' : 'Dark'}: {issue.pair}</strong>
                    <span>
                      Contrast {issue.ratio.toFixed(2)}:1 is below {issue.minimum}:1.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="contrast-ok">Key text, action, and focus color pairs meet the review thresholds.</p>
            )}
          </ColorSection>
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
                <span className="option-title">Role</span>
                <span className="option-title">Light</span>
                <span className="option-title">Dark</span>
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
        <strong className="option-title">{label}</strong>
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
  field: { key: ColorRoleKey }
  lightValue: string
  onChange: (mode: ColorModeKey, value: string) => void
}) {
  const entry = catalogDecision(`color-light-${field.key}`)
  return (
    <div className="color-role-row">
      <span className="color-copy">
        <strong className="option-title">{entry.label}</strong>
        <span>{entry.note}</span>
      </span>
      <ColorValueInput
        label={`${entry.label} light`}
        value={lightValue}
        onChange={(value) => onChange('light', value)}
      />
      <ColorValueInput
        label={`${entry.label} dark`}
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
      <div className="mode-preview-grid">
        <ModeColorPreview brandIdentity={brandIdentity} colorPolicy={colorPolicy} mode="light" />
        <ModeColorPreview brandIdentity={brandIdentity} colorPolicy={colorPolicy} mode="dark" />
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
            <span data-i18n-skip>Northwind Co.</span>
            <span className="status-text success">Complete</span>
            <span data-i18n-skip>A. Tanaka</span>
          </div>
          <div className="sample-table-row">
            <span data-i18n-skip>Contoso Ltd.</span>
            <span className="status-text warning">Needs review</span>
            <span data-i18n-skip>M. Suzuki</span>
          </div>
          <div className="sample-table-row">
            <span data-i18n-skip>Fabrikam</span>
            <span className="status-text danger">Blocked</span>
            <span data-i18n-skip>K. Sato</span>
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

function ScreenPatternsPanel({ contract, example, theme }: { contract: UiContract; example: ScreenPatternExampleId; theme: Theme }) {
  return (
    <div className="screen-pattern-panel">
      <InteractiveScreenPatterns
        contract={contract}
        example={example}
        button={contract.componentPolicy.button}
        confirmation={contract.interactionPolicy.confirmation}
        colorMode={theme}
      />
    </div>
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

function OverviewPanel({ language }: { language: OverviewLanguage }) {
  const content = overviewContent[language]
  const englishSectionsByEyebrow = new Map(overviewContent.en.sections.map((section) => [section.eyebrow, section]))

  return (
    <div className="overview-panel">
      <div className="overview-hero">
        <div>
          <h3>{content.title}</h3>
          <p>{content.lead}</p>
          <div className="overview-keywords" aria-label="Overview keywords">
            {content.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="overview-flow">
        {content.sections.map((section) => (
          <section className="overview-item" key={section.title}>
            <p className="eyebrow">{section.eyebrow}</p>
            <h4>{englishSectionsByEyebrow.get(section.eyebrow)?.title ?? section.title}</h4>
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

type ColorPolicySeed = Partial<Record<
  | 'lightBackground' | 'lightBrandBackground' | 'lightBrandText' | 'lightBorder' | 'lightDanger' | 'lightFocusInner' | 'lightFocusOuter' | 'lightInfo' | 'lightMutedText' | 'lightPrimary' | 'lightSuccess' | 'lightSurface' | 'lightSurfaceSoft' | 'lightText' | 'lightWarning'
  | 'darkBackground' | 'darkBrandBackground' | 'darkBrandText' | 'darkBorder' | 'darkDanger' | 'darkFocusInner' | 'darkFocusOuter' | 'darkInfo' | 'darkMutedText' | 'darkPrimary' | 'darkPrimaryText' | 'darkSuccess' | 'darkSurface' | 'darkSurfaceSoft' | 'darkText' | 'darkWarning',
  string
>>

function createColorPolicy(seed: ColorPolicySeed): ColorPolicy {
  return {
    light: {
      ...defaultColorPolicy.light,
      brandBackground: seed.lightBrandBackground ?? defaultColorPolicy.light.brandBackground,
      brandText: seed.lightBrandText ?? defaultColorPolicy.light.brandText,
      primary: seed.lightPrimary ?? defaultColorPolicy.light.primary,
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
    '--subtle-action': modeColors.text,
    '--subtle-action-soft': mixHex(modeColors.primary, modeColors.surface, 0.9),
    '--subtle-action-soft-border': mixHex(modeColors.primary, modeColors.surface, 0.74),
    '--subtle-action-neutral': modeColors.surfaceSoft,
    '--subtle-action-neutral-border': modeColors.border,
    '--subtle-action-text': modeColors.text,
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

type ColorContrastIssue = {
  minimum: number
  mode: ColorModeKey
  pair: string
  ratio: number
}

function getColorContrastIssues(colorPolicy: ColorPolicy): ColorContrastIssue[] {
  return (['light', 'dark'] as const).flatMap((mode) => {
    const colors = colorPolicy[mode]
    const checks: Array<{ foreground: string; background: string; minimum: number; pair: string }> = [
      { foreground: colors.brandText, background: colors.brandBackground, minimum: 4.5, pair: 'Brand text on brand background' },
      { foreground: colors.primaryText, background: colors.primary, minimum: 4.5, pair: 'Primary text on primary action' },
      { foreground: colors.text, background: colors.surface, minimum: 4.5, pair: 'Text on surface' },
      { foreground: colors.text, background: colors.background, minimum: 4.5, pair: 'Text on page background' },
      { foreground: colors.mutedText, background: colors.surface, minimum: 3, pair: 'Muted text on surface' },
      { foreground: colors.focusOuter, background: colors.background, minimum: 3, pair: 'Focus outer on page background' },
      { foreground: colors.focusInner, background: colors.focusOuter, minimum: 3, pair: 'Focus inner against focus outer' },
    ]

    return checks
      .map((check) => ({ ...check, mode, ratio: contrastRatio(check.foreground, check.background) }))
      .filter((check) => check.ratio < check.minimum)
      .map(({ minimum, mode, pair, ratio }) => ({ minimum, mode, pair, ratio }))
  })
}

function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(hexToRgb(foreground))
  const bg = relativeLuminance(hexToRgb(background))
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)
  return (lighter + 0.05) / (darker + 0.05)
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}


globalThis.uiContractEditorRoot ??= createRoot(document.getElementById('root')!)

globalThis.uiContractEditorRoot.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
