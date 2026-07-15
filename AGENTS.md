# UI Contract Editor Guidance

This policy applies repository-wide.

## Language Policy

- Contract JSON keys, schema fields, option IDs, Contract values, filenames,
  and technical documentation use English as their stable vocabulary.
- UI display copy is authored in Japanese; English copy is a translation of the
  Japanese source. Do not let the technical-documentation rule override this
  UI-copy rule.
- User-facing work reports are in Japanese unless the user requests another
  language.

## Routing

- Use orchestration only when delegating to multiple agents, running independent
  workstreams in parallel, recovering or handling stale work, or preserving
  progress across a long or cross-session run. A normal single-agent
  investigation → implementation → test task is not orchestration merely
  because it has multiple steps.
- When orchestration applies, read `docs/operations/codex-orchestration.md` and
  `docs/operations/orchestration-protocol.md` before dispatch.
- Before changing Contract semantics, including an option set, value, label,
  note, default, preview, ownership, classification, or a move between
  foundation, component, interaction policy, and Screen Pattern, read:
  - `docs/knowledge/design-system-foundations.md`
  - `docs/concepts/ui-contract-option-governance/concept.json`
  - `docs/knowledge/design-system-anti-patterns.md`
  - `docs/knowledge/contract-cross-policy-review.md`
- For an editor UX review, use `docs/reviews/nielsen-heuristic-review.md`.
- For final Screen Pattern or business-screen review, use
  `docs/reviews/screen-pattern-realism-review.md` and the
  `$business-screen-review` skill.

## Open Worker Scope Gate

- A worker that has sent `WORKER_ACK` owns one frozen, independently reviewable
  packet. Do not send it additional implementation work while it is running.
- Record a new user request as a queued task with purpose, acceptance,
  dependency, overlap risk, and dispatch condition. Tell the user whether it is
  queued, parallelized, or a later correction.
- Dispatch queued work only after the active task has a terminal report and the
  orchestrator has recorded an accept, correction, stop, or failure decision.
- Reuse the same worker only for a correction that closes an original acceptance
  gap, and only after its terminal report. Use another worker for a parallel
  task only when files, runtime state, and verification evidence do not overlap.
- An active worker may receive only protocol repair, stop/safety, or a
  non-material clarification. Never stack independent user requests into a
  running packet.

## Human Conversation and Worker Event Separation

- Treat worker ACKs, reports, watchdog results, and delegation delivery as
  control-plane events, not as human requests. The active orchestrator remains
  the user's single conversation counterpart.
- The durable ledger is the only execution-state authority. A worker report is
  evidence linked from the ledger, not a second state store. Keep a delivered
  protocol message to the task ID, attempt, status, and report path; never
  paste worker reasoning, logs, or a full report into a human-facing reply.
- If an event arrives during a human request, record and acknowledge it with
  the worker, then continue that request unchanged. Defer review and any
  user-facing worker update until the current reply is complete, unless the
  event blocks, invalidates, or makes the request unsafe.
- Coalesce non-blocking worker events. Notify the user only for a review
  decision, blocker, human decision, or completed visible outcome.
- Do not create a separate inbox task merely to hide worker notifications; it
  splits authority and adds polling. The UI may show a compact protocol event
  in this thread without changing the active human conversation.

## Non-negotiable product rules

The design-system foundations knowledge is the durable source for what this product means by system design and how foundations, components, interaction policy, and screen patterns are separated.
The option governance concept is the durable source for how this product decides whether a contract option belongs in the editor.
The anti-pattern knowledge base is the local source for design-system "do not" guidance that should block, constrain, or move proposed options before doing new web research.

For UX reviews or screen improvements to UI Contract Editor itself, use `docs/reviews/nielsen-heuristic-review.md` as a review checklist.
Do not treat that checklist as required reading for adding or changing Contract options.

## Product Translation Purpose

UI Contract Editor is a translation tool for visual design intent.
It should help users who do not know design-system, CSS, HTML, or frontend implementation terminology choose a desired visual treatment from previews and export Contract vocabulary that product designers, CSS/HTML authors, and frontend programmers can act on.

Contract labels and JSON values are only useful when they predict the intended UI with reasonable confidence.
If a competent frontend implementer would not know what visual or interaction
result to produce, or would likely produce several materially different
results, the term should be renamed, split, previewed more clearly, or sent
through option governance instead of accepted as-is.
The same visual or interaction meaning must keep the same base vocabulary across the editor.
Using different words for the same design treatment, or reusing the same word for different treatments without a qualifier, is a translation defect and should be caught during review.

## Editor Structural Consistency

When changing UI Contract Editor itself, screens with the same purpose,
information structure, and interaction model must reuse the established editor
layout, hierarchy, spacing relationships, and action placement. An interactive
preview may change an existing region label (for example, `Preview` to `Try
it`) or its internal representation; it is not by itself a reason to introduce
a different screen shell. The fixed invariant, exception test, and required
recording of a new pattern are defined in
`docs/knowledge/design-system-foundations.md`.

## Explanatory Copy Language Rule

UI display copy, including page titles, headings, navigation/menu labels,
selectable labels, notes, state, helper, recovery, and action copy, is authored
in Japanese and translated to English through the existing language switch.
Stable technical Contract vocabulary remains English in JSON keys, schema
fields, option IDs, values, and filenames; do not confuse it with the Japanese
source for displayed copy. Add Japanese and English entries to `src/i18n.ts`
for new UI copy rather than bypassing the translation mechanism with hard-coded
prose. See `docs/knowledge/localization-and-review-copy.md` for the durable
policy and semantic-equivalence requirement.

## Option Governance Rule

Treat user suggestions, agent ideas, and plausible UI preferences as hypotheses.
Do not turn them directly into UI Contract options.

UI Contract values are intended to be read as DESIGN.md-like rules by other AI agents and humans.
Except for color values and named color roles, option values, labels, and notes must use plain, established design language.
Do not introduce project-specific names, source-app names, private metaphors, CSS class names, component package names, or local implementation jargon as contract vocabulary.
Before adding role-specific option names, define or reuse the shared base pattern when one exists.
For example, button roles should choose from shared coloring patterns such as filled, outline, neutral surface, tonal color, or text before adding primary-, secondary-, or danger-specific wording.

Before changing an option set, compare the proposal against official design-system guidance or well-established product UI patterns, such as:

- Atlassian Design System
- Material Design
- Carbon Design System
- Fluent UI
- Primer
- GOV.UK Design System
- Shopify Polaris

Prefer official documentation over blog posts, examples copied from random apps, or intuition.
When evidence is weak, classify the proposal as `hold`, `reject`, or `move-to-another-policy` instead of adding it as a button option.

## Default Option Rule

Initial UI Contract values must select the evidence-backed recommended or safest baseline option, not an arbitrary preview-friendly option.

When multiple design systems strongly favor a pattern, use that pattern as the sample/default value. Examples:

- Use top labels for ordinary text fields when no form-layout-specific reason overrides them.
- Avoid placeholder text by default; allow placeholder examples only when the contract explicitly chooses that policy.
- Prefer stable, conventional business-application defaults over visually novel or high-risk variants.

If design-system guidance conflicts, choose the option with the lowest accessibility, comprehension, and layout-instability risk, then preserve the uncertainty in review notes.

## Reference Screen Governance

Reference screens are research material for extracting reusable business-application
design principles. They are not assets, specifications, or implementation targets.

- Use references only when they represent contemporary, high-quality business or
  operational software. Do not use marketing, teaser, campaign, or advertising
  pages as evidence for business-application screen patterns.
- Re-check contemporaneity and established design-system guidance when selecting
  references; visual fashion alone is not sufficient evidence.
- Keep external screenshots, URLs, capture metadata, and attribution outside the
  repository and Git history. A private research record may retain sources.
- Do not copy a reference screen's distinctive composition, branding, copy,
  imagery, names, or identifiable visual expression into product code, Contract
  vocabulary, generated JSON/Markdown, screenshots, or user-facing text.
- Record only source-independent design conclusions in this repository, using
  portable terms that a frontend implementer can apply without knowing a source
  product. Validate each conclusion against official design-system guidance,
  Nielsen review, accessibility, and the existing Contract boundaries.
- Treat reference screenshots as supplementary visual evidence. Screen behavior,
  keyboard and assistive-technology support, data semantics, permissions, and
  recovery behavior require their own Contract or screen-pattern evidence.

## Component Boundary Rule

Component Contracts own the component's visible treatment, states, and local
affordance. For example, Button Contract may describe emphasis, placement in an
action group, loading display, disabled visual state, or icon usage.

Interaction Policies and Screen Patterns own behavior that crosses components:
workflow, permission and availability, validation, confirmation, and screen
state. Do not place that behavior in a Component Contract merely because a
component triggers it. Examples that usually belong elsewhere:

- destructive-action confirmation rules
- dialog or modal behavior
- permission and availability policy
- form validation message placement
- screen-level empty or error states

If ownership is unclear, document the ambiguity before implementation.

## Screen Pattern Acceptance Invariant

`docs/reviews/screen-pattern-acceptance-contract.md` is the sole detailed
authority for Screen Pattern acceptance quality, evidence, and the human
realism gate. Apply `docs/reviews/screen-pattern-realism-review.md` before
acceptance; that review does not itself add schema fields or options.

## Reporting Rule

When reporting a Contract semantics change, include:

- which option set, value, label, note, default, preview, ownership, or
  classification changed
- why it belongs in the current foundation, component, interaction policy, or screen-pattern boundary, or why it was moved elsewhere
- what external design-system evidence was checked
- whether the option can be understood as a DESIGN.md rule without local project context
- whether a frontend implementer would likely produce the intended visual or
  interaction result from the label, note, preview, and JSON value
- any remaining uncertainty
