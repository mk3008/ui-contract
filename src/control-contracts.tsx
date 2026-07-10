import type { ReactNode } from 'react'
import { Check, Columns3, PanelTop, ToggleLeft } from 'lucide-react'
import { catalogOptions } from './contract/catalog'
import type { CheckboxPolicy, TabsPolicy, TogglePolicy } from './contract/types'

export type { CheckboxPolicy, TabsPolicy, TogglePolicy } from './contract/types'

type Option<T extends string> = {
  value: T
  label: string
  note: string
}

export type TabsTreatment = TabsPolicy['treatment']
export type TabsAdornment = TabsPolicy['adornment']
export type ToggleTreatment = TogglePolicy['treatment']
export type ToggleLabelPolicy = TogglePolicy['labelPolicy']
export type CheckboxGroupLayout = CheckboxPolicy['groupLayout']
export type CheckboxChoiceSurface = CheckboxPolicy['choiceSurface']
export type CheckboxMixedState = CheckboxPolicy['mixedState']

export const tabsTreatmentOptions: Array<Option<TabsTreatment>> = catalogOptions('tabs-treatment')
export const tabsAdornmentOptions: Array<Option<TabsAdornment>> = catalogOptions('tabs-adornment')
export const toggleTreatmentOptions: Array<Option<ToggleTreatment>> = catalogOptions('toggle-treatment')
export const toggleLabelPolicyOptions: Array<Option<ToggleLabelPolicy>> = catalogOptions('toggle-label-policy')
export const checkboxGroupLayoutOptions: Array<Option<CheckboxGroupLayout>> = catalogOptions('checkbox-group-layout')
export const checkboxChoiceSurfaceOptions: Array<Option<CheckboxChoiceSurface>> = catalogOptions('checkbox-choice-surface')
export const checkboxMixedStateOptions: Array<Option<CheckboxMixedState>> = catalogOptions('checkbox-mixed-state')

export const renderedControlDecisionIds = [
  'tabs-treatment', 'tabs-adornment', 'toggle-treatment', 'toggle-label-policy',
  'checkbox-group-layout', 'checkbox-choice-surface', 'checkbox-mixed-state',
] as const

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
  children,
}: {
  caption: string
  children: ReactNode
  title: string
}) {
  return <div className="select-state-card control-state-card">{children}</div>
}
