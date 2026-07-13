import { useState } from 'react'
import type { AvailabilityLayout, AvailabilityTreatment, ConfirmationScope, ConfirmationSurface, UiContract } from './contract/types'
import { generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, type ScreenPatternExampleId } from './screen-pattern-evidence'

type Props = {
  availability: { treatment: AvailabilityTreatment; layout: AvailabilityLayout }
  confirmation: { surface: ConfirmationSurface; scope: ConfirmationScope }
  policy: UiContract['screenPatternPolicy']
}

type SearchState = 'busy' | 'results' | 'empty' | 'error'

export function isLocalUndoEligible(surface: ConfirmationSurface): boolean {
  return surface === 'undo-when-reversible'
}

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function InteractiveScreenPatterns({ availability, confirmation, example, policy }: Props & { example: ScreenPatternExampleId }) {
  return (
    <section className="interactive-screen-patterns" aria-label="Interactive screen pattern examples">
      <div className="interactive-screen-patterns-heading">
        <div>
          <p className="eyebrow">Interactive examples</p>
          <p>These local examples demonstrate existing Contract composition. They are not selectable Contract policy values.</p>
        </div>
        <div className="evidence-downloads" aria-label="Evidence downloads">
          <button type="button" onClick={() => download(generateScreenPatternEvidenceJson(), 'screen-pattern-evidence.json', 'application/json')}>Download evidence JSON</button>
          <button type="button" onClick={() => download(generateScreenPatternEvidenceMarkdown(), 'screen-pattern-evidence.md', 'text/markdown')}>Download evidence Markdown</button>
        </div>
      </div>
      <div className="interactive-example-stage" aria-label="Interactive example">
        {example === 'search-list' && <SearchListExample policy={policy} />}
        {example === 'edit-detail' && <EditDetailExample />}
        {example === 'edit-list' && <EditListExample />}
        {example === 'read-only-detail' && <ReadOnlyDetailExample availability={availability} />}
        {example === 'destructive-action' && <DestructiveActionExample confirmation={confirmation} />}
      </div>
    </section>
  )
}

function SearchListExample({ policy }: { policy: UiContract['screenPatternPolicy'] }) {
  const [state, setState] = useState<SearchState>('busy')
  const [selected, setSelected] = useState(false)
  return <article className="interactive-example" data-example="search-list">
    <div className="interactive-example-heading"><div><h4>Search/list</h4><p>Local results states and selection context compose the existing Search/List pattern.</p></div><code data-i18n-skip>{policy.searchList}</code></div>
    <div className="example-actions" aria-label="Search list state controls">
      <button type="button" onClick={() => setState('results')}>Show results</button>
      <button type="button" onClick={() => setState('empty')}>Show empty</button>
      <button type="button" onClick={() => setState('error')}>Show error</button>
    </div>
    {state === 'busy' && <section className="example-state" aria-busy="true" aria-live="polite"><strong>Loading results</strong><p>The results region is busy. Continue to local results when ready.</p><button type="button" onClick={() => setState('results')}>Continue</button></section>}
    {state === 'results' && <section className="example-state" aria-label="Search results"><div className="selection-context" aria-live="polite">{selected ? '1 item selected. Bulk action available.' : 'No items selected.'}</div><label className="example-row"><input type="checkbox" checked={selected} onChange={(event) => setSelected(event.target.checked)} /> <span>Example record</span><span>Ready</span></label>{selected && <button type="button" className="bulk-action">Apply local bulk action</button>}</section>}
    {state === 'empty' && <section className="example-state" role="status"><strong>No results</strong><p>Adjust the local search condition and try again.</p><button type="button" onClick={() => setState('results')}>Clear local condition</button></section>}
    {state === 'error' && <section className="example-state is-error" role="alert"><strong>Results are unavailable</strong><p>Try the local recovery action.</p><button type="button" onClick={() => setState('results')}>Retry</button></section>}
  </article>
}

function EditDetailExample() {
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const submit = (event: React.FormEvent) => { event.preventDefault(); setInvalid(!value.trim()); setSaved(Boolean(value.trim())) }
  const reset = () => { setValue(''); setInvalid(false); setSaved(false) }
  return <article className="interactive-example" data-example="edit-detail">
    <div className="interactive-example-heading"><div><h4>Edit detail</h4><p>Invalid submit, correction, local save, and reset stay inside this example.</p></div></div>
    {invalid && <div className="validation-summary" role="alert">Review the field message before saving.</div>}
    <form onSubmit={submit} noValidate>
      <label className="example-field">Detail value<input aria-invalid={invalid} aria-describedby={invalid ? 'detail-value-error' : undefined} value={value} onChange={(event) => setValue(event.target.value)} /></label>
      <div id="detail-value-error" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter a value before saving.' : 'A field message appears after an invalid local submit.'}</div>
      <div className="example-actions"><button type="submit">Save local change</button><button type="button" onClick={reset}>Cancel and reset</button></div>
      {saved && <p className="success-message" role="status">Local change saved.</p>}
    </form>
  </article>
}

function EditListExample() {
  const [selected, setSelected] = useState(false)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('Example value')
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)
  const cancel = () => { setDraft(value); setInvalid(false); setEditing(false) }
  const save = () => { if (!draft.trim()) { setInvalid(true); return }; setValue(draft); setInvalid(false); setEditing(false) }
  return <article className="interactive-example" data-example="edit-list">
    <div className="interactive-example-heading"><div><h4>Edit list</h4><p>Row selection and local row editing are independent from persisted Contract state.</p></div></div>
    <label className="example-row"><input type="checkbox" checked={selected} onChange={(event) => setSelected(event.target.checked)} /><span>{value}</span><span>{selected ? 'Selected' : 'Not selected'}</span><button type="button" onClick={() => setEditing(true)}>Edit row</button></label>
    {editing && <div className="local-editor" aria-label="Local row editor"><label className="example-field">Row value<input aria-invalid={invalid} value={draft} onChange={(event) => setDraft(event.target.value)} /></label>{invalid && <p className="field-message" role="alert">Enter a value before saving.</p>}<div className="example-actions"><button type="button" onClick={save}>Save row</button><button type="button" onClick={cancel}>Cancel row edit</button></div></div>}
  </article>
}

function ReadOnlyDetailExample({ availability }: { availability: Props['availability'] }) {
  return <article className="interactive-example" data-example="read-only-detail">
    <div className="interactive-example-heading"><div><h4>Read-only detail</h4><p>Reviewable values cannot be edited. The current Availability treatment remains visible without adding a new policy.</p></div><code data-i18n-skip>{availability.treatment}</code></div>
    <fieldset className="read-only-fields"><legend>Review values</legend><label className="example-field">Reference value<input readOnly value="Example value" aria-readonly="true" /></label><label className="example-field">Supporting value<input readOnly value="Fixed detail" aria-readonly="true" /></label><p className="field-message">These controls are readable but not editable.</p></fieldset>
  </article>
}

function DestructiveActionExample({ confirmation }: { confirmation: Props['confirmation'] }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [typed, setTyped] = useState('')
  const canConfirm = confirmation.surface !== 'typed-confirmation' || typed === 'CONFIRM'
  const canUndo = isLocalUndoEligible(confirmation.surface)
  const confirm = () => { setDone(true); setOpen(false); setTyped('') }
  return <article className="interactive-example" data-example="destructive-action">
    <div className="interactive-example-heading"><div><h4>Destructive action</h4><p>The existing confirmation surface controls this local confirmation example.</p></div><code data-i18n-skip>{confirmation.surface}</code></div>
    <button type="button" className="danger-action" onClick={() => setOpen(true)}>Start local destructive action</button>
    {open && <div className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title"><h5 id="confirmation-title">Confirm local destructive action</h5><p>This changes only the local example. You can cancel safely.</p>{confirmation.surface === 'typed-confirmation' && <label className="example-field">Type CONFIRM<input value={typed} onChange={(event) => setTyped(event.target.value)} /></label>}<div className="example-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="danger-action" disabled={!canConfirm} onClick={confirm}>Confirm</button></div></div>}
    {done && <p className="success-message" role="status">{canUndo ? 'Local destructive action confirmed. Undo is available for this eligible local example.' : 'Local destructive action confirmed.'}</p>}
    {done && canUndo && <button type="button" onClick={() => setDone(false)}>Undo local action</button>}
  </article>
}
