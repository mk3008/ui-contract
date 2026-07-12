import { catalogDecision } from './contract/catalog'
import type { RadioGroupPolicy } from './contract/types'

/** Fixed Component Contract preview; choice data and defaults remain screen-owned. */
export function RadioGroupContractPanel({ radioGroupPolicy }: { radioGroupPolicy: RadioGroupPolicy }) {
  const entry = catalogDecision('radio-group-treatment')
  const treatment = entry.options![0]
  const isSelected = radioGroupPolicy.treatment === treatment.value

  return (
    <div className="select-sectioned-panel">
      <section className="select-policy-section">
        <div className="select-policy-heading">
          <h3>Radio group treatment</h3>
          <p>Radio groups present one mutually exclusive choice. Whether a screen uses radios, its options, and its business default remain screen-owned.</p>
        </div>
        <div className="select-policy-section-grid">
          <div className="select-policy-controls">
            <span className="select-column-label">Settings</span>
            <section className="option-group">
              <h4>Group treatment</h4>
              <div className="option-grid">
                <div className={`option-card ${isSelected ? 'is-selected' : ''} radio-group-fixed-decision`}>
                  <span className="option-title">{treatment.label}</span>
                  <span className="option-note">{treatment.note}</span>
                </div>
              </div>
            </section>
          </div>
          <div className="select-policy-preview">
            <span className="select-column-label">Preview</span>
            <fieldset className="select-state-card control-state-card radio-group-preview" aria-label="Radio group presentation preview">
              <legend>Example choice group</legend>
              <p>Visible group and option labels support a vertical scan. The selected example is illustrative only, not a business default.</p>
              <label className="radio-group-row is-selected">
                <input defaultChecked name="radio-group-preview" type="radio" />
                <span>Example option A</span>
                <strong className="radio-group-state">Selected example</strong>
              </label>
              <label className="radio-group-row">
                <input name="radio-group-preview" type="radio" />
                <span>Example option B</span>
              </label>
              <label className="radio-group-row">
                <input name="radio-group-preview" type="radio" />
                <span>Example option C</span>
              </label>
            </fieldset>
          </div>
        </div>
      </section>
    </div>
  )
}
