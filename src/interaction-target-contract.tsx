import { useState } from 'react'
import { translateUiText, type UiLanguage } from './i18n'
import { SelectLikePolicySection } from './sectioned-policy-section'

/** Fixed Foundation preview for the interactive-target invariant. */
export function InteractiveTargetContractPanel() {
  const [marketing, setMarketing] = useState(true)
  const [delivery, setDelivery] = useState('standard')
  const [alerts, setAlerts] = useState(true)
  const [selected, setSelected] = useState(false)
  const language: UiLanguage = document.documentElement.lang === 'ja' ? 'ja' : 'en'
  const translate = (text: string) => translateUiText(text, language)
  const rowSelectionLabel = `${translate('Select account')}: Harbor Supply`

  return (
    <div className="select-sectioned-panel interaction-target-panel" data-interaction-target-policy="accessible-labeled-targets">
      <SelectLikePolicySection
        description="Every choice control has a forgiving target. Labels activate their control; record selection uses a dedicated selection cell when no visible label is available."
        controlsLabel="Fixed rules"
        previewLabel="Try it"
        controls={
          <section aria-label="Fixed rules" className="option-group">
            <div className="option-grid">
              <div className="option-card fixed-rule-card">
                <span className="option-title">Minimum target</span>
                <span className="option-note">Pointer-operable controls provide at least a 24 by 24 CSS pixel target. Frequent or touch-relevant operations aim for 44 by 44 CSS pixels where practical.</span>
              </div>
              <div className="option-card fixed-rule-card">
                <span className="option-title">Meaning and scope</span>
                <span className="option-note">Choice labels and controls form one target. Row selection remains separate from record navigation and row actions.</span>
              </div>
              <div className="option-card fixed-rule-card">
                <span className="option-title">Keyboard and state</span>
                <span className="option-note">The same native control receives pointer activation, keyboard focus, and an accessible name. Checked state is never conveyed by color alone.</span>
              </div>
            </div>
          </section>
        }
        preview={
          <div aria-label={translate('Interactive target preview')}>
            <div className="interaction-target-stage">
              <fieldset>
                <legend data-i18n-skip>Checkbox</legend>
                <label className="target-choice-control"><input checked={marketing} onChange={(event) => setMarketing(event.target.checked)} type="checkbox" /><span>Send account updates</span></label>
              </fieldset>
              <fieldset>
                <legend data-i18n-skip>Radio</legend>
                <label className="target-choice-control"><input checked={delivery === 'standard'} name="delivery" onChange={() => setDelivery('standard')} type="radio" /><span>Standard delivery</span></label>
                <label className="target-choice-control"><input checked={delivery === 'express'} name="delivery" onChange={() => setDelivery('express')} type="radio" /><span>Express delivery</span></label>
              </fieldset>
              <fieldset>
                <legend data-i18n-skip>Toggle</legend>
                <label className="target-toggle-control"><input checked={alerts} onChange={(event) => setAlerts(event.target.checked)} type="checkbox" /><span aria-hidden="true" className="target-toggle-track" /><span>Enable review alerts</span><strong>{alerts ? 'On' : 'Off'}</strong></label>
              </fieldset>
              <section className="target-selection-example" aria-labelledby="row-selection-heading">
                <h4 id="row-selection-heading">Row selection</h4>
                <div className={`target-selection-row${selected ? ' is-selected' : ''}`}>
                  <label className="target-selection-cell"><input aria-label={rowSelectionLabel} checked={selected} onChange={(event) => setSelected(event.target.checked)} type="checkbox" /><span className="visually-hidden">{rowSelectionLabel}</span></label>
                  <strong>Harbor Supply</strong><span>Review</span><button type="button">{translate('View')}</button>
                </div>
              </section>
            </div>
          </div>
        }
      />
    </div>
  )
}
