# UI Contract Editor Agent Guidance

This file defines repository-local guidance for `ui-contract-editor`.
It takes precedence over user-level guidance for work inside this project.

## Required Concept Reading

Before adding, removing, renaming, or reclassifying UI Contract option values, read:

- `docs/concepts/ui-contract-option-governance/concept.json`
- `docs/knowledge/design-system-anti-patterns.md`

The option governance concept is the durable source for how this product decides whether a contract option belongs in the editor.
The anti-pattern knowledge base is the local source for design-system "do not" guidance that should block, constrain, or move proposed options before doing new web research.

## Option Governance Rule

Treat user suggestions, agent ideas, and plausible UI preferences as hypotheses.
Do not turn them directly into UI Contract options.

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
- why it belongs in Button Contract or why it was moved elsewhere
- what external design-system evidence was checked
- any remaining uncertainty
