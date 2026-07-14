# Screen Pattern Contract Evidence Review

This review records the current implementation evidence for the two persisted
Screen Pattern decisions under `screen-pattern-acceptance-contract.md`. It is
not the Acceptance Contract itself and does not add a pattern, an option, or a
screen-local fixture value to the UI Contract.

| Catalog rule and Contract path | Acceptance screen and required structure | Relevant states | DOM proof | Deterministic image evidence |
| --- | --- | --- | --- | --- |
| `search-list-pattern` — `screenPatternPolicy.searchList: standard-search-list` | Account directory: labelled conditions, Search/Clear, result count, sortable `Updated` column, page navigation, a row action, explicit selection, and a same-height table-context/bulk-action region. | unsearched, results, selected, busy, empty, error | Search form and results region labels; `aria-busy`; sortable header `aria-sort`; table row headers; explicit row and select-all checkboxes; `data-selected`; disabled row links during batch mode; labelled result-page navigation. The UI audit compares checkbox, header, and visible-row coordinates before selection, after selection, and after clear. | `output/playwright/screen-pattern-evidence/local/images/search-list-{initial,results,selected,loading,zero-results,error}.{png,jpg}` generated from the manifest routes. |
| `form-section-pattern` — `screenPatternPolicy.formSection: grouped-form-section` | Edit account: a visible Personal information heading groups vertically scanned field columns, with record identity above and a distinct Save/Cancel action region. | initial, validation, saved/cancelled interaction | Named Personal information region; two ordered vertical field columns; field labels and reserved validation message areas; summary/field alerts; named Account actions group after the fields. | `output/playwright/screen-pattern-evidence/local/images/edit-detail-{initial,validation}.{png,jpg}` generated from the manifest routes. |

## Composition boundary

`standard-search-list` owns the repeated screen structure, not account data,
filter values, page size, sort order, row destination, or bulk-operation
business outcome. `grouped-form-section` owns the related-field grouping and
separate action area, not the individual field definitions or validation
rules. The screen composes the existing Text Field, Checkbox, Button, Loading,
State Feedback, and Validation decisions without duplicating their persisted
ownership.

The image bundle is supplementary visual evidence. The Playwright assertions
are the repository evidence for semantics, loading state, validation, and
selection geometry; a human still judges whether the rendered business tasks
read naturally at the documented desktop viewport.
