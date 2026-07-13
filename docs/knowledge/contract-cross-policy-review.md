# Cross-Policy Consistency Review

Use this review before accepting any change to the UI Contract catalog, a
persisted policy, an invariant, or a screen-pattern decision. It complements
option governance: option governance decides whether a proposed value is
admissible; this review decides whether it can coexist with the rest of the
Contract without creating contradictory ownership and whether a shared policy
should be extracted instead of repeated.

## What Counts As A Conflict

A repeated visual word is not automatically a conflict. A conflict exists when
two independently selectable Contract values prescribe incompatible treatment
for the same subject, state, and scope, with no stated precedence.

Classify a candidate relationship as one of:

- **duplicate**: two persisted paths own the same decision for the same subject;
  remove, merge, or move one of them.
- **conflict**: independent values can prescribe incompatible results for the
  same state; define one owner or an explicit precedence rule before acceptance.
- **layered composition**: a Component owns its internal presentation, an
  Interaction Policy owns behavior across components, and a Screen Pattern owns
  the arrangement of existing components. These may compose when each scope is
  explicit.
- **shared baseline**: two components use a similar visible treatment because it
  is appropriate to their different semantics. Keep the component-owned rules
  separate unless the treatment must be selectable and identical across all
  components; only then consider a Foundation.

## Extract Shared Policy Before Repeating It

Consistency does not mean putting every visually similar setting in a global
Foundation. Nielsen's consistency-and-standards heuristic requires that users
do not have to wonder whether the same words or actions mean different things;
it does not require controls with different semantics to expose the same
configuration. Minimal design also warns against adding irrelevant choices.

Extract a shared rule only when all of these are true:

1. The subject, state, and user-visible result are the same across the candidate
   components.
2. The rule must be selected or enforced consistently wherever those components
   appear; a component-specific exception would be a real exception, not a
   normal use case.
3. The rule can be stated without hiding component semantics, screen context,
   or application behavior.
4. Official design-system guidance supports the same general rule across the
   affected control family.
5. The extracted owner is clear: Foundation-level Layout Policy for reusable
   arrangement principles, Foundation for cross-component visual/accessibility
   primitives, Component for control anatomy, Interaction Policy for
   cross-component behavior, or Screen Pattern for repeated screen structure.

Keep a rule component-local when its correct treatment depends on the control's
selection semantics or a normal context distinction. Record the common visual
idea in the review matrix, but do not create a misleading global switch merely
to remove repetition.

## Choice Group Layout Review Decision

The Radio, Checkbox, Toggle, and Form Section review identifies a
missing Foundation-level Layout Policy. The relevant subject is not a control
type; it is the arrangement of sibling visible choices in a choice group.

- **Choice Group Layout must be extracted as a shared Layout Policy.** It owns
  the readable arrangement of sibling visible choices, independently of whether
  those choices are radio buttons, checkboxes, or another visible choice control.
  The portable baseline is "stack choice groups by default; permit inline layout
  only for a short binary choice in an appropriate screen context." This is a
  layout principle, not a Radio or Checkbox behavior setting.
- **Implemented shared owner.** `designPolicy.choiceGroupLayout` is the one
  Foundation-level owner of sibling-choice arrangement. Checkbox has no local
  layout path. Native Radio semantics are not a persisted Contract decision,
  so there is no Radio Group component policy to compete with the Foundation.
- **Visible group/option labels and a non-colour-only selected state are shared
  implementation requirements, not persisted choices.** Review them together
  with the extracted Layout Policy without inventing a Radio-specific setting.
- **Form Section composes rather than duplicates.** It arranges related fields
  and an action area. A choice group is one field/control arrangement inside that
  screen structure; the Form Section does not own its sibling-choice layout.

Sources reviewed for this decision:

- https://design-system.service.gov.uk/components/radios/
- https://carbondesignsystem.com/components/radio-button/usage/
- https://www.nngroup.com/articles/ten-usability-heuristics/

## Required Review Matrix

For every candidate, compare it with every existing entry that shares a control
family, visible treatment, state, grouping relationship, or layout word. Record:

| Check | Required question |
| --- | --- |
| Subject | Which control, state, or repeated screen structure does each rule govern? |
| Owner | Is the owner a Foundation, Component, Interaction Policy, Screen Pattern, or application case? |
| Scope | Does it govern a control's internals, cross-component behavior, or arrangement of existing controls? |
| Selection | Can both values be selected independently in the same situation? |
| Result | If both apply, are their visible results compatible without an unstated override? |
| Vocabulary | Does repeated wording mean the same visual treatment, or is a qualifier needed? |
| Evidence | Does the preview and test prove the boundary and non-colour state cues? |

Stop and return to governance when the owner, simultaneous applicability, or
precedence is unclear. Also stop when a repeated policy meets the extraction
criteria but has no appropriate existing owner. Do not resolve a conflict by
adding a second option or by making a preview silently choose one policy.

## Current Boundary Examples

- `componentPolicy.toggle` owns the presentation of an immediate binary control;
  it does not own native-radio or Checkbox group arrangement.
- `designPolicy.choiceGroupLayout` owns the stacked default and constrained
  inline allowance for sibling visible choices.
- `componentPolicy.checkbox` retains choice surface and mixed-state rules; it
  has no layout path.
- Native radio controls retain their standard exclusive-choice semantics without
  a persisted Component Contract; Choice Group Layout governs only arrangement.
- `screenPatternPolicy.formSection` owns grouping related fields and separating
  an action area. It may contain a radio group, but it does not choose the radio
  group's internal option layout.
- `interactionPolicy` rules such as focus, validation, availability, loading,
  and confirmation apply across components and must not be duplicated as
  component-local alternatives.

The repeated word "vertical" in radio-control and form-section examples is
not automatically a duplicate, but it must be classified before acceptance. In
the Radio/Checkbox case it is now expressed by the shared sibling-choice layout
Foundation. In Form Section it describes the
scan of related fields within a screen structure, so it composes with Choice
Group Layout rather than owning the same decision.

## Acceptance Evidence

An implementation review must include the matrix result in its durable report,
identify every related existing catalog entry inspected, and state whether the
result is duplicate, conflict, layered composition, or shared baseline. The
catalog integrity test must continue to reject duplicate persisted paths. When
the review identifies an unowned shared constraint, record the required
extraction or removal as a follow-up; do not preserve the inconsistency merely
because the current paths are mechanically distinct.
