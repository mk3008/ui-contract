import { catalogDecision } from './contract/catalog'
import type { ChoiceGroupLayoutPolicy } from './contract/types'
import { SelectLikePolicySection } from './sectioned-policy-section'

/** Foundation preview: it owns sibling-choice arrangement, not choice semantics. */
export function ChoiceGroupLayoutContractPanel({ choiceGroupLayout }: { choiceGroupLayout: ChoiceGroupLayoutPolicy }) {
  const entry = catalogDecision('choice-group-layout')
  const policy = entry.options![0]
  const isSelected = choiceGroupLayout === policy.value

  return (
    <div className="select-sectioned-panel">
      <SelectLikePolicySection
        description="This Foundation policy arranges sibling visible choices. Radio and Checkbox retain their own selection meaning and states."
        controls={
          <section className="option-group">
            <h4>Layout policy</h4>
            <div className="option-grid">
              <div className={`option-card ${isSelected ? 'is-selected' : ''} choice-group-layout-fixed-decision`}>
                <span className="option-title">{policy.label}</span>
                <span className="option-note">{policy.note}</span>
              </div>
            </div>
          </section>
        }
        preview={
          <div className="choice-group-layout-preview">
            <section className="select-state-card control-state-card">
              <h4>Default: stacked choice group</h4>
              <p>Use a vertical scan for ordinary groups, regardless of whether the controls are radios or checkboxes.</p>
              <div className="choice-layout-example">
                <label><input defaultChecked type="checkbox" /> Tables</label>
                <label><input defaultChecked type="checkbox" /> CTEs</label>
                <label><input type="checkbox" /> Derived</label>
              </div>
            </section>
            <section className="select-state-card control-state-card">
              <h4>Constrained inline allowance</h4>
              <p>Inline is allowed only for a short binary choice when the screen context makes both labels immediately clear. It is not a general horizontal layout option.</p>
              <div className="choice-layout-example is-inline" aria-label="Short binary choice example">
                <label><input defaultChecked name="binary-choice-example" type="radio" /> Monthly</label>
                <label><input name="binary-choice-example" type="radio" /> Yearly</label>
              </div>
            </section>
          </div>
        }
      />
    </div>
  )
}
