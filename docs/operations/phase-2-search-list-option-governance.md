# Phase 2 Search/List option governance

## Decision

`screenPatternPolicy.searchList: "standard-search-list"` is a Screen Pattern, not a Component or Interaction Policy. It describes the reusable page structure: submitted search conditions, reset, result count, sortable result columns, paging, row actions, and a bulk-action area that appears after selection.

The one safe default is `standard-search-list`. It uses portable, established vocabulary and is sufficiently specific for an implementer to produce the previewed structure. It does not select filters, columns, row actions, bulk actions, data loading, permission handling, or destructive confirmation; those remain screen use-case or Interaction Policy concerns.

## Evidence checked

- Carbon’s [data table guidance](https://carbondesignsystem.com/components/data-table/usage/) covers sortable headers, pagination, search, batch actions, and row actions.
- Carbon’s [filtering pattern](https://carbondesignsystem.com/patterns/filtering/) supports an explicit apply-filters action when multiple filters are set.
- Carbon’s [empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/) requires contextual guidance and distinguishes no-results and error management states.
- Carbon’s [loading pattern](https://carbondesignsystem.com/patterns/loading-pattern/) treats loading as cross-cutting feedback; it is referenced in the preview but not owned by this decision.
- GOV.UK [pagination guidance](https://design-system.service.gov.uk/components/pagination/) supports applying filtering/sorting to the full list and returning to page one.

## Boundary review

Focus, validation, availability, loading, destructive-action, and confirmation ownership remains in Interaction Policy. The preview labels these as references only; it introduces no Phase 3 selectable policy.
