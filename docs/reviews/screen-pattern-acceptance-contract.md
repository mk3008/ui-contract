# Screen Pattern Acceptance Contract

This is the fixed acceptance and review contract for every Screen Pattern
acceptance surface. It defines the quality gates and evidence expected before a
pattern is accepted. It is not an exported UI Contract option, a
`screenPatternPolicy` value, a schema field, fixture data, migration, import
rule, or adapter behavior.

## Ownership boundary

| Owner | Owns | Does not own |
| --- | --- | --- |
| Exported UI Contract | Portable foundations, component rules, interaction policy, and declared Screen Pattern structures. | A particular business record, workflow outcome, or acceptance result. |
| Screen Pattern | The integrated, plausible business-screen structure that composes applicable Contract paths. | New Contract semantics or arbitrary fixture values. |
| Deterministic screen-local fixtures | Fictional records, fields, query values, dates, outcomes, and application-shell context needed to make the task reviewable. | Reusable visual or interaction policy. |
| This Acceptance Contract | Quality gates, evidence expectations, review handoff, and the human realism decision. | Exported Contract meaning or product behavior outside the acceptance surface. |

The Contract specifies reusable intent; the Pattern proves that its applicable
rules can form a coherent task. A necessary fixture exception remains local and
must not be promoted merely to raise Contract coverage.

## Fixed acceptance clauses

1. **Operational task.** Render a complete, plausible business task, not a
   component gallery, static mood board, or isolated state demonstration.
2. **Business-page copy.** The rendered page contains only task or record
   identity, task-required labels/help, data/state/validation/recovery feedback,
   and concise actions. Contract, fixture, acceptance, process, and
   UI-explanation prose is prohibited unless it is genuinely needed to complete
   or recover the task.
3. **Declared Contract composition.** Every applicable declared Contract path
   has a visible structural or behavioral composition, named state coverage,
   semantic DOM/ARIA/action proof, and deterministic capture evidence. A visible
   contradiction is a blocker; do not silently reinterpret a Contract path to
   fit a screen.
4. **Perceivable state.** Selection, busy, validation, availability,
   confirmation, error, and recovery states use labels, semantics, controls, or
   other non-colour cues as applicable; colour alone is not proof.
5. **Spatial target stability.** A direct state transition must not change the
   viewport coordinates of its initiating target or any existing interactive
   target above it during the immediate follow-up interaction window. Reserve or
   replace equal-height contextual space when variable content is necessary.
6. **Actions and selection.** Normal visible action labels are concise and
   context-appropriate. In tables, checkbox selection remains explicit and is
   distinguishable from deliberate row navigation; selected-row feedback and
   batch context supplement, but never replace, that explicit control.
7. **Evidence hierarchy.** DOM, semantic, keyboard/focus, dialog, action, and
   recovery assertions are primary evidence. PNG and JPEG captures supplement
   them; screenshots never prove assistive-technology behavior on their own.
8. **Deterministic full-page evidence.** Each required state has an exact
   documented-viewport complete application-page capture. It excludes editor,
   Contract, evidence, fixture, and process chrome. The manifest identifies the
   state, route, fixture version, viewport, browser, capture route/command,
   current canonical Contract JSON digest, relevant Contract paths, and both
   PNG and JPEG outputs. Image dimensions and two clean captures must be
   checked for determinism before review.
9. **Human realism decision.** Automated checks cannot establish that a page
   reads as a coherent business workflow. A reviewer must inspect rendered
   evidence and apply the realism and copy gate before acceptance. An automated
   pass is not a substitute for this decision.

## Traceability and evidence matrix

| Clause | Primary owner | Required proof | Decision type |
| --- | --- | --- | --- |
| Operational task and information/action hierarchy | Screen Pattern + fixtures | Full-page capture and artifact inspection | human review |
| Business-page copy and concise actions | Screen Pattern | Copy/action inventory under the realism review | human review, with targeted DOM checks where stable |
| Applicable Contract-path composition | Exported Contract + Screen Pattern | Path-to-screen matrix, named states, DOM/ARIA/action checks, manifest paths | automated and reviewed |
| Perceivable state and recovery | Component/Interaction Policy + Screen Pattern | Semantic state, label, recovery-action, and non-colour assertions | automated |
| Spatial target stability | Screen Pattern layout | Before/after target-coordinate assertions for the triggering control and relevant targets | automated |
| Explicit table selection versus navigation | Screen Pattern + Checkbox semantics | Checkbox, selected-row, batch-context, and navigation-guard assertions | automated |
| Deterministic complete-page capture | This Acceptance Contract | Manifest, exact PNG/JPEG dimension checks, two-clean-run comparison, artifact-chrome exclusion checks | automated and reviewed |
| Overall business realism | This Acceptance Contract | `screen-pattern-realism-review.md` completed against rendered evidence | human review |

## Related authorities

- `docs/knowledge/design-system-foundations.md` defines the Foundation,
  Component, Interaction Policy, Screen Pattern, fixture, and composition
  boundaries, including structured Search/List and spatial-stability rules.
- `docs/reviews/screen-pattern-realism-review.md` owns the human business-page
  realism, copy, action, and interaction review procedure.
- `docs/reviews/screen-pattern-contract-evidence-review.md` records the
  current declared Contract-path evidence; it is an implementation review, not
  this contract.
- `docs/reviews/nielsen-heuristic-review.md` reviews the Contract Editor, not a
  completed business-page artifact.

## Review handoff

A review report names the Contract snapshot/digest, changed paths, path-to-screen
traceability, automated commands/results, generated artifact locations, visual
inspection, copy/action disposition, Contract-boundary decision, and remaining
human gate. If any clause cannot be satisfied without a new selectable policy
or a changed Contract meaning, stop and request the product decision instead of
changing the exported model.
