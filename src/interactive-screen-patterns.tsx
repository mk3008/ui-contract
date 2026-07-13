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
const searchLoadingDelayMs = 3_000

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
    <ScreenPatternContent artifact artifactState={artifactState} button={contract.componentPolicy.button} confirmation={contract.interactionPolicy.confirmation} example={example} />
  </main>
}

function ScreenPatternContent({ artifact = false, artifactState, button, confirmation, example }: { artifact?: boolean; artifactState?: string | null; button: Props['button']; confirmation: Props['confirmation']; example: ScreenPatternExampleId }) {
  if (example === 'search-list') return <SearchListExample artifact={artifact} button={button} initialState={artifactState === 'results' ? 'results' : artifactState === 'loading' ? 'busy' : artifactState === 'zero-results' ? 'empty' : artifactState === 'error' ? 'error' : 'unsearched'} />
  if (example === 'edit-detail') return <EditDetailExample artifact={artifact} button={button} initialState={artifactState === 'validation' ? 'validation' : 'initial'} />
  if (example === 'edit-list') return <EditListExample artifact={artifact} button={button} initialState={artifactState === 'validation' ? 'validation' : artifactState === 'editing' ? 'editing' : 'initial'} />
  if (example === 'read-only-detail') return <ReadOnlyDetailExample artifact={artifact} button={button} initialState={artifactState === 'error' ? 'error' : 'initial'} />
  return <DestructiveActionExample artifact={artifact} confirmation={confirmation} button={button} initialState={artifactState === 'confirmation' || artifactState === 'error' || artifactState === 'result' ? artifactState : 'initial'} />
}

function ScreenHeader({ title }: { title: string }) {
  return <header className="business-screen-header"><div><h4>{title}</h4></div></header>
}

function screenButtonClasses(button: Props['button']) { return `button-primary-${button.primaryEmphasis} button-secondary-${button.secondaryEmphasis} button-danger-${button.dangerEmphasis} button-danger-placement-${button.dangerPlacement}` }

function SearchListExample({ artifact = false, button, initialState = 'unsearched' }: { artifact?: boolean; button: Props['button']; initialState?: SearchState }) {
  const [state, setState] = useState<SearchState>(initialState)
  const [term, setTerm] = useState(initialState === 'empty' ? noMatchAccount : '')
  const [submitted, setSubmitted] = useState(initialState === 'empty' ? noMatchAccount : '')
  const loadingTimerRef = useRef<number | null>(null)
  useEffect(() => () => { if (loadingTimerRef.current !== null) window.clearTimeout(loadingTimerRef.current) }, [])
  const apply = () => {
    if (state === 'busy') return
    const requestedTerm = term
    setSubmitted(requestedTerm)
    setState('busy')
    loadingTimerRef.current = window.setTimeout(() => {
      setState(requestedTerm.trim().toLowerCase() === noMatchAccount.toLowerCase() ? 'empty' : requestedTerm === 'error' ? 'error' : 'results')
      loadingTimerRef.current = null
    }, searchLoadingDelayMs)
  }
  const reset = () => { setTerm(''); setSubmitted(''); setState('unsearched') }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="search-list" data-screen="search-list" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account directory" />
    <form className="screen-section search-conditions" onSubmit={(event) => { event.preventDefault(); apply() }} aria-label="Search conditions">
      <div className="section-title"><h5>Search conditions</h5></div>
      <div className="search-condition-fields"><label className="example-field">Account name<input disabled={state === 'busy'} value={term} onChange={(event) => setTerm(event.target.value)} /></label><label className="example-field">Account status<select defaultValue="All statuses" disabled={state === 'busy'}><option>All statuses</option><option>Active</option><option>Review</option></select></label></div>
      <div className="screen-actions search-condition-actions"><button className="contract-button primary-filled" disabled={state === 'busy'} type="submit">Search</button><button className="contract-button secondary-outline" disabled={state === 'busy'} type="button" onClick={reset}>Clear</button></div>
    </form>
    <section className="screen-section results-region" aria-label="Account results" aria-busy={state === 'busy'}>
      <div className="results-toolbar"><div><h5>Accounts</h5></div></div>
      {state === 'unsearched' && <div className="screen-state" role="status"><p>Set conditions and select Search.</p></div>}
      {state === 'busy' && <div className="screen-state" role="status"><strong>Loading accounts</strong><div className="skeleton-row" /><div className="skeleton-row short" /></div>}
      {state === 'empty' && <div className="screen-state" role="status"><strong>No accounts found.</strong><p>Clear conditions or use a broader account name.</p></div>}
      {state === 'error' && <div className="screen-state is-error" role="alert"><strong>Account results are unavailable</strong><p>Could not load the results. Try again.</p><button className="contract-button primary-filled" type="button" onClick={apply}>Retry</button></div>}
      {state === 'results' && <div className="table-with-pagination"><div data-table-context-toolbar className="table-context-summary"><p>{submitted ? `Results for “${submitted}”` : '4 accounts'} · Sorted by Updated, newest first</p></div><table className="business-table"><thead data-i18n-skip><tr><th>Account</th><th>Status</th><th>Updated ↓</th></tr></thead><tbody data-i18n-skip>{accounts.map(([name, status, updated]) => <tr key={name}><td><strong>{name}</strong></td><td><span className={`record-status ${status === 'Active' ? 'success' : 'warning'}`}>{status}</span></td><td>{updated}</td></tr>)}</tbody></table></div>}
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
    <ScreenHeader title="Edit account" />
    {invalid && <div className="validation-summary" role="alert">Review the required account name before saving.</div>}
    <form onSubmit={save} noValidate><section className="screen-section"><div className="read-only-detail-grid"><div><span>Account ID</span><strong>AC-2048</strong></div></div><div className="screen-field-grid"><label className="example-field">Account name <span className="required-cue">Required</span><input aria-invalid={invalid} aria-describedby="account-name-message" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="example-field">Operations email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label></div><p id="account-name-message" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter an account name.' : null}</p></section><div className="screen-action-bar"><div className="screen-actions"><button aria-label="Cancel account changes" className="contract-button secondary-outline" type="button" onClick={reset}>Cancel</button><button aria-label="Save account changes" className="contract-button primary-filled" type="submit">Save</button></div></div>{saved && <p className="success-message" role="status">Account changes saved.</p>}</form>
  </article>
}

function EditListExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'editing' | 'validation' }) {
  const [editingAccount, setEditingAccount] = useState<string | null>(initialState === 'initial' ? null : 'Harbor Supply')
  const [values, setValues] = useState({ 'Harbor Supply': 'Harbor Supply', 'Lumen Office': 'Lumen Office' })
  const [draft, setDraft] = useState(initialState === 'validation' ? '' : 'Harbor Supply')
  const [invalid, setInvalid] = useState(initialState === 'validation')
  const startEdit = (account: keyof typeof values) => { setEditingAccount(account); setDraft(values[account]); setInvalid(false) }
  const cancel = () => { if (editingAccount) setDraft(values[editingAccount as keyof typeof values]); setInvalid(false); setEditingAccount(null) }
  const save = () => { if (!draft.trim()) { setInvalid(true); return }; if (editingAccount) setValues((current) => ({ ...current, [editingAccount]: draft })); setInvalid(false); setEditingAccount(null) }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="edit-list" data-screen="edit-list" data-state={editingAccount ? invalid ? 'validation' : 'editing' : 'initial'} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account assignments" />
    <section className="screen-section"><table className="business-table"><thead data-i18n-skip><tr><th>Account</th><th>Owner</th><th>Review date</th><th>Action</th></tr></thead><tbody data-i18n-skip><tr><td><strong>{values['Harbor Supply']}</strong><small>Account ID: AC-2048</small></td><td>A. Tanaka</td><td>18 Jul</td><td><button className="table-action" type="button" onClick={() => startEdit('Harbor Supply')}>Edit assignment</button></td></tr><tr><td><strong>{values['Lumen Office']}</strong><small>Account ID: AC-2049</small></td><td>M. Suzuki</td><td>22 Jul</td><td><button className="table-action" type="button" onClick={() => startEdit('Lumen Office')}>Edit assignment</button></td></tr></tbody></table></section>
    {editingAccount && <section className="screen-section local-editor" aria-label={`Edit ${editingAccount} assignment`}><div className="section-title"><h5>Edit assignment</h5></div><label className="example-field">Account name{artifact && initialState === 'editing' ? <span className="artifact-static-input" aria-label="Account name">{draft}</span> : <input aria-invalid={invalid} aria-describedby="assignment-name-message" value={draft} onChange={(event) => setDraft(event.target.value)} />}</label><p id="assignment-name-message" className="field-message" role={invalid ? 'alert' : undefined}>{invalid ? 'Enter an account name before saving.' : null}</p><div className="screen-actions"><button aria-label="Cancel assignment edit" className="contract-button secondary-outline" type="button" onClick={cancel}>Cancel</button><button aria-label="Save assignment" className="contract-button primary-filled" type="button" onClick={save}>Save</button></div></section>}
  </article>
}

function ReadOnlyDetailExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'error' }) {
  const [state, setState] = useState<'initial' | 'error'>(initialState)
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="read-only-detail" data-screen="read-only-detail" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account detail" />
    <section className="screen-section"><div className="detail-status"><span className="record-status success">Active</span><p>This record is read-only because it is managed by the regional operations team.</p></div><div className="read-only-detail-grid"><div><span>Account</span><strong>Lumen Office</strong></div><div><span>Account ID</span><strong>AC-2049</strong></div><div><span>Account owner</span><strong>M. Suzuki</strong></div><div><span>Service tier</span><strong>Priority support</strong></div><div><span>Updated</span><strong>12 Jul, 14:20</strong></div></div></section>
    {state === 'error' ? <section className="screen-state is-error" role="alert"><strong>Account detail is unavailable</strong><p>Could not refresh the detail. Try again.</p><button className="contract-button primary-filled" type="button" onClick={() => setState('initial')}>Retry</button></section> : <div className="screen-action-bar"><div className="screen-actions"><button className="contract-button secondary-outline" type="button" onClick={() => setState('error')}>Refresh</button></div></div>}
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
    <ScreenHeader title="Close account" />
    <section className="screen-section"><p>Closing this account removes it from active operations and prevents new assignments.</p><div className="read-only-detail-grid"><div><span>Account</span><strong>Pine Services</strong></div><div><span>Account ID</span><strong>AC-2050</strong></div><div><span>Current status</span><strong>Paused</strong></div><div><span>Open assignments (must be 0)</span><strong>0</strong></div></div></section><div className="screen-action-bar"><button className="contract-button danger-emphasis-outline" type="button" onClick={() => setOpen(true)}>Close Pine Services</button></div>
    {result === 'error' && <section className="screen-state is-error" role="alert"><strong>Account closure did not complete</strong><p>No account data was changed.</p><button className="contract-button primary-filled" type="button" onClick={() => setResult('done')}>Retry</button></section>}
    {result === 'done' && <p className="success-message" role="status">Pine Services was closed.</p>}
    {open && <div className="dialog-backdrop"><section ref={dialogRef} className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description"><h5 id="confirmation-title">Close Pine Services?</h5><p id="confirmation-description">This will remove Pine Services from active operations and prevent new assignments.</p>{confirmation.surface === 'typed-confirmation' && <label className="example-field">Type DELETE to confirm<input value={typed} onChange={(event) => setTyped(event.target.value)} /></label>}<div className="screen-actions"><button ref={cancelRef} className="contract-button secondary-outline" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="contract-button danger-emphasis-filled" type="button" disabled={!canConfirm} onClick={confirm}>Close Pine Services</button></div></section></div>}
  </article>
}
