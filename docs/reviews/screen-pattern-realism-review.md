# Screen Pattern Realism and Copy Review

Use this review for final Screen Pattern artifacts. It complements
`nielsen-heuristic-review.md`, which evaluates UI Contract Editor rather than a
completed operational screen.

## Gate

Review the rendered artifact as a production business page with no knowledge of
Contract, test fixtures, or acceptance mechanics. Every visible non-fixture
sentence must be one of: task or record identity; task-required field help;
data/state/validation/recovery; or concise action. Remove demo, Contract,
process, acceptance, and UI-explanation copy. Promote a repeated necessary rule
only through Contract option governance.

## Actions

Use concise familiar verbs. Prefer `Save` and `Cancel` when the page already
identifies the record and editing context. Preserve explicit object or
consequence wording for destructive, ambiguous, or multi-object actions. Normal
action captions must be one line at the artifact viewport; accessible names may
add context without lengthening the visible label.

## Interaction

Keep controls close to their affected data. For multi-select tables, retain an
explicit checkbox, selected-row feedback that is not color-only, and a
table-adjacent batch-action bar. Do not repurpose arbitrary row clicks as
selection when row links or row actions have a different intent.

When a header or top-of-table region changes with selection, replace content
within a persistent equal-height region rather than inserting a new block
above the table. Reserve that space from the normal initial state with useful
business table context. A footer can be an appropriate case-by-case
alternative; keep a top placement when it improves discoverability or task
context. Verify that the header, active checkbox, and unaffected rows keep
their coordinates across selection and deselection; a good CLS score alone is
not proof of pointer-target stability.

Apply this render-output invariant: **a state transition initiated from a
control must not change viewport coordinates of the initiating control, nor
any existing interactive target above it, during the direct follow-up
interaction window.** This applies independently of MVVM or other state
implementation. If a screen has no target above the initiating control, retain
the rule for future tables and forms instead of adding controls above it.

## Evidence and Result

Capture each final artifact and inspect it. Record the copy inventory, action
inventory, interaction/accessibility risks, Contract-boundary decision, cited
design-system evidence, and verification limits. Screenshots alone do not prove
keyboard or assistive-technology behavior; verify those through focused tests or
implementation inspection.
