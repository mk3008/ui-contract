# Design-System Foundations Knowledge

This file records the durable definition of "system design" used by UI Contract Editor.
Use it before reviewing component options, screen patterns, visual policy, or contract boundaries.

The goal is not to copy any single public design system.
The goal is to preserve the shared lesson from mature systems: a design system is a product-level source of truth for consistent, accessible, reusable user experiences.

## Source Pattern

Atlassian describes a design system as guidelines, foundations, tools, and components.
Its system separates foundations, components, and patterns:

- Foundations: tokens, guidelines, and visual styles such as color, spacing, typography, and accessibility.
- Components: reusable building blocks that satisfy specific interaction needs.
- Patterns: combinations of foundations and components that create consistent experiences.

Atlassian also frames design tokens as named design decisions and emphasizes consistent experiences across apps, devices, platforms, and assistive technologies.

Related sources:

- https://atlassian.design/get-started/about-atlassian-design-system
- https://atlassian.design/design-system
- https://atlassian.design/foundations
- https://atlassian.design/tokens/design-tokens
- https://atlassian.design/foundations/accessibility

Material similarly describes design tokens as reusable design decisions that make up a visual style.
This supports treating colors, typography roles, spacing roles, and semantic states as reusable policy, not one-off styling.

Related source:

- https://m3.material.io/foundations/design-tokens

## Local Definition

For UI Contract Editor, system design means:

- translating a non-specialist user's visual design preference into terms that product designers, CSS/HTML authors, and frontend programmers can reliably act on,
- defining reusable UI rules across a product or family of products,
- keeping control states, interaction affordances, layout patterns, accessibility, and visual roles consistent,
- choosing stable policies that can be implemented in different CSS frameworks or component libraries,
- separating foundations, components, interaction policy, and screen patterns,
- documenting both "do this" and "do not do this" guidance,
- translating DESIGN.md-style human design principles into reviewable JSON and Markdown contract artifacts.

It is broader than colors.
It includes color, typography principles, spacing/layout principles, component states, interaction behavior, screen patterns, accessibility, and cognitive-load control.

A design system is not a CSS library, theme preset, or component implementation.
The guidance should say what rule the product team wants the UI to follow, not which CSS class, runtime package, or implementation detail must be used.

The rule must also be understandable as DESIGN.md-style guidance when read outside this application.
The wording should stand on common design-system vocabulary or plain business-application language.
When a Contract value is meant to name a visual treatment, it must be specific enough that a competent frontend programmer or designer would produce the intended visual result most of the time.
If a term only sounds like design language but does not predict the resulting UI with reasonable confidence, the term is not good enough for this product's translation purpose.
Do not rely on private product names, source-app names, local metaphors, or implementation-only terms to carry the meaning.
Color is the main exception: concrete colors, color roles, and brand palettes may use specific values because color tokens are an explicit foundation.

It is narrower than application behavior.
It does not decide business logic, data loading, permission checks, or what a specific screen must do in a specific case.

## Foundation / Component / Pattern Boundaries

Use these boundaries when classifying UI Contract work.

### Foundations

Foundations define reusable design primitives and principles.

Examples:

- color roles and semantic colors,
- typography principles,
- focus indicator colors and visibility,
- spacing/layout stability principles,
- accessible contrast and readable states,
- icon usage principles.

Foundations are not individual screen choices.

### Components

Components define reusable controls and their states.

Examples:

- button emphasis and danger treatment,
- text field label, required cue, helper/error message behavior,
- checkbox choice surface and mixed state,
- toggle treatment,
- tabs treatment,
- card treatment and card interaction.

Components may show multiple states.
They should not decide business semantics such as whether a field is required in a specific form or whether an action is permitted for a user.

### Interaction Policy

Interaction policy defines cross-component behavior.

Examples:

- focus visibility,
- validation timing and presentation,
- availability / unavailable-control treatment,
- destructive-action confirmation surface and scope.

Interaction policy should not be hidden inside one component merely because that component triggers the interaction.

### Screen Patterns

Screen patterns define repeated page or workflow structures.

Examples:

- search condition panel,
- result grid with paging and bulk action,
- detail screen,
- dialog flow,
- wizard,
- responsive / small viewport behavior,
- SPA navigation history behavior.

Screen patterns provide a standard shape.
They should not freeze every layout dimension or all screen-specific business choices.

### Screen Pattern Composition

A Screen Pattern composes an immutable Contract snapshot with screen-local
fictional fixtures. It gives a reviewer a concrete screen structure in which
foundations, components, and interaction policy can be assessed together.

`docs/reviews/screen-pattern-acceptance-contract.md` owns the fixed acceptance
quality gates, proof hierarchy, deterministic-capture requirements, and human
realism decision. This section owns the composition and fixture boundaries that
the Acceptance Contract audits.

The ownership boundary is deliberate: foundations own visual roles and focus;
components own controls and visible control states; interaction policy owns
shared loading, validation, availability, feedback, and confirmation behavior;
Screen Patterns own the repeated page structure and composed Contract paths;
screen-local fixtures own fictional records, columns, fields, query values, and
deterministic outcomes. Fixture details must not be promoted into Contract
values merely because an acceptance screen needs them.

| Pattern | Required integrated composition |
| --- | --- |
| Search/List | Labelled conditions with apply/reset, result count, sortable table/list, selection and bulk context, row action, paging, plus loading, no-results, and error/retry states. |
| Edit Detail | Record identity, grouped editable sections, label/help/error treatment, distinct Save/Cancel action area, and validation plus saved/cancelled outcome. |
| Edit List | Preserved list context, a row action and editing surface, row validation, commit, and cancel. |
| Read-only Detail | Scan-friendly record identity and grouped values, explicit availability/non-editability, legitimate next actions, and detail recovery. |
| Destructive Action | Originating record context, named target and consequence, safe cancel focus, confirmation, result, and failure/retry; an undo appears only when existing policy permits it. |

For Search/List state feedback, distinguish an unsearched initial state from a
completed zero-result state. Before a request, do not present result records as
if they had already been returned. When the page title, conditions, and search
action already make the next task clear, leave the result region empty rather
than adding instructional copy. After a request returns no matching records,
explain that condition and provide a recovery action while retaining the
relevant search context. This composes the existing loading and state-feedback
invariants; it does not add a Contract option or make result criteria Contract
policy.

The Acceptance Contract requires the associated full-page evidence, semantic
and action proof, exact image verification, deterministic reruns, and human
realism review. A screen-local application shell is fixture composition using
existing foundations, not a Contract option; promote an alternate shell only
when it is proven reusable product policy. Its composition-accountability
matrix audits the finished realistic page and excludes fine layout mechanics;
necessary record data, workflow semantics, and shell fixtures remain justified
exceptions rather than reasons to add artificial UI or Contract values.

### Structured Search/List Composition

Directories, search results, and comparable structured operational content use a
constrained content grid by default. This is a semantic Screen Pattern/layout
principle: a fixed grid preserves the relationship between conditions, actions,
the result table, and pagination on wide desktop views. Fluid layout is reserved
for content with no natural horizontal maximum, such as a board or canvas.

The numeric CSS maximum is an implementation detail, not a Contract field.
Search Apply and Reset belong in the same local condition/action grouping; table
pagination belongs directly below the related table in the same bounded region.
Their precise alignment is Screen Pattern composition, not a Button or
Pagination component option.

This principle does not presently justify a selectable Contract field. Keep the
recommended constrained composition as the default and hold any option proposal
until product evidence establishes a durable, user-selectable alternative
layout policy with clear ownership.

For multi-select tables, explicit checkboxes remain the selection control.
Selected rows receive visible feedback in addition to their checkbox state, and
the scoped batch-action bar is immediately adjacent to the table. Do not make
arbitrary row surfaces toggle selection when a separate row action has a
different intent; row activation remains deliberate. This is fixed
standard-search-list behavior, not a Checkbox or Button Contract option.

### Spatial Target Stability in Data Tables

Do not dynamically insert controls that displace an active or likely-next
pointer target. When a header or top-of-table region needs variable state, it
reserves the same block size from the initial render: its unselected state
presents useful table context, while its selected state replaces that content
with scoped count and batch actions. This preserves the coordinates of the
table header, checkboxes, and rows during selection instead of treating the
shift as acceptable merely because it follows user input or does not affect a
CLS score.

This is a spatial-stability rule, not a forced location. A footer can be a
valid case-by-case alternative, while a top-of-table placement remains
appropriate when it improves discoverability or task context. In either case,
the variable region must reserve equal space before the state transition.

The invariant is exact: **a state transition initiated from a control must not
change viewport coordinates of the initiating control, nor any existing
interactive target above it, during the direct follow-up interaction window.**
Treat this as render-output acceptance, independent of MVVM or other state
implementation. Avoid dynamically inserting controls above a table; where no
above target exists, retain the rule as a general requirement for future
tables and forms.

This is a fixed Screen Pattern/layout stability rule. The reserved block size
is an implementation detail, not a Contract field or a Button/Checkbox option.
Focused interaction tests should compare the triggering target, select-all or
header controls, and visible rows above it across the state change and return
transition, while retaining semantic checkbox and batch-action coverage.

## Review Rules

Before adding or changing a Contract option, check:

1. Is this foundation, component, interaction policy, or screen pattern?
2. Is the option a durable design policy, not a one-off CSS style?
3. Does the option describe a visible state, operation affordance, or reusable pattern?
4. Is the option supported by official design-system guidance or common business UI practice?
5. Does the option avoid accessibility, comprehension, and layout-instability risks?
6. Can the option be explained with a short, recognizable name?
7. Does the preview clearly show state differences without relying on color alone?
8. Does the default choose the safest and most conventional baseline?
9. Would this rule make sense if written in DESIGN.md before it is encoded as JSON?
10. Can different CSS frameworks or UI libraries implement the same rule without changing its meaning?
11. Would another AI understand the option without knowing this repository, a source application, or local shorthand?
12. Are any concrete values limited to color tokens or named design roles rather than layout dimensions or CSS implementation?
13. Would a competent frontend programmer or product designer likely produce the previewed visual result from the Contract term?
14. Does the preview make the essential visual meaning of the term visible, such as fill, border, text color, contrast, state, grouping, or interaction affordance?

If the answer is unclear, classify the proposal as `hold` or move it to the owning policy area.

## Local Consequences

- Do not review UI Contract options as isolated decoration.
- Do not add options only because a local app happened to use the pattern.
- Use local app designs as seeds, then compare them with design-system evidence.
- Preserve defaults that are readable, accessible, stable, and familiar for business applications.
- Keep option labels and JSON values portable; source-app evidence belongs in review notes, not in contract vocabulary.
- Rename, split, or hold options when the label or JSON value does not predict the intended frontend implementation with reasonable confidence.
- Keep "should not" knowledge in `docs/knowledge/design-system-anti-patterns.md`.
- Keep option admission rules in `docs/concepts/ui-contract-option-governance/concept.json`.
