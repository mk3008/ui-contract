import { useEffect, useRef, useState } from 'react'
import type { ConfirmationSurface, UiContract } from './contract/types'
import { translateUiText, type UiLanguage } from './i18n'
import { type ScreenPatternExampleId } from './screen-pattern-evidence'

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

export function isLocalUndoEligible(surface: ConfirmationSurface): boolean { return surface === 'undo-when-reversible' }

export function InteractiveScreenPatterns({ contract, confirmation, example, button }: Props & { example: ScreenPatternExampleId }) {
  return <section className="interactive-screen-patterns" aria-label="Screen pattern acceptance surface" style={screenPatternStyle(contract)}>
    <div className="interactive-example-stage"><ScreenPatternContent button={button} confirmation={confirmation} example={example} focusPolicy={contract.interactionPolicy.focus} /></div>
  </section>
}

export function ScreenPatternPageArtifact({ contract, example }: { contract: UiContract; example: ScreenPatternExampleId }) {
  const artifactState = new URLSearchParams(window.location.search).get('state')
  const pageStyle = screenPatternStyle(contract)
  return <main className="screen-page-artifact" data-page-artifact data-screen-pattern={example} style={pageStyle}>
    <ScreenPatternContent artifact artifactState={artifactState} button={contract.componentPolicy.button} confirmation={contract.interactionPolicy.confirmation} example={example} focusPolicy={contract.interactionPolicy.focus} />
  </main>
}

function screenPatternStyle(contract: UiContract): React.CSSProperties {
  const colors = contract.designPolicy.color.light
  return {
    '--page': colors.background, '--surface': colors.surface, '--surface-soft': colors.surfaceSoft,
    '--text': colors.text, '--muted': colors.mutedText, '--line': colors.border,
    '--line-strong': colors.border, '--primary': colors.primary, '--primary-strong': colors.primary,
    '--primary-soft': colors.brandBackground, '--success': colors.success, '--warning': colors.warning,
    '--danger': colors.danger, '--focus-outer': colors.focusOuter, '--focus-inner': colors.focusInner,
  } as React.CSSProperties
}

function ScreenPatternContent({ artifact = false, artifactState, button, confirmation, example, focusPolicy }: { artifact?: boolean; artifactState?: string | null; button: Props['button']; confirmation: Props['confirmation']; example: ScreenPatternExampleId; focusPolicy: UiContract['interactionPolicy']['focus'] }) {
  const focusClass = `screen-pattern-focus focus-visibility-${focusPolicy.visibility} focus-indicator-${focusPolicy.indicatorStyle}`
  const content = example === 'search-list'
    ? <SearchListExample artifact={artifact} button={button} initialState={artifactState === 'results' || artifactState === 'selected' ? 'results' : artifactState === 'loading' ? 'busy' : artifactState === 'zero-results' ? 'empty' : artifactState === 'error' ? 'error' : 'unsearched'} initialSelection={artifactState === 'selected' ? [accounts[0][0]] : []} />
    : example === 'edit-detail'
      ? <EditDetailExample artifact={artifact} button={button} initialState={artifactState === 'validation' ? 'validation' : 'initial'} />
      : example === 'edit-list'
        ? <EditListExample artifact={artifact} button={button} initialState={artifactState === 'validation' ? 'validation' : artifactState === 'editing' ? 'editing' : 'initial'} />
        : example === 'read-only-detail'
          ? <ReadOnlyDetailExample artifact={artifact} button={button} initialState={artifactState === 'error' ? 'error' : 'initial'} />
          : <DestructiveActionExample artifact={artifact} confirmation={confirmation} button={button} initialState={artifactState === 'confirmation' || artifactState === 'error' || artifactState === 'result' ? artifactState : 'initial'} />
  return <div className={focusClass}>{content}</div>
}

function ScreenHeader({ title }: { title: string }) {
  return <header className="business-screen-header"><div><h4>{title}</h4></div></header>
}

function screenButtonClasses(button: Props['button']) { return `button-primary-${button.primaryEmphasis} button-secondary-${button.secondaryEmphasis} button-danger-${button.dangerEmphasis} button-danger-placement-${button.dangerPlacement}` }

function SearchListExample({ artifact = false, button, initialState = 'unsearched', initialSelection = [] }: { artifact?: boolean; button: Props['button']; initialState?: SearchState; initialSelection?: string[] }) {
  const translate = (text: string) => translateUiText(text, document.documentElement.lang === 'ja' ? 'ja' : 'en' as UiLanguage)
  const [state, setState] = useState<SearchState>(initialState)
  const [term, setTerm] = useState(initialState === 'empty' ? noMatchAccount : '')
  const [submitted, setSubmitted] = useState(initialState === 'empty' ? noMatchAccount : '')
  const [selected, setSelected] = useState(() => new Set(initialSelection))
  const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('descending')
  const sortSummary = sortDirection === 'descending' ? translate('Sorted by Updated, newest first') : translate('Sorted by Updated, oldest first')
  const sortButtonLabel = `${translate('Sort by updated')}: ${sortSummary}`
  const selectAllRef = useRef<HTMLInputElement>(null)
  const loadingTimerRef = useRef<number | null>(null)
  useEffect(() => () => { if (loadingTimerRef.current !== null) window.clearTimeout(loadingTimerRef.current) }, [])
  const sortedAccounts = sortDirection === 'descending' ? accounts : [...accounts].reverse()
  const accountsPerPage = 2
  const pageCount = Math.ceil(sortedAccounts.length / accountsPerPage)
  const visibleAccounts = sortedAccounts.slice((page - 1) * accountsPerPage, page * accountsPerPage)
  const selectedOnPage = visibleAccounts.filter(([name]) => selected.has(name))
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selectedOnPage.length > 0 && selectedOnPage.length < visibleAccounts.length
  }, [selectedOnPage.length, visibleAccounts.length])
  const clearSelection = () => setSelected(new Set())
  const assignOwner = () => { clearSelection(); setAssignmentStatus('Owner assigned.') }
  const toggleSelection = (name: string) => setSelected((current) => {
    const next = new Set(current)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    return next
  })
  const togglePageSelection = () => setSelected((current) => {
    const next = new Set(current)
    const selectPage = selectedOnPage.length !== visibleAccounts.length
    visibleAccounts.forEach(([name]) => { if (selectPage) next.add(name); else next.delete(name) })
    return next
  })
  const apply = () => {
    if (state === 'busy') return
    const requestedTerm = term
    clearSelection()
    setAssignmentStatus(null)
    setPage(1)
    setSubmitted(requestedTerm)
    setState('busy')
    loadingTimerRef.current = window.setTimeout(() => {
      setState(requestedTerm.trim().toLowerCase() === noMatchAccount.toLowerCase() ? 'empty' : requestedTerm === 'error' ? 'error' : 'results')
      loadingTimerRef.current = null
    }, searchLoadingDelayMs)
  }
  const reset = () => { clearSelection(); setAssignmentStatus(null); setPage(1); setTerm(''); setSubmitted(''); setState('unsearched') }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="search-list" data-screen="search-list" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account directory" />
    <form className="screen-section search-conditions" onSubmit={(event) => { event.preventDefault(); apply() }} aria-label="Search conditions">
      <div className="section-title"><h5>Search conditions</h5></div>
      <div className="search-condition-fields"><label className="example-field">Account name<input disabled={state === 'busy'} value={term} onChange={(event) => setTerm(event.target.value)} /></label><label className="example-field">Account status<select defaultValue="All statuses" disabled={state === 'busy'}><option>All statuses</option><option>Active</option><option>Review</option></select></label></div>
      <div className="screen-actions search-condition-actions"><button aria-busy={state === 'busy'} className={`contract-button primary-filled${state === 'busy' ? ' is-loading' : ''}`} disabled={state === 'busy'} type="submit">{state === 'busy' && <span aria-hidden="true" className="button-loading-indicator" />}Search</button><button className="contract-button secondary-outline" disabled={state === 'busy'} type="button" onClick={reset}>Clear</button></div>
    </form>
    <section className="screen-section results-region" aria-label="Account results" aria-busy={state === 'busy'}>
      <div className="results-toolbar"><div><h5>Accounts</h5></div></div>
      {state === 'unsearched' && null}
      {state === 'busy' && <div className="screen-state" role="status"><strong>Loading accounts</strong><div className="skeleton-row" /><div className="skeleton-row short" /></div>}
      {state === 'empty' && <div className="screen-state" role="status"><strong>No accounts found.</strong></div>}
      {state === 'error' && <div className="screen-state is-error" role="alert"><strong>Account results are unavailable</strong><p>Could not load the results. Try again.</p><button className="contract-button primary-filled" type="button" onClick={apply}>Retry</button></div>}
      {state === 'results' && <div className="table-with-pagination">
        <div data-table-context-toolbar className={`table-context-toolbar table-context-summary${selected.size ? ' batch-action-bar' : ''}`}>
          {selected.size ? <div className="bulk-context"><strong>{translate(`${selected.size} ${selected.size === 1 ? 'account' : 'accounts'} selected`)}</strong><button className="table-action" type="button" onClick={assignOwner}>{translate('Assign owner')}</button><button className="table-action" type="button" onClick={clearSelection}>{translate('Clear selection')}</button></div> : assignmentStatus ? <p role="status">{translate(assignmentStatus)}</p> : <p>{submitted ? `Results for “${submitted}”` : translate('4 accounts')} · {sortSummary}</p>}
        </div>
        <table className="business-table">
          <thead data-i18n-skip><tr><th className="table-selection-header" scope="col"><label className="table-selection-target"><input ref={selectAllRef} aria-label={translate('Select all accounts on this page')} checked={visibleAccounts.length > 0 && selectedOnPage.length === visibleAccounts.length} onChange={togglePageSelection} type="checkbox" /><span className="visually-hidden">{translate('Select all accounts on this page')}</span></label></th><th scope="col">Account</th><th scope="col">Status</th><th aria-sort={sortDirection} scope="col"><button aria-label={sortButtonLabel} className="table-sort-button" type="button" onClick={() => setSortDirection((current) => current === 'descending' ? 'ascending' : 'descending')}>{sortDirection === 'descending' ? 'Updated ↓' : 'Updated ↑'}</button></th><th scope="col"><span className="visually-hidden">Action</span></th></tr></thead>
          <tbody data-i18n-skip>{visibleAccounts.map(([name, status, updated]) => <tr data-selected={selected.has(name)} key={name}><td className="table-selection-cell"><label className="table-selection-target"><input aria-label={`${translate('Select account')}: ${name}`} checked={selected.has(name)} onChange={() => toggleSelection(name)} type="checkbox" /><span className="visually-hidden">{`${translate('Select account')}: ${name}`}</span></label></td><th scope="row"><strong>{name}</strong></th><td><span className={`record-status ${status === 'Active' ? 'success' : 'warning'}`}>{status}</span></td><td>{updated}</td><td><a aria-disabled={selected.size > 0 || undefined} className="table-action" href="/?screen-artifact=read-only-detail" onClick={(event) => { if (selected.size) event.preventDefault() }} onKeyDown={(event) => { if (selected.size && event.key === 'Enter') event.preventDefault() }} tabIndex={selected.size > 0 ? -1 : undefined}>{translate('View account')}</a></td></tr>)}</tbody>
        </table>
        <nav aria-label={translate('Account result pages')} className="paging"><button disabled={page === 1} type="button" onClick={() => setPage((current) => current - 1)}>{translate('Previous')}</button><span aria-current="page" aria-label={`Page ${page} of ${pageCount}`}>{page}</span><button disabled={page === pageCount} type="button" onClick={() => setPage((current) => current + 1)}>{translate('Next')}</button></nav>
      </div>}
    </section>
  </article>
}

function EditDetailExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'validation' }) {
  const initialDetails = initialState === 'validation'
    ? { name: '', dateOfBirth: '2030-01-01', email: 'alex.morgan', phone: '', streetAddress: '', city: '', postalCode: '' }
    : { name: 'Alex Morgan', dateOfBirth: '1990-06-16', email: 'alex.morgan@example.com', phone: '+1 415 555 0135', streetAddress: '220 Market Street', city: 'San Francisco', postalCode: '94105' }
  const [details, setDetails] = useState(initialDetails)
  const [submitted, setSubmitted] = useState(initialState === 'validation')
  const [saved, setSaved] = useState(false)
  const validationSummaryRef = useRef<HTMLDivElement>(null)
  const savedMessageRef = useRef<HTMLParagraphElement>(null)
  const errors = {
    name: !details.name.trim() ? 'Enter an account name.' : null,
    dateOfBirth: !details.dateOfBirth || details.dateOfBirth >= new Date().toISOString().slice(0, 10) ? 'Enter a date of birth in the past.' : null,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) ? 'Enter a valid email address.' : null,
    phone: !details.phone.trim() ? 'Enter a phone number.' : null,
    streetAddress: !details.streetAddress.trim() ? 'Enter a street address.' : null,
    city: !details.city.trim() ? 'Enter a city.' : null,
    postalCode: !details.postalCode.trim() ? 'Enter a postal code.' : null,
  }
  const hasErrors = Object.values(errors).some(Boolean)
  useEffect(() => {
    if (submitted && hasErrors) validationSummaryRef.current?.focus()
    if (saved) savedMessageRef.current?.focus()
  }, [hasErrors, saved, submitted])
  const update = (field: keyof typeof details) => (event: React.ChangeEvent<HTMLInputElement>) => setDetails((current) => ({ ...current, [field]: event.target.value }))
  const reset = () => { setDetails({ name: 'Alex Morgan', dateOfBirth: '1990-06-16', email: 'alex.morgan@example.com', phone: '+1 415 555 0135', streetAddress: '220 Market Street', city: 'San Francisco', postalCode: '94105' }); setSubmitted(false); setSaved(false) }
  const save = (event: React.FormEvent) => { event.preventDefault(); setSubmitted(true); setSaved(!hasErrors) }
  const field = (key: keyof typeof details, label: string, type = 'text', fullWidth = false) => <label className={`example-field${fullWidth ? ' screen-field-span-full' : ''}`}>{label} <span className="required-cue">Required</span><input type={type} required aria-invalid={submitted && Boolean(errors[key])} aria-describedby={`${key}-message`} value={details[key]} onChange={update(key)} /><span id={`${key}-message`} className="field-message" role={submitted && errors[key] ? 'alert' : undefined}>{submitted ? errors[key] : null}</span></label>
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="edit-detail" data-screen="edit-detail" data-state={submitted && hasErrors ? 'validation' : saved ? 'saved' : 'initial'} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Edit account" />
    {submitted && hasErrors && <div ref={validationSummaryRef} className="validation-summary" role="alert" tabIndex={-1}>Correct the highlighted required and invalid fields before saving.</div>}
    <form onSubmit={save} noValidate><section aria-labelledby="edit-account-personal-information" className="screen-section"><div className="read-only-detail-grid"><div><span>Account ID</span><strong>AC-2048</strong></div></div><div className="section-title"><h5 id="edit-account-personal-information">Personal information</h5></div><div className="screen-field-grid grouped-form-fields">{field('name', 'Account name')}{field('dateOfBirth', 'Date of birth', 'date')}{field('email', 'Email', 'email')}{field('phone', 'Phone number', 'tel')}{field('streetAddress', 'Street address', 'text', true)}{field('city', 'City')}{field('postalCode', 'Postal code')}</div></section><div aria-label="Account actions" className="screen-action-bar" role="group"><div className="screen-actions"><button aria-label="Cancel account changes" className="contract-button secondary-outline" type="button" onClick={reset}>Cancel</button><button aria-label="Save account changes" className="contract-button primary-filled" type="submit">Save</button></div></div>{saved && <p ref={savedMessageRef} className="success-message" role="status" tabIndex={-1}>Account changes saved.</p>}</form>
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

type PersonalDetails = {
  name: string
  dateOfBirth: string
  email: string
  phone: string
  streetAddress: string
  city: string
  postalCode: string
}

function ReadOnlyPersonalInformation({ accountId, details }: { accountId: string; details: PersonalDetails }) {
  const field = (label: string, value: string, type = 'text', fullWidth = false) => <label className={`example-field${fullWidth ? ' screen-field-span-full' : ''}`}>{label}<input type={type} readOnly value={value} /></label>
  return <section className="screen-section"><div className="read-only-detail-grid"><div><span>Account ID</span><strong>{accountId}</strong></div></div><div className="section-title"><h5>Personal information</h5></div><div className="screen-field-grid">{field('Account name', details.name)}{field('Date of birth', details.dateOfBirth, 'date')}{field('Email', details.email, 'email')}{field('Phone number', details.phone, 'tel')}{field('Street address', details.streetAddress, 'text', true)}{field('City', details.city)}{field('Postal code', details.postalCode)}</div></section>
}

function ReadOnlyDetailExample({ artifact = false, button, initialState = 'initial' }: { artifact?: boolean; button: Props['button']; initialState?: 'initial' | 'error' }) {
  const [state, setState] = useState<'initial' | 'error'>(initialState)
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="read-only-detail" data-screen="read-only-detail" data-state={state} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Account detail" />
    <div className="detail-status"><span className="record-status success">Active</span><p>This record is read-only because it is managed by the regional operations team.</p></div>
    <ReadOnlyPersonalInformation accountId="AC-2049" details={{ name: 'Lumen Office', dateOfBirth: '1985-11-22', email: 'm.suzuki@lumen.example', phone: '+1 415 555 0172', streetAddress: '81 Howard Street', city: 'San Francisco', postalCode: '94105' }} />
    {state === 'error' ? <section className="screen-state is-error" role="alert"><strong>Account detail is unavailable</strong><p>Could not refresh the detail. Try again.</p><button className="contract-button primary-filled" type="button" onClick={() => setState('initial')}>Retry</button></section> : <div className="screen-action-bar"><div className="screen-actions"><button className="contract-button secondary-outline" type="button" onClick={() => setState('error')}>Refresh</button></div></div>}
  </article>
}

function DestructiveActionExample({ artifact = false, confirmation, button, initialState = 'initial' }: { artifact?: boolean; confirmation: Props['confirmation']; button: Props['button']; initialState?: 'initial' | 'confirmation' | 'error' | 'result' }) {
  const [open, setOpen] = useState(initialState === 'confirmation')
  const [result, setResult] = useState<'initial' | 'error' | 'done'>(initialState === 'error' ? 'error' : initialState === 'result' ? 'done' : 'initial')
  const [typed, setTyped] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const errorResultRef = useRef<HTMLElement>(null)
  const successResultRef = useRef<HTMLParagraphElement>(null)
  const restoreTriggerFocusRef = useRef(false)
  const canConfirm = confirmation.surface !== 'typed-confirmation' || typed === 'DELETE'
  useEffect(() => {
    if (open) cancelRef.current?.focus()
    else if (restoreTriggerFocusRef.current) {
      triggerRef.current?.focus()
      restoreTriggerFocusRef.current = false
    }
  }, [open])
  useEffect(() => {
    if (result === 'error') errorResultRef.current?.focus()
    if (result === 'done') successResultRef.current?.focus()
  }, [result])
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { restoreTriggerFocusRef.current = true; setOpen(false); return }
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
  const closeDialog = () => { restoreTriggerFocusRef.current = true; setOpen(false) }
  const openDialog = () => { restoreTriggerFocusRef.current = false; setOpen(true) }
  const confirm = () => { restoreTriggerFocusRef.current = false; setOpen(false); setTyped(''); setResult('error') }
  return <article className={`business-screen ${screenButtonClasses(button)}`} data-artifact={artifact || undefined} data-example="destructive-action" data-screen="destructive-action" data-state={open ? 'confirmation' : result} data-primary-emphasis={button.primaryEmphasis}>
    <ScreenHeader title="Close account" />
    <ReadOnlyPersonalInformation accountId="AC-2050" details={{ name: 'Pine Services', dateOfBirth: '1988-04-08', email: 'support@pine.example', phone: '+1 415 555 0190', streetAddress: '100 Pine Street', city: 'San Francisco', postalCode: '94111' }} />
    <section className="screen-section"><p>Closing this account removes it from active operations and prevents new assignments.</p><div className="read-only-detail-grid"><div><span>Current status</span><strong>Paused</strong></div><div><span>Open assignments (must be 0)</span><strong>0</strong></div></div></section><div className="screen-action-bar"><button ref={triggerRef} className="contract-button danger-emphasis-outline" type="button" onClick={openDialog}>Close Pine Services</button></div>
    {result === 'error' && <section ref={errorResultRef} className="screen-state is-error" role="alert" tabIndex={-1}><strong>Account closure did not complete</strong><p>No account data was changed.</p><button className="contract-button primary-filled" type="button" onClick={() => setResult('done')}>Retry</button></section>}
    {result === 'done' && <p ref={successResultRef} className="success-message" role="status" tabIndex={-1}>Pine Services was closed.</p>}
    {open && <div className="dialog-backdrop"><section ref={dialogRef} className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description"><h5 id="confirmation-title">Close Pine Services?</h5><p id="confirmation-description">This will remove Pine Services from active operations and prevent new assignments.</p>{confirmation.surface === 'typed-confirmation' && <label className="example-field">Type DELETE to confirm<input value={typed} onChange={(event) => setTyped(event.target.value)} /></label>}<div className="screen-actions"><button ref={cancelRef} className="contract-button secondary-outline" type="button" onClick={closeDialog}>Cancel</button><button className="contract-button danger-emphasis-filled" type="button" disabled={!canConfirm} onClick={confirm}>Close Pine Services</button></div></section></div>}
  </article>
}
