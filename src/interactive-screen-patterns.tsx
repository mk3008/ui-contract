import { useEffect, useRef, useState } from 'react'
import type { ConfirmationSurface, UiContract } from './contract/types'
import { generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, type ScreenPatternExampleId } from './screen-pattern-evidence'

type Props = {
  contract: UiContract
  confirmation: { surface: ConfirmationSurface }
  button: UiContract['componentPolicy']['button']
}
type SearchState = 'unsearched' | 'results' | 'busy' | 'empty' | 'error'

const accounts = [
  ['Aster Works', 'Active', 'Today'], ['Harbor Supply', 'Review', 'Yesterday'], ['Lumen Office', 'Active', '12 Jul'], ['Pine Services', 'Paused', '10 Jul'],
] as const
const noMatchAccount = 'Meridian Logistics'

function DownloadIcon() {
  return <svg aria-hidden="true" className="download-icon" viewBox="0 0 16 16"><path d="M8 2v7m0 0 3-3m-3 3L5 6m-2 5h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
}

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function isLocalUndoEligible(surface: ConfirmationSurface): boolean { return surface === 'undo-when-reversible' }

export function InteractiveScreenPatterns({ contract, confirmation, example, button }: Props & { example: ScreenPatternExampleId }) {
  return <section className="interactive-screen-patterns" aria-label="Screen pattern acceptance surface">
    <div className="interactive-screen-patterns-heading">
      <div><p className="eyebrow">Acceptance surface</p><p>Each screen is a deterministic, local business-task mock that composes the current Contract. Fixture data and outcomes are not Contract policy.</p></div>
      <div className="evidence-downloads" aria-label="Evidence downloads">
        <button aria-label="Download Screen Pattern evidence JSON" type="button" onClick={() => download(generateScreenPatternEvidenceJson(contract), 'screen-pattern-evidence.json', 'application/json')}><DownloadIcon />JSON</button>
        <button aria-label="Download Screen Pattern evidence Markdown" type="button" onClick={() => download(generateScreenPatternEvidenceMarkdown(contract), 'screen-pattern-evidence.md', 'text/markdown')}><DownloadIcon />Markdown</button>
      </div>
    </div>
    <div className="interactive-example-stage"><ScreenPatternContent button={button} confirmation={confirmation} example={example} /></div>
  </section>
}

export function ScreenPatternPageArtifact({ contract, example }: { contract: UiContract; example: ScreenPatternExampleId }) {
  const artifactState = new URLSearchParams(window.location.search).get('state')
  const colors = contract.designPolicy.color.light
  const pageStyle = {
    '--page': colors.background, '--surface': colors.surface, '--surface-soft': colors.surfaceSoft,
    '--text': colors.text, '--muted': colors.mutedText, '--line': colors.border,
    '--line-strong': colors.border, '--primary': colors.primary, '--primary-strong': colors.primary,
    '--primary-soft': colors.brandBackground, '--success': colors.success, '--warning': colors.warning,
    '--danger': colors.danger, '--focus-outer': colors.focusOuter,
  } as React.CSSProperties
  return <main className="screen-page-artifact" data-page-artifact data-screen-pattern={example} style={pageStyle}>
    <header className="artifact-app-header"><div className="artifact-product"><strong>Northstar Operations</strong><span>Customer administration</span></div><p>Operations team</p></header>
    <div className="artifact-app-body"><nav className="artifact-nav" aria-label="Application navigation"><button aria-label="Accounts" type="button">A</button><button aria-label="Assignments" type="button">R</button><button aria-label="Reports" type="button">S</button></nav><section className="artifact-workspace"><div className="artifact-context"><span>Accounts</span><span>Customer operations</span></div><ScreenPatternContent artifact artifactState={artifactState} button={contract.componentPolicy.button} confirmation={contract.interactionPolicy.confirmation} example={example} /></section></div>
  </main>
}

function ScreenPatternContent({ artifact = false, artifactState, button, confirmation, example }: { artifact?: boolean; artifactState?: string | null; button: Props['button']; confirmation: Props['confirmation']; example: ScreenPatternExampleId }) {
  if (example === 'search-list') return <SearchListExample artifact={artifact} button={button} initialSelected={artifactState === 'selected'} initialState={artifactState === 'results' || artifactState === 'selected' ? 'results' : artifactState === 'loading' ? 'busy' : artifactState === 'zero-results' ? 'empty' : artifactState === 'error' ? 'error' : 'unsearched'} />
  if (example === 'edit-detail') return <EditDetailExample artifact={artifact} button={button} initialState={artifactState === 'validation' ? 'validation' : 'initial'} />
  if (example === 'edit-list') return <EditListExample artifact={artifact} button={button} initialState={artifactState === 'validation' ? 'validation' : artifactState === 'editing' ? 'editing' : 'initial'} />
  if (example === 'read-only-detail') return <ReadOnlyDetailExample artifact={artifact} button={button} initialState={artifactState === 'error' ? 'error' : 'initial'} />
  return <DestructiveActionExample artifact={artifact} confirmation={confirmation} button={button} initialState={artifactState === 'confirmation' || artifactState === 'error' || artifactState === 'result' ? artifactState : 'initial'} />
}

function ScreenHeader({ title, context }: { title: string; context: string }) {
  return <header className="business-screen-header"><div><h4>{title}</h4><p>{context}</p></div></header>
}

function screenButtonClasses(button: Props['button']) { return `button-primary-${button.primaryEmphasis} button-secondary-${button.secondaryEmphasis} button-danger-${button.dangerEmphasis} button-danger-placement-${button.dangerPlacement}` }

function SearchListExample({ artifact = false, button, initialSelected = false, initialState = 'unsearched' }: { artifact?: boolean; button: Props['button']; initialSelected?: boolean; initialState?: SearchState }) {
  const [state, setState] = useState<SearchState>(initialState)
  const [term, setTerm] = useState(initialState === 'empty' ? noMatchAccount : '')
  const [submitted, setSubmitted] = useState(initialState === 'empty' ? noMatchAccount : '')
  const [selected, setSelected] = useState<string[]>(initialSelected ? [accounts[0][0]] : [])
  const selectAllRef = useRef<HTMLInputElement>(null)
  const allSelected = selected.length === accounts.length
  const selectionActive = selected.length > 0
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectionActive && !allSelected }, [allSelected, selectionActive])
  const apply = () => { setSelected([]); setSubmitted(term); setState('busy'); window.setTimeout(() => setState(term.trim().toLowerCase() === noMatchAccount.toLowerCase() ? 'empty' : term === 'error' ? 'error' : 'results'), 180) }
  const reset = () => { setTerm(''); setSubmitted(''); setSelected([]); setState('unsearched') }
  const toggleAccount = (name: string) => setSelected((current) => current.includes(name) ? current.filter((selectedName) => selectedName !== name) : [...current, name])
  const toggleAll = () => setSelected(allSelected ? [] : accounts.map(([name]) => name))
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="search-list" data-screen="search-list" data-state={selectionActive ? 'selected' : state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account directory" context="Find and maintain customer account records." />
    <form className="screen-section search-conditions" onSubmit={(event) => { event.preventDefault(); apply() }} aria-label="Search conditions">
      <div className="section-title"><h5>Search conditions</h5></div>
      <div className="search-condition-fields"><label className="example-field">Account name<input value={term} onChange={(event) => setTerm(event.target.value)} /></label><label className="example-field">Account status<select defaultValue="All statuses"><option>All statuses</option><option>Active</option><option>Review</option></select></label></div>
      <div className="screen-actions search-condition-actions"><button className="contract-button primary-filled" type="submit">Apply search</button><button className="contract-button secondary-outline" type="button" onClick={reset}>Reset conditions</button></div>
    </form>
    <section className="screen-section results-region" aria-label="Account results" aria-busy={state === 'busy'}>
      <div className="results-toolbar"><div><h5>Accounts</h5></div></div>
      {state === 'unsearched' && <div className="screen-state" role="status"><strong>Search for accounts</strong><p>Enter a name or choose a status to view matching accounts.</p></div>}
      {state === 'busy' && <div className="screen-state" role="status"><strong>Loading accounts</strong><p>Searching accounts for the selected conditions.</p><div className="skeleton-row" /><div className="skeleton-row short" /></div>}
      {state === 'empty' && <div className="screen-state" role="status"><strong>No accounts match these conditions</strong><p>Clear the condition or try a broader account name.</p><button className="contract-button secondary-outline" type="button" onClick={reset}>Clear conditions</button></div>}
      {state === 'error' && <div className="screen-state is-error" role="alert"><strong>Account results are unavailable</strong><p>We couldn't retrieve account results. Review your conditions and try again.</p><button className="contract-button primary-filled" type="button" onClick={apply}>Retry search</button></div>}
      {state === 'results' && <div className="table-with-pagination"><div data-table-context-toolbar className={`table-context-toolbar ${selectionActive ? 'batch-action-bar' : 'table-context-summary'}`}>{selectionActive ? <><p role="status">{selected.length} {selected.length === 1 ? 'account' : 'accounts'} selected</p><div className="screen-actions"><button className="contract-button secondary-outline" type="button">Assign owner</button><button className="contract-button secondary-outline" type="button" onClick={() => setSelected([])}>Clear selection</button></div></> : <p>{submitted ? `Results for “${submitted}”` : '24 accounts'} · Sorted by Updated, newest first</p>}</div><table className="business-table"><thead data-i18n-skip><tr><th><input ref={selectAllRef} aria-label="Select all accounts" type="checkbox" checked={allSelected} onChange={toggleAll} /></th><th>Account</th><th>Status</th><th>Updated ↓</th><th>Action</th></tr></thead><tbody data-i18n-skip>{accounts.map(([name, status, updated]) => <tr key={name} data-selected={selected.includes(name) || undefined}><td><input aria-label={`Select ${name}`} type="checkbox" checked={selected.includes(name)} onChange={() => toggleAccount(name)} /></td><td><strong>{name}</strong><small>Customer account</small></td><td><span className={`record-status ${status === 'Active' ? 'success' : 'warning'}`}>{status}</span></td><td>{updated}</td><td><button className="table-action" type="button" disabled={selectionActive}>View account</button></td></tr>)}</tbody></table><nav className="paging" aria-label="Account result pages"><button type="button" disabled>Previous</button><strong aria-current="page">1</strong><button type="button">Next</button></nav></div>}
    </section>
  </article>
}

function EditDetailExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'validation' }) {
  const [name, setName] = useState(initialState === 'validation' ? '' : 'Harbor Supply')
  const [email, setEmail] = useState('ops@harbor.example')
  const [invalid, setInvalid] = useState(initialState === 'validation')
  const [saved, setSaved] = useState(false)
  const reset = () => { setName('Harbor Supply'); setEmail('ops@harbor.example'); setInvalid(false); setSaved(false) }
  const save = (event: React.FormEvent) => { event.preventDefault(); const failed = !name.trim(); setInvalid(failed); setSaved(!failed) }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="edit-detail" data-screen="edit-detail" data-state={invalid ? 'validation' : saved ? 'saved' : 'initial'} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Edit account" context="Harbor Supply · Account AC-2048" />
    {invalid && <div className="validation-summary" role="alert">Review the required account name before saving.</div>}
    <form onSubmit={save} noValidate><section className="screen-section"><div className="section-title"><h5>Account profile</h5><p>Core contact information used by account operations.</p></div><div className="screen-field-grid"><label className="example-field">Account name <span className="required-cue">Required</span><input aria-invalid={invalid} aria-describedby="account-name-message" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="example-field">Operations email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label></div><p id="account-name-message" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter an account name.' : 'A name identifies this account in operations.'}</p></section><section className="screen-section"><div className="section-title"><h5>Service settings</h5><p>Service settings for this account.</p></div><div className="read-only-summary"><span>Service tier</span><strong>Standard operations</strong><span>Account owner</span><strong>A. Tanaka</strong></div></section><div className="screen-action-bar"><div className="screen-actions"><button aria-label="Cancel account changes" className="contract-button secondary-outline" type="button" onClick={reset}>Cancel</button><button aria-label="Save account changes" className="contract-button primary-filled" type="submit">Save</button></div></div>{saved && <p className="success-message" role="status">Account changes saved.</p>}</form>
  </article>
}

function EditListExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'editing' | 'validation' }) {
  const [editing, setEditing] = useState(initialState !== 'initial')
  const [value, setValue] = useState('Harbor Supply')
  const [draft, setDraft] = useState(initialState === 'validation' ? '' : value)
  const [invalid, setInvalid] = useState(initialState === 'validation')
  const [selected, setSelected] = useState(false)
  const cancel = () => { setDraft(value); setInvalid(false); setEditing(false) }
  const save = () => { if (!draft.trim()) { setInvalid(true); return }; setValue(draft); setInvalid(false); setEditing(false) }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="edit-list" data-screen="edit-list" data-state={editing ? invalid ? 'validation' : 'editing' : 'initial'} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account assignments" context="Regional portfolio · 8 active assignments" />
    <section className="screen-section"><div className="results-toolbar"><div><h5>Assignments</h5><p>Select an account or edit an assignment.</p></div>{selected && <div className="bulk-context" role="status">1 assignment selected</div>}</div><table className="business-table"><thead data-i18n-skip><tr><th><input aria-label="Select all assignments" type="checkbox" /></th><th>Account</th><th>Owner</th><th>Review date</th><th>Action</th></tr></thead><tbody data-i18n-skip><tr><td><input aria-label="Select Harbor Supply" type="checkbox" checked={selected} onChange={(event) => setSelected(event.target.checked)} /></td><td><strong>{value}</strong><small>AC-2048</small></td><td>A. Tanaka</td><td>18 Jul</td><td><button className="table-action" type="button" onClick={() => setEditing(true)}>Edit assignment</button></td></tr><tr><td><input aria-label="Select Lumen Office" type="checkbox" /></td><td><strong>Lumen Office</strong><small>AC-2049</small></td><td>M. Suzuki</td><td>22 Jul</td><td><button className="table-action" type="button">Edit assignment</button></td></tr></tbody></table></section>
    {editing && <section className="screen-section local-editor" aria-label="Edit Harbor Supply assignment"><div className="section-title"><h5>Edit assignment</h5><p>Update the account name, then save or cancel the assignment edit.</p></div><label className="example-field">Account name{artifact && initialState === 'editing' ? <span className="artifact-static-input" aria-label="Account name">{draft}</span> : <input aria-invalid={invalid} aria-describedby="assignment-name-message" value={draft} onChange={(event) => setDraft(event.target.value)} />}</label><p id="assignment-name-message" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter an account name before saving.' : 'This name appears on the assignment.'}</p><div className="screen-actions"><button className="contract-button secondary-outline" type="button" onClick={cancel}>Cancel assignment edit</button><button className="contract-button primary-filled" type="button" onClick={save}>Save assignment</button></div></section>}
  </article>
}

function ReadOnlyDetailExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'error' }) {
  const [state, setState] = useState<'initial' | 'error'>(initialState)
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="read-only-detail" data-screen="read-only-detail" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account detail" context="Lumen Office · Account AC-2049" />
    <section className="screen-section"><div className="detail-status"><span className="record-status success">Active</span><p>This record is read-only because it is managed by the regional operations team.</p></div><div className="read-only-detail-grid"><div><span>Account owner</span><strong>M. Suzuki</strong></div><div><span>Service tier</span><strong>Priority support</strong></div><div><span>Updated</span><strong>12 Jul, 14:20</strong></div><div><span>Source</span><strong>Regional operations</strong></div></div></section>
    {state === 'error' ? <section className="screen-state is-error" role="alert"><strong>Account detail is unavailable</strong><p>The record could not be refreshed. Review the account details, then try again.</p><button className="contract-button primary-filled" type="button" onClick={() => setState('initial')}>Retry detail</button></section> : <div className="screen-action-bar"><p>Editing is unavailable for this record.</p><div className="screen-actions"><button className="contract-button secondary-outline" type="button">View activity</button><button className="contract-button secondary-outline" type="button" onClick={() => setState('error')}>Refresh detail</button></div></div>}
  </article>
}

function DestructiveActionExample({ artifact = false, confirmation, button, initialState = 'initial' }: { artifact?: boolean; confirmation: Props['confirmation']; button: Props['button']; initialState?: 'initial' | 'confirmation' | 'error' | 'result' }) {
  const [open, setOpen] = useState(initialState === 'confirmation')
  const [result, setResult] = useState<'initial' | 'error' | 'done'>(initialState === 'error' ? 'error' : initialState === 'result' ? 'done' : 'initial')
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
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="destructive-action" data-screen="destructive-action" data-state={open ? 'confirmation' : result} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Close account" context="Pine Services · Account AC-2050" />
    <section className="screen-section"><h5>Account closure</h5><p>Closing this account removes it from active operations and prevents new assignments. Review the account context before continuing.</p><div className="read-only-detail-grid"><div><span>Current status</span><strong>Paused</strong></div><div><span>Open assignments</span><strong>0</strong></div></div></section><div className="screen-action-bar"><p>Use this action only after related work is complete.</p><button className="contract-button danger-emphasis-outline" type="button" onClick={() => setOpen(true)}>Close account</button></div>
    {result === 'error' && <section className="screen-state is-error" role="alert"><strong>Account closure did not complete</strong><p>No account data was changed. You can retry the closure request.</p><button className="contract-button primary-filled" type="button" onClick={() => setResult('done')}>Retry closure</button></section>}
    {result === 'done' && <p className="success-message" role="status">Account closure completed.</p>}
    {open && <div className="dialog-backdrop"><section ref={dialogRef} className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description"><h5 id="confirmation-title">Close Pine Services?</h5><p id="confirmation-description">This will remove Pine Services from active operations.</p>{confirmation.surface === 'typed-confirmation' && <label className="example-field">Type DELETE to confirm<input value={typed} onChange={(event) => setTyped(event.target.value)} /></label>}<div className="screen-actions"><button ref={cancelRef} className="contract-button secondary-outline" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="contract-button danger-emphasis-filled" type="button" disabled={!canConfirm} onClick={confirm}>Close account</button></div></section></div>}
  </article>
}
