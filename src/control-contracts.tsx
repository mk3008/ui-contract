import type { ReactNode } from 'react'
import { Check, Columns3, PanelTop, ToggleLeft } from 'lucide-react'

type Option<T extends string> = {
  value: T
  label: string
  note: string
}

export type TabsTreatment = 'segmented-contained' | 'underline-tabs'
export type TabsAdornment = 'text-only' | 'icon-when-clarifying' | 'count-when-useful'
export type ToggleTreatment = 'switch-control' | 'segmented-binary'
export type ToggleLabelPolicy = 'visible-label' | 'label-plus-state-text'
export type CheckboxGroupLayout = 'stacked-list' | 'inline-compact'
export type CheckboxChoiceSurface = 'plain-label' | 'row-surface' | 'bordered-choice-row'
export type CheckboxMixedState = 'show-indeterminate' | 'avoid-parent-checkbox'

export type TabsPolicy = {
  treatment: TabsTreatment
  adornment: TabsAdornment
}

export type TogglePolicy = {
  treatment: ToggleTreatment
  labelPolicy: ToggleLabelPolicy
}

export type CheckboxPolicy = {
  groupLayout: CheckboxGroupLayout
  choiceSurface: CheckboxChoiceSurface
  mixedState: CheckboxMixedState
}

export const tabsTreatmentOptions: Array<Option<TabsTreatment>> = [
  {
    value: 'segmented-contained',
    label: 'Segmented',
    note: 'Use a contained tab group for panels inside a work surface.',
  },
  {
    value: 'underline-tabs',
    label: 'Underline',
    note: 'Use lighter page-level tabs when the surrounding structure is clear.',
  },
]

export const tabsAdornmentOptions: Array<Option<TabsAdornment>> = [
  {
    value: 'text-only',
    label: 'Text only',
    note: 'Keep tab meaning in the visible label.',
  },
  {
    value: 'icon-when-clarifying',
    label: 'Icon when useful',
    note: 'Add icons only when they clarify stable tab categories.',
  },
  {
    value: 'count-when-useful',
    label: 'Count when useful',
    note: 'Show counts when users compare tab contents.',
  },
]

export const toggleTreatmentOptions: Array<Option<ToggleTreatment>> = [
  {
    value: 'switch-control',
    label: 'Switch',
    note: 'Use for one setting that takes effect immediately.',
  },
  {
    value: 'segmented-binary',
    label: 'Segmented',
    note: 'Use when both states need visible names.',
  },
]

export const toggleLabelPolicyOptions: Array<Option<ToggleLabelPolicy>> = [
  {
    value: 'visible-label',
    label: 'Visible label',
    note: 'Keep the setting name visible beside the control.',
  },
  {
    value: 'label-plus-state-text',
    label: 'Label + state',
    note: 'Add On/Off text when the state must be readable without color.',
  },
]

export const checkboxGroupLayoutOptions: Array<Option<CheckboxGroupLayout>> = [
  {
    value: 'stacked-list',
    label: 'Stacked list',
    note: 'Use for scan-friendly form or filter choices.',
  },
  {
    value: 'inline-compact',
    label: 'Inline compact',
    note: 'Use only for a short set of closely related choices.',
  },
]

export const checkboxChoiceSurfaceOptions: Array<Option<CheckboxChoiceSurface>> = [
  {
    value: 'plain-label',
    label: 'Plain label',
    note: 'Use the familiar checkbox and label for ordinary forms.',
  },
  {
    value: 'row-surface',
    label: 'Row surface',
    note: 'Use a row background when choices are scanned as a list.',
  },
  {
    value: 'bordered-choice-row',
    label: 'Bordered row',
    note: 'Make the clickable choice area explicit for dense tools.',
  },
]

export const checkboxMixedStateOptions: Array<Option<CheckboxMixedState>> = [
  {
    value: 'show-indeterminate',
    label: 'Indeterminate',
    note: 'Show a mixed state when a parent represents partial selection.',
  },
  {
    value: 'avoid-parent-checkbox',
    label: 'No parent checkbox',
    note: 'Avoid a parent checkbox when partial state would be unclear.',
  },
]

export function TabsSectionedContractPanel({
  tabsPolicy,
  onUpdate,
}: {
  tabsPolicy: TabsPolicy
  onUpdate: <Key extends keyof TabsPolicy>(key: Key, value: TabsPolicy[Key]) => void
}) {
  return (
    <ControlSectionedPanel>
      <ControlPolicySection
        title="Tab structure"
        description="Tabs switch related panels in the same workspace. They do not navigate unrelated tasks."
        controls={
          <>
            <OptionGroup
              title="Tab treatment"
              value={tabsPolicy.treatment}
              options={tabsTreatmentOptions}
              onChange={(value) => onUpdate('treatment', value)}
            />
            <OptionGroup
              title="Tab adornment"
              value={tabsPolicy.adornment}
              options={tabsAdornmentOptions}
              onChange={(value) => onUpdate('adornment', value)}
            />
          </>
        }
        preview={<TabsPreview tabsPolicy={tabsPolicy} />}
      />
    </ControlSectionedPanel>
  )
}

export function ToggleSectionedContractPanel({
  togglePolicy,
  onUpdate,
}: {
  togglePolicy: TogglePolicy
  onUpdate: <Key extends keyof TogglePolicy>(key: Key, value: TogglePolicy[Key]) => void
}) {
  return (
    <ControlSectionedPanel>
      <ControlPolicySection
        title="Toggle behavior"
        description="Use toggles for immediate binary settings. Deferred form choices remain checkbox-owned."
        controls={
          <>
            <OptionGroup
              title="Toggle treatment"
              value={togglePolicy.treatment}
              options={toggleTreatmentOptions}
              onChange={(value) => onUpdate('treatment', value)}
            />
            <OptionGroup
              title="State label"
              value={togglePolicy.labelPolicy}
              options={toggleLabelPolicyOptions}
              onChange={(value) => onUpdate('labelPolicy', value)}
            />
          </>
        }
        preview={<TogglePreview togglePolicy={togglePolicy} />}
      />
    </ControlSectionedPanel>
  )
}

export function CheckboxSectionedContractPanel({
  checkboxPolicy,
  onUpdate,
}: {
  checkboxPolicy: CheckboxPolicy
  onUpdate: <Key extends keyof CheckboxPolicy>(key: Key, value: CheckboxPolicy[Key]) => void
}) {
  return (
    <ControlSectionedPanel>
      <ControlPolicySection
        title="Checkbox choices"
        description="Checkboxes represent independent choices, often applied with a form, filter, or screen action."
        controls={
          <>
            <OptionGroup
              title="Group layout"
              value={checkboxPolicy.groupLayout}
              options={checkboxGroupLayoutOptions}
              onChange={(value) => onUpdate('groupLayout', value)}
            />
            <OptionGroup
              title="Choice surface"
              value={checkboxPolicy.choiceSurface}
              options={checkboxChoiceSurfaceOptions}
              onChange={(value) => onUpdate('choiceSurface', value)}
            />
            <OptionGroup
              title="Mixed state"
              value={checkboxPolicy.mixedState}
              options={checkboxMixedStateOptions}
              onChange={(value) => onUpdate('mixedState', value)}
            />
          </>
        }
        preview={<CheckboxPreview checkboxPolicy={checkboxPolicy} />}
      />
    </ControlSectionedPanel>
  )
}

export function TabsPreviewStage({ tabsPolicy }: { tabsPolicy: TabsPolicy }) {
  return <TabsPreview tabsPolicy={tabsPolicy} />
}

export function TogglePreviewStage({ togglePolicy }: { togglePolicy: TogglePolicy }) {
  return <TogglePreview togglePolicy={togglePolicy} />
}

export function CheckboxPreviewStage({ checkboxPolicy }: { checkboxPolicy: CheckboxPolicy }) {
  return <CheckboxPreview checkboxPolicy={checkboxPolicy} />
}

function ControlSectionedPanel({ children }: { children: ReactNode }) {
  return <div className="select-sectioned-panel">{children}</div>
}

function ControlPolicySection({
  controls,
  description,
  preview,
  title,
}: {
  controls: ReactNode
  description: string
  preview: ReactNode
  title: string
}) {
  return (
    <section className="select-policy-section">
      <div className="select-policy-heading">
        <h3>{title}</h3>
        <p>{description}</p>
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

function OptionGroup<T extends string>({
  onChange,
  options,
  title,
  value,
}: {
  onChange: (value: T) => void
  options: Array<Option<T>>
  title: string
  value: T
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

function TabsPreview({ tabsPolicy }: { tabsPolicy: TabsPolicy }) {
  const className = tabsPolicy.treatment === 'underline-tabs'
    ? 'control-tabs control-tabs-underline'
    : 'control-tabs control-tabs-segmented'

  return (
    <div className="control-stage">
      <ControlStateCard title="Panel tabs" caption="Switch related views in one work area">
        <div className={className} role="tablist" aria-label="Preview tabs">
          <PreviewTab active adornment={tabsPolicy.adornment} icon={<PanelTop size={14} />} label="Open" count="12" />
          <PreviewTab adornment={tabsPolicy.adornment} icon={<Columns3 size={14} />} label="History" count="4" />
          <PreviewTab adornment={tabsPolicy.adornment} icon={<ToggleLeft size={14} />} label="Inspector" count="2" />
        </div>
      </ControlStateCard>
      <ControlStateCard title="Selected panel" caption="Active tab has a visible panel relationship">
        <div className="control-tab-panel">
          <strong>Open SQL</strong>
          <span>Panel content belongs to the selected tab.</span>
        </div>
      </ControlStateCard>
    </div>
  )
}

function PreviewTab({
  active = false,
  adornment,
  count,
  icon,
  label,
}: {
  active?: boolean
  adornment: TabsAdornment
  count: string
  icon: ReactNode
  label: string
}) {
  return (
    <button aria-selected={active} className={active ? 'is-active' : ''} role="tab" type="button">
      {adornment === 'icon-when-clarifying' ? icon : null}
      <span>{label}</span>
      {adornment === 'count-when-useful' ? <small>{count}</small> : null}
    </button>
  )
}

function TogglePreview({ togglePolicy }: { togglePolicy: TogglePolicy }) {
  return (
    <div className="control-stage">
      <ControlStateCard title="Immediate setting" caption="State changes when the user toggles it">
        {togglePolicy.treatment === 'segmented-binary' ? (
          <div className="control-binary-segment" role="group" aria-label="Visibility setting">
            <button type="button">Hidden</button>
            <button className="is-active" type="button">Shown</button>
          </div>
        ) : (
          <label className="control-switch-preview">
            <span className="control-switch is-on" aria-hidden="true" />
            <span>Show aliases</span>
            {togglePolicy.labelPolicy === 'label-plus-state-text' ? <strong>On</strong> : null}
          </label>
        )}
      </ControlStateCard>
      <ControlStateCard title="Off state" caption="Meaning is still available without color alone">
        <label className="control-switch-preview">
          <span className="control-switch" aria-hidden="true" />
          <span>Show columns</span>
          {togglePolicy.labelPolicy === 'label-plus-state-text' ? <strong>Off</strong> : null}
        </label>
      </ControlStateCard>
    </div>
  )
}

function CheckboxPreview({ checkboxPolicy }: { checkboxPolicy: CheckboxPolicy }) {
  const groupClass = checkboxPolicy.groupLayout === 'inline-compact'
    ? 'control-checkbox-group is-inline'
    : 'control-checkbox-group'

  return (
    <div className="control-stage">
      <ControlStateCard title="Choice group" caption="Independent choices can be selected together">
        <div className={groupClass}>
          <CheckboxRow checked choiceSurface={checkboxPolicy.choiceSurface} label="Tables" />
          <CheckboxRow checked choiceSurface={checkboxPolicy.choiceSurface} label="CTEs" />
          <CheckboxRow choiceSurface={checkboxPolicy.choiceSurface} label="Derived" />
        </div>
      </ControlStateCard>
      <ControlStateCard title="Parent selection" caption="Partial selection needs explicit treatment">
        {checkboxPolicy.mixedState === 'show-indeterminate' ? (
          <CheckboxRow checked="mixed" choiceSurface={checkboxPolicy.choiceSurface} label="All node types" />
        ) : (
          <div className="control-parent-summary">
            <span>2 of 3 node types selected</span>
            <button type="button">Select all</button>
          </div>
        )}
      </ControlStateCard>
    </div>
  )
}

function CheckboxRow({
  checked = false,
  choiceSurface,
  label,
}: {
  checked?: boolean | 'mixed'
  choiceSurface: CheckboxChoiceSurface
  label: string
}) {
  const rowStateClass = checked === 'mixed' ? 'is-mixed-row' : checked ? 'is-checked-row' : ''

  return (
    <label className={`control-checkbox-row surface-${choiceSurface} ${rowStateClass}`}>
      <span className={`control-checkbox-box ${checked ? 'is-checked' : ''} ${checked === 'mixed' ? 'is-mixed' : ''}`} aria-hidden="true">
        {checked === true ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      <span>{label}</span>
    </label>
  )
}

function ControlStateCard({
  caption,
  children,
  title,
}: {
  caption: string
  children: ReactNode
  title: string
}) {
  return (
    <div className="select-state-card control-state-card">
      <div>
        <span className="select-scene-title">{title}</span>
        <p>{caption}</p>
      </div>
      {children}
    </div>
  )
}
