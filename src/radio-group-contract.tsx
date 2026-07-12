import { catalogDecision } from './contract/catalog'
import type { RadioGroupPolicy } from './contract/types'

/** Fixed Component Contract preview; choice data and defaults remain screen-owned. */
export function RadioGroupContractPanel({ radioGroupPolicy }: { radioGroupPolicy: RadioGroupPolicy }) {
  const entry = catalogDecision('radio-group-treatment')
  const treatment = entry.options![0]

  return (
    <div className="radio-group-contract-panel">
      <section className="radio-group-contract-section">
        <div>
          <p className="eyebrow">Component policy</p>
          <h3>Radio Group</h3>
        </div>
        <p>{entry.note}</p>
        <div className="radio-group-fixed-decision">
          <span>{`Selectable decision: ${radioGroupPolicy.treatment}`}</span>
          <strong className="option-title">{treatment.label}</strong>
          <p>{treatment.note}</p>
        </div>
        <p>Radio groups present one mutually exclusive choice. Whether a screen uses radios, its options, and its business default remain screen-owned.</p>
      </section>

      <section className="radio-group-contract-section">
        <div>
          <p className="eyebrow">Component Preview</p>
          <h3>Visible-label radio group</h3>
        </div>
        <p>Visible group and option labels support a vertical scan. The selected example is illustrative only, not a business default.</p>
        <fieldset className="radio-group-preview" aria-label="Radio group presentation preview">
          <legend>Example choice group</legend>
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
      </section>
    </div>
  )
}
