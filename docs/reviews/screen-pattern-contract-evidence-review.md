# Screen Pattern Contract Evidence Review

This review records the current implementation evidence for the two persisted
Screen Pattern decisions under `screen-pattern-acceptance-contract.md`. It is
not the Acceptance Contract itself and does not add a pattern, an option, or a
screen-local fixture value to the UI Contract.

| Catalog rule and Contract path | Acceptance screen and required structure | Relevant states | DOM proof | Deterministic image evidence |
| --- | --- | --- | --- | --- |
| `search-list-pattern` — `screenPatternPolicy.searchList: standard-search-list` | Account directory: labelled conditions, Search/Clear, result count, sortable `Updated` column with visible direction, page navigation, a row action, explicit current-page selection, and a same-height table-context/bulk-action region. | unsearched, results, selected, busy, empty, error | Search form and results region labels; `aria-busy`; `aria-sort`, visible direction wording, and changed first row after sorting; table row headers; record-named row checkboxes and a current-page select-all checkbox; `data-selected`; prevented row navigation during batch mode; labelled result-page navigation. The UI audit compares checkbox, header, and visible-row coordinates before selection, after selection, and after clear. | `output/playwright/screen-pattern-evidence/local/images/search-list-{initial,results,selected,loading,zero-results,error}.{png,jpg}` generated from the manifest routes. |
| `form-section-pattern` — `screenPatternPolicy.formSection: grouped-form-section` | Edit account: a visible Personal information heading groups vertically scanned field columns, with record identity above and a distinct Save/Cancel action region. | initial, validation, saved/cancelled interaction | Named Personal information region; two ordered vertical field columns; field labels and reserved validation message areas; summary/field alerts; named Account actions group after the fields. | `output/playwright/screen-pattern-evidence/local/images/edit-detail-{initial,validation}.{png,jpg}` generated from the manifest routes. |

## Composition boundary

`standard-search-list` owns the repeated Search/List structure, not account
data, filter values, page size, sort order, row destination, or bulk-operation
business outcome. `grouped-form-section` owns the related-field grouping and
separate action area in Edit Detail, not the individual field definitions or
validation rules. Every current evidence artifact declares
`designPolicy.color` and `componentPolicy.button`, which it receives and
renders. Destructive Action also declares the passed confirmation surface.

The current fixed screen implementations do not read selected Text Field,
Checkbox, Validation, Availability, Loading, or State Feedback values. Their
fields, checks, validation, and recovery states have semantic/action coverage,
but are not declared as Contract composition until a later phase makes those
values visibly affect the screen. Edit List and Read-only Detail likewise do
not currently declare `standard-search-list` or `grouped-form-section`.

The image bundle is supplementary visual evidence. The Playwright assertions
are the repository evidence for semantics, loading state, validation, and
selection geometry; a human still judges whether the rendered business tasks
read naturally at the documented desktop viewport.
