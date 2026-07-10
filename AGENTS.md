# UI Contract Editor Agent Guidance

This file defines repository-local guidance for `ui-contract-editor`.
It takes precedence over user-level guidance for work inside this project.

## Required Concept Reading

Before adding, removing, renaming, or reclassifying UI Contract option values, read:

- `docs/knowledge/design-system-foundations.md`
- `docs/concepts/ui-contract-option-governance/concept.json`
- `docs/knowledge/design-system-anti-patterns.md`

The design-system foundations knowledge is the durable source for what this product means by system design and how foundations, components, interaction policy, and screen patterns are separated.
The option governance concept is the durable source for how this product decides whether a contract option belongs in the editor.
The anti-pattern knowledge base is the local source for design-system "do not" guidance that should block, constrain, or move proposed options before doing new web research.

For UX reviews or screen improvements to UI Contract Editor itself, use `docs/reviews/nielsen-heuristic-review.md` as a review checklist.
Do not treat that checklist as required reading for adding or changing Contract options.

## Product Translation Purpose

UI Contract Editor is a translation tool for visual design intent.
It should help users who do not know design-system, CSS, HTML, or frontend implementation terminology choose a desired visual treatment from previews and export Contract vocabulary that product designers, CSS/HTML authors, and frontend programmers can act on.

Contract labels and JSON values are only useful when they predict the intended UI with reasonable confidence.
If a competent frontend implementer would not know what visual result to produce, or would likely produce several materially different results, the term should be renamed, split, previewed more clearly, or sent through option governance instead of accepted as-is.
The same visual or interaction meaning must keep the same base vocabulary across the editor.
Using different words for the same design treatment, or reusing the same word for different treatments without a qualifier, is a translation defect and should be caught during review.

## Explanatory Copy Language Rule

Page titles, section headings, navigation/menu labels, shared UI/Contract vocabulary, and selectable option labels must remain English in both language modes. Explanatory option notes, state, helper, recovery, and action copy must be available in both Japanese and English through the existing language switch. Add exact Japanese and English entries to `src/i18n.ts` for new explanatory UI copy so Japanese reviewers can evaluate the same behavior; do not bypass the established translation mechanism with hard-coded prose. See `docs/knowledge/localization-and-review-copy.md` for the durable policy and semantic-equivalence requirement.

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

## Boundary Rule

Button Contract options may describe button-visible properties, such as emphasis, placement within an action group, loading display, disabled visual state, or icon usage.

Do not place broader workflow behavior in Button Contract merely because it is triggered by a button.
Examples that usually belong elsewhere:

- destructive-action confirmation rules
- dialog or modal behavior
- permission and availability policy
- form validation message placement
- screen-level empty or error states

If ownership is unclear, document the ambiguity before implementation.

## Reporting Rule

When reporting option-set changes, include:

- which option was added, removed, renamed, or moved
- why it belongs in the current foundation, component, interaction policy, or screen-pattern boundary, or why it was moved elsewhere
- what external design-system evidence was checked
- whether the option can be understood as a DESIGN.md rule without local project context
- whether a frontend implementer would likely produce the previewed visual treatment from the label, note, and JSON value
- any remaining uncertainty
