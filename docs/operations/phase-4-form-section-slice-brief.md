# Phase 4 form-section slice brief

## Decision

**Adopt one Screen Pattern slice:** add the fixed, exported decision
`screenPatternPolicy.formSection: "grouped-form-section"`.

It means: group related input controls beneath a visible section heading or group
label, present the fields in a vertically scannable section, and keep the section's
action area visually distinct. It is a reusable arrangement of existing Component
Contracts, not a new input type or a workflow engine. It is deliberately one
evidence-backed baseline, rather than a menu of layout variants.

`grouped-form-section` is plain, portable DESIGN.md vocabulary. A frontend
implementer can render a labelled group of related fields and a distinct action area
without a CSS framework, component library, pixel measurement, or local product
knowledge. The preview must visibly demonstrate the heading/group relationship,
vertical field scan, and action-area separation.

## Issue and customer value

The editor currently exports individual input-component policies and the
`standard-search-list` pattern, but no portable shape for the common business task of
entering or configuring related data. A non-specialist therefore cannot express a
coherent form section without inventing layout or implementation terminology.

This slice lets a product team express that reusable intent while retaining the
existing input and interaction-policy vocabulary.

## Evidence and classification

- The backlog lists **Form layout / form section** as a business-app candidate
  (`docs/backlog/component-contract-backlog.md`). The foundations knowledge classifies
  repeated page structures as Screen Patterns, while Components remain reusable
  controls (`docs/knowledge/design-system-foundations.md`). Therefore this belongs at
  `screenPatternPolicy`, not `componentPolicy`.
- [Carbon Form](https://carbondesignsystem.com/components/form/usage/) defines a form
  as related input controls and identifies header, body, and footer/action anatomy.
- [Carbon Forms pattern](https://carbondesignsystem.com/patterns/forms-pattern/)
  recommends grouping related tasks under section titles, vertical scanning, and
  top-aligned labels, while treating page, side-panel, and dialog presentation as
  use-case dependent.
- [GOV.UK Fieldset](https://design-system.service.gov.uk/components/fieldset/) supports
  grouping related inputs with a descriptive legend. Its radio and checkbox guidance
  likewise makes the group relationship explicit.

The anti-pattern knowledge was checked. This slice adds neither a hidden-explanation
mechanism nor a choice that duplicates unavailable-control treatment. It introduces
no CSS, framework, source-app, or product-private vocabulary.

## Scope in

1. Add the single `grouped-form-section` decision to the catalog, types, defaults,
   schema, validated import/export, rendered-decision registry, fixture, and Markdown
   output through the existing contract path.
2. Add one Screen Pattern editor entry and preview composed from existing input
   examples. The preview must have a visible English section heading/group label,
   vertically arranged fields, and a clearly separate action area.
3. Add explanatory notes, captions, state/help/recovery copy, and action copy in both
   Japanese and English through `src/i18n.ts`. Navigation, page/section headings,
   shared Contract vocabulary, selectable label, and JSON value remain English in both
   language modes.
4. Version and migrate the Contract according to the repository's existing explicit
   import-compatibility policy. The implementation worker must decide the next version
   from the current `0.2.0` shape, add the deterministic migration from supported old
   versions, and test it; do not silently default a malformed imported value.

## Scope out and ownership boundaries

- **Interaction Policy remains owner:** focus; validation timing/presentation;
  availability/permission explanation; loading feedback; empty/error guidance;
  destructive confirmation. The form preview may reference these states but adds no
  competing values.
- **Screen use case/application remains owner:** which fields exist; input mode
  (including radio, select, combobox, date picker, and multi-select); field order;
  required/optional business meaning; defaults; submitted data; button semantics;
  permissions; retry; and whether the form lives on a page, side panel, or dialog.
- Do not add column count, widths, spacing numbers, density, responsive breakpoints,
  a wizard, dialog behavior, validation-summary alternatives, or submit/cancel
  workflow choices. These are contextual layout/workflow decisions, not this portable
  pattern.
- Do not alter the already-owned `standard-search-list` structure, Button Contract, or
  Phase 3 fields.

## Deferred or rejected alternatives

| Candidate | Disposition | Reason |
| --- | --- | --- |
| Date picker | Deferred | Calendar versus typed date entry depends on the field task and accessibility behavior. |
| Dialog, wizard, notification | Deferred | Each risks duplicating confirmation, loading, or state feedback owned by Phase 3. |
| Grid, pagination, filtering, sorting, bulk action | Rejected as a Phase 4 slice | Phase 2 already owns these in `standard-search-list`. |
| Card and side panel | Deferred | Already exist in `componentPolicy`; their backlog boundary needs separate governance, not another expansion. |
| Navigation history and small-viewport policy | Deferred | Application-shell/workflow policies, not a bounded form-section pattern. |
| Checkbox or radio component expansion | Deferred | Viable component work, but less customer value than composing existing controls into the missing recurring form structure. |
| Select-family normalization | Deferred | It requires a separate input-mode and migration decision; do not hide it inside form work. |

## Acceptance criteria and verification plan

| Acceptance criterion | Verification method |
| --- | --- |
| The contract has exactly one new form-section decision with default `grouped-form-section`, under `screenPatternPolicy`. | Catalog/default/type/schema inspection plus contract tests. |
| A valid current-version import/export round trip preserves the value; supported old contracts migrate explicitly; an unknown value is invalid. | Extend `src/contract/contract.test.ts` and fixtures; run `npm run test`. |
| The editor lets the user inspect the decision and its preview clearly shows heading/group, vertical fields, and action area. | Add/extend a focused Playwright audit; run the relevant `npm run test:ui-audit` case. |
| The new selectable label/value stays English in both language modes; every new explanatory string has semantically equivalent JP/EN entries. | Extend `src/ui-audit/localization.spec.ts`; inspect `src/i18n.ts`; run its focused audit. |
| No Phase 3 policy is duplicated and no CSS/framework-specific value appears. | Review the changed catalog/schema/UI against this brief, the foundations, option governance, and anti-pattern knowledge. |
| Build remains valid and no whitespace errors are introduced. | Run `npm run build` and `git diff --check`. |

Repository evidence is sufficient for the schema, migration, localization, and preview-structure claims. Human visual review remains supplementary evidence for whether the preview makes the three structural cues immediately recognizable.

## Implementation starting points

Before changing code, read `AGENTS.md`, the three required governance documents,
`docs/operations/phase-2-search-list-option-governance.md`,
`docs/operations/phase-3-interaction-policy-governance.md`, and this brief. Then
inspect:

- `src/contract/catalog.ts`, `types.ts`, `defaults.ts`, `schema.ts`, `import.ts`,
  `output.ts`, and `rendered-decisions.ts` for the persisted decision path;
- `src/contract/contract.test.ts` and `src/contract/fixtures/` for version and
  import assertions;
- `src/main.tsx` and `src/styles.css` for the editor menu, section panel, and preview;
- `src/i18n.ts` and `src/ui-audit/localization.spec.ts` for localization behavior.

## Risks, human-review questions, and stop conditions

- **Risk:** adding layout variants would turn a stable pattern into a CSS/layout
  preference menu. Mitigation: keep one fixed value and reject measurements,
  columns, and breakpoints from this slice.
- **Risk:** an action area could be mistaken for Button, confirmation, or form-submit
  policy. Mitigation: preview it as structural separation only; action choice and
  behavior remain case-owned.
- **Human review question (non-blocking):** does `grouped-form-section` describe the
  intended preview as clearly as “Grouped form section” in the UI label? Keep the JSON
  literal and selectable label English; if the preview cannot make the relationship
  obvious, stop before schema work and revise the wording/preview together.

Stop implementation and return to governance if a requested value controls input
selection, requiredness, validation, availability, confirmation, loading, recovery,
dialog/side-panel container, or exact layout mechanics. Also stop if the preview
cannot distinguish the structural rule without color alone, or if a compatibility
migration cannot preserve old valid contracts explicitly.

## Worker report v1

- Goal: choose one evidence-backed, bounded Phase 4 vertical slice.
- Actions taken: inventoried the existing backlog and editor; checked the Phase 2 and
  Phase 3 ownership decisions, governance, foundations, anti-patterns, localization
  policy, and official Carbon/GOV.UK documentation.
- Code changes: none.
- Attainment status: **done** — this brief is implementation-ready; implementation is
  intentionally out of scope.
- Outcome: a worker can add one portable form-section Screen Pattern without absorbing
  Interaction Policy or case-owned form behavior.
- Open questions: the non-blocking wording/preview readability check above.
- Now / next: human review of this brief, then implementation by a separate worker.
