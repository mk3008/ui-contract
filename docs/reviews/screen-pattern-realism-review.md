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

## Contract Composition Blockers

For a Screen Pattern acceptance surface, an applicable immutable Contract path
is a composition requirement. A reviewer must treat a visible contradiction as
a blocker, not as a stylistic preference. In particular, when
`interactionPolicy.loading.feedback` is `communicate-busy-state`, every
asynchronous action shown by the pattern must retain its visible action label,
show a loading indicator on the initiating action, and programmatically expose
its busy state. A structured result region may additionally show a skeleton;
a disabled action without a loading state is insufficient.

The acceptance evidence must exercise the initiating action and assert the
loading state, label, busy semantics, and affected-region feedback. A Screen
Pattern may diverge only when its durable review report names the exact
Contract path, explains the screen-local reason, and records explicit human
approval; otherwise the review verdict is `blocker`.

This gate applies to Screen Pattern acceptance surfaces only. In a product
implementation, the real application code is authoritative unless a task
explicitly requires Contract conformance. A Contract does not replace
screen-specific behavior, business logic, or cases it cannot express.

## Evidence and Result

Capture each final artifact and inspect it. Record the copy inventory, action
inventory, interaction/accessibility risks, Contract-boundary decision, cited
design-system evidence, and verification limits. Screenshots alone do not prove
keyboard or assistive-technology behavior; verify those through focused tests or
implementation inspection.
