import { useEffect, useRef, useState } from 'react'
import type { AvailabilityLayout, AvailabilityTreatment, ConfirmationSurface, UiContract } from './contract/types'
import { generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, type ScreenPatternExampleId } from './screen-pattern-evidence'

type Props = {
  contract: UiContract
  availability: { treatment: AvailabilityTreatment; layout: AvailabilityLayout }
  confirmation: { surface: ConfirmationSurface }
  policy: UiContract['screenPatternPolicy']
  button: UiContract['componentPolicy']['button']
}
type SearchState = 'results' | 'busy' | 'empty' | 'error'

const accounts = [
  ['Aster Works', 'Active', 'Today'], ['Harbor Supply', 'Review', 'Yesterday'], ['Lumen Office', 'Active', '12 Jul'], ['Pine Services', 'Paused', '10 Jul'],
] as const

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function isLocalUndoEligible(surface: ConfirmationSurface): boolean { return surface === 'undo-when-reversible' }

export function InteractiveScreenPatterns({ contract, availability, confirmation, example, policy, button }: Props & { example: ScreenPatternExampleId }) {
  return <section className="interactive-screen-patterns" aria-label="Screen pattern acceptance surface">
    <div className="interactive-screen-patterns-heading">
      <div><p className="eyebrow">Acceptance surface</p><p>Each screen is a deterministic, local business-task mock that composes the current Contract. Fixture data and outcomes are not Contract policy.</p></div>
      <div className="evidence-downloads" aria-label="Evidence downloads">
        <button type="button" onClick={() => download(generateScreenPatternEvidenceJson(contract), 'screen-pattern-evidence.json', 'application/json')}>Download evidence JSON</button>
        <button type="button" onClick={() => download(generateScreenPatternEvidenceMarkdown(contract), 'screen-pattern-evidence.md', 'text/markdown')}>Download evidence Markdown</button>
      </div>
    </div>
    <div className="interactive-example-stage">
      {example === 'search-list' && <SearchListExample policy={policy} button={button} />}
      {example === 'edit-detail' && <EditDetailExample button={button} />}
      {example === 'edit-list' && <EditListExample button={button} />}
      {example === 'read-only-detail' && <ReadOnlyDetailExample availability={availability} button={button} />}
      {example === 'destructive-action' && <DestructiveActionExample confirmation={confirmation} button={button} />}
    </div>
  </section>
}

function ScreenHeader({ title, context, policy }: { title: string; context: string; policy?: string }) {
  return <header className="business-screen-header"><div><p className="eyebrow">Operations workspace</p><h4>{title}</h4><p>{context}</p></div>{policy && <code data-i18n-skip>{policy}</code>}</header>
}

function screenButtonClasses(button: Props['button']) { return `button-primary-${button.primaryEmphasis} button-secondary-${button.secondaryEmphasis} button-danger-${button.dangerEmphasis} button-danger-placement-${button.dangerPlacement}` }

function SearchListExample({ policy, button }: { policy: UiContract['screenPatternPolicy']; button: Props['button'] }) {
  const [state, setState] = useState<SearchState>('results')
  const [term, setTerm] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [selected, setSelected] = useState(false)
  const apply = () => { setSubmitted(term); setState('busy'); window.setTimeout(() => setState(term === 'none' ? 'empty' : term === 'error' ? 'error' : 'results'), 180) }
  const reset = () => { setTerm(''); setSubmitted(''); setSelected(false); setState('results') }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-example="search-list" data-screen="search-list" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account directory" context="Find and maintain customer account records." policy={policy.searchList} />
    <form className="screen-section search-conditions" onSubmit={(event) => { event.preventDefault(); apply() }} aria-label="Search conditions">
      <div className="section-title"><h5>Search conditions</h5><p>Submitted conditions remain visible with the result set.</p></div>
      <label className="example-field">Account name<input value={term} onChange={(event) => setTerm(event.target.value)} /></label>
      <label className="example-field">Account status<select defaultValue="All statuses"><option>All statuses</option><option>Active</option><option>Review</option></select></label>
      <div className="screen-actions"><button className="contract-button primary-filled" type="submit">Apply search</button><button className="contract-button secondary-outline" type="button" onClick={reset}>Reset conditions</button></div>
    </form>
    <section className="screen-section results-region" aria-label="Account results" aria-busy={state === 'busy'}>
      <div className="results-toolbar"><div><h5>Accounts</h5><p>{submitted ? `Results for “${submitted}”` : '24 accounts'} · Sorted by Updated, newest first</p></div>{selected && <div className="bulk-context" role="status">1 account selected <button className="contract-button secondary-outline" type="button">Assign owner</button></div>}</div>
      {state === 'busy' && <div className="screen-state" role="status"><strong>Loading accounts</strong><p>Updating the result table for the submitted conditions.</p><div className="skeleton-row" /><div className="skeleton-row short" /></div>}
      {state === 'empty' && <div className="screen-state" role="status"><strong>No accounts match these conditions</strong><p>Clear the condition or try a broader account name.</p><button className="contract-button secondary-outline" type="button" onClick={reset}>Clear conditions</button></div>}
      {state === 'error' && <div className="screen-state is-error" role="alert"><strong>Account results are unavailable</strong><p>The local result request did not complete. Your conditions are still available.</p><button className="contract-button primary-filled" type="button" onClick={apply}>Retry search</button></div>}
      {state === 'results' && <><table className="business-table"><thead data-i18n-skip><tr><th><input aria-label="Select all accounts" type="checkbox" /></th><th>Account</th><th>Status</th><th>Updated ↓</th><th>Action</th></tr></thead><tbody data-i18n-skip>{accounts.map(([name, status, updated]) => <tr key={name}><td><input aria-label={`Select ${name}`} type="checkbox" checked={selected && name === accounts[0][0]} onChange={(event) => setSelected(event.target.checked)} /></td><td><strong>{name}</strong><small>Customer account</small></td><td><span className={`record-status ${status === 'Active' ? 'success' : 'warning'}`}>{status}</span></td><td>{updated}</td><td><button className="table-action" type="button">View account</button></td></tr>)}</tbody></table><nav className="paging" aria-label="Account result pages"><button type="button" disabled>Previous</button><strong aria-current="page">1</strong><button type="button">Next</button></nav></>}
    </section>
  </article>
}

function EditDetailExample({ button }: { button: Props['button'] }) {
  const [name, setName] = useState('Harbor Supply')
  const [email, setEmail] = useState('ops@harbor.example')
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const reset = () => { setName('Harbor Supply'); setEmail('ops@harbor.example'); setInvalid(false); setSaved(false) }
  const save = (event: React.FormEvent) => { event.preventDefault(); const failed = !name.trim(); setInvalid(failed); setSaved(!failed) }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-example="edit-detail" data-screen="edit-detail" data-state={invalid ? 'validation' : saved ? 'saved' : 'initial'} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Edit account" context="Harbor Supply · Account AC-2048" />
    {invalid && <div className="validation-summary" role="alert">Review the required account name before saving.</div>}
    <form onSubmit={save} noValidate><section className="screen-section"><div className="section-title"><h5>Account profile</h5><p>Core contact information used by account operations.</p></div><div className="screen-field-grid"><label className="example-field">Account name <span className="required-cue">Required</span><input aria-invalid={invalid} aria-describedby="account-name-message" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="example-field">Operations email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label></div><p id="account-name-message" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter an account name.' : 'A name identifies this account in operations.'}</p></section><section className="screen-section"><div className="section-title"><h5>Service settings</h5><p>These local fixture values demonstrate a grouped detail form.</p></div><div className="read-only-summary"><span>Service tier</span><strong>Standard operations</strong><span>Account owner</span><strong>A. Tanaka</strong></div></section><div className="screen-action-bar"><p>Changes remain local to this acceptance surface.</p><div className="screen-actions"><button className="contract-button secondary-outline" type="button" onClick={reset}>Cancel changes</button><button className="contract-button primary-filled" type="submit">Save account</button></div></div>{saved && <p className="success-message" role="status">Account changes saved locally.</p>}</form>
  </article>
}

function EditListExample({ button }: { button: Props['button'] }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('Harbor Supply')
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)
  const [selected, setSelected] = useState(false)
  const cancel = () => { setDraft(value); setInvalid(false); setEditing(false) }
  const save = () => { if (!draft.trim()) { setInvalid(true); return }; setValue(draft); setInvalid(false); setEditing(false) }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-example="edit-list" data-screen="edit-list" data-state={editing ? invalid ? 'validation' : 'editing' : 'initial'} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account assignments" context="Regional portfolio · 8 active assignments" />
    <section className="screen-section"><div className="results-toolbar"><div><h5>Assignments</h5><p>Select an account or edit its assignment without leaving the list.</p></div>{selected && <div className="bulk-context" role="status">1 assignment selected</div>}</div><table className="business-table"><thead data-i18n-skip><tr><th><input aria-label="Select all assignments" type="checkbox" /></th><th>Account</th><th>Owner</th><th>Review date</th><th>Action</th></tr></thead><tbody data-i18n-skip><tr><td><input aria-label="Select Harbor Supply" type="checkbox" checked={selected} onChange={(event) => setSelected(event.target.checked)} /></td><td><strong>{value}</strong><small>AC-2048</small></td><td>A. Tanaka</td><td>18 Jul</td><td><button className="table-action" type="button" onClick={() => setEditing(true)}>Edit assignment</button></td></tr><tr><td><input aria-label="Select Lumen Office" type="checkbox" /></td><td><strong>Lumen Office</strong><small>AC-2049</small></td><td>M. Suzuki</td><td>22 Jul</td><td><button className="table-action" type="button">Edit assignment</button></td></tr></tbody></table></section>
    {editing && <section className="screen-section local-editor" aria-label="Edit Harbor Supply assignment"><div className="section-title"><h5>Edit assignment</h5><p>Update the account label, then commit or cancel this local row edit.</p></div><label className="example-field">Account name<input aria-invalid={invalid} aria-describedby="assignment-name-message" value={draft} onChange={(event) => setDraft(event.target.value)} /></label><p id="assignment-name-message" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter an account name before committing.' : 'The list remains visible while this row is edited.'}</p><div className="screen-actions"><button className="contract-button secondary-outline" type="button" onClick={cancel}>Cancel row edit</button><button className="contract-button primary-filled" type="button" onClick={save}>Commit row edit</button></div></section>}
  </article>
}

function ReadOnlyDetailExample({ availability, button }: { availability: Props['availability']; button: Props['button'] }) {
  const [state, setState] = useState<'initial' | 'error'>('initial')
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-example="read-only-detail" data-screen="read-only-detail" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account detail" context="Lumen Office · Account AC-2049" policy={availability.treatment} />
    <section className="screen-section"><div className="detail-status"><span className="record-status success">Active</span><p>This record is read-only because it is managed by the regional operations team.</p></div><div className="read-only-detail-grid"><div><span>Account owner</span><strong>M. Suzuki</strong></div><div><span>Service tier</span><strong>Priority support</strong></div><div><span>Updated</span><strong>12 Jul, 14:20</strong></div><div><span>Source</span><strong>Regional operations</strong></div></div></section>
    {state === 'error' ? <section className="screen-state is-error" role="alert"><strong>Account detail is unavailable</strong><p>The record could not be refreshed. Existing context remains visible.</p><button className="contract-button primary-filled" type="button" onClick={() => setState('initial')}>Retry detail</button></section> : <div className="screen-action-bar"><p>Editing is unavailable for this record.</p><div className="screen-actions"><button className="contract-button secondary-outline" type="button">View activity</button><button className="contract-button secondary-outline" type="button" onClick={() => setState('error')}>Refresh detail</button></div></div>}
  </article>
}

function DestructiveActionExample({ confirmation, button }: { confirmation: Props['confirmation']; button: Props['button'] }) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<'initial' | 'error' | 'done'>('initial')
  const [typed, setTyped] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const canConfirm = confirmation.surface !== 'typed-confirmation' || typed === 'DELETE'
  useEffect(() => { if (open) cancelRef.current?.focus() }, [open])
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); return }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])') ?? [])
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    if (open) window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [open])
  const confirm = () => { setOpen(false); setTyped(''); setResult('error') }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-example="destructive-action" data-screen="destructive-action" data-state={open ? 'confirmation' : result} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Close account" context="Pine Services · Account AC-2050" policy={confirmation.surface} />
    <section className="screen-section"><h5>Account closure</h5><p>Closing this account removes it from active operations and prevents new assignments. Review the account context before continuing.</p><div className="read-only-detail-grid"><div><span>Current status</span><strong>Paused</strong></div><div><span>Open assignments</span><strong>0</strong></div></div></section><div className="screen-action-bar"><p>Use this action only after related work is complete.</p><button className="contract-button danger-emphasis-outline" type="button" onClick={() => setOpen(true)}>Close account</button></div>
    {result === 'error' && <section className="screen-state is-error" role="alert"><strong>Account closure did not complete</strong><p>No account data was changed. You can retry the local closure request.</p><button className="contract-button primary-filled" type="button" onClick={() => setResult('done')}>Retry closure</button></section>}
    {result === 'done' && <p className="success-message" role="status">Account closure completed locally.</p>}
    {open && <div className="dialog-backdrop"><section ref={dialogRef} className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description"><h5 id="confirmation-title">Close Pine Services?</h5><p id="confirmation-description">This will remove Pine Services from active operations. This local fixture does not change a real account.</p>{confirmation.surface === 'typed-confirmation' && <label className="example-field">Type DELETE to confirm<input value={typed} onChange={(event) => setTyped(event.target.value)} /></label>}<div className="screen-actions"><button ref={cancelRef} className="contract-button secondary-outline" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="contract-button danger-emphasis-filled" type="button" disabled={!canConfirm} onClick={confirm}>Close account</button></div></section></div>}
  </article>
}
