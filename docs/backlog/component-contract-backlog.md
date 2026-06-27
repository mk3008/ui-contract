# Component Contract Backlog

This backlog records component and pattern candidates for future UI Contract Editor work.
Items here are not accepted contract options yet. Each item still needs option-governance review
against design-system evidence before implementation.

## Candidate Components And Patterns

- Calendar / date picker
- Listbox / combobox
- List
- Toggle / switch
- Radio option group
- Grid / data table
- Pagination
- Tabs
- Badge / status chip
- Dialog
- Wizard / stepper
- Search condition panel
- Notification / alert
- Searchable text field / autocomplete

## Additional Business-App Candidates

- Checkbox group
- Select dropdown
- Multi-select
- Text area
- Number input
- Currency / amount input
- File upload
- Form layout / form section
- Inline validation summary
- Empty state
- Error state
- Loading / skeleton state
- Toolbar / action bar
- Breadcrumb
- Side navigation
- Filter chips / active filter summary
- Sort control
- Bulk action bar
- Detail drawer / side panel
- Popover / contextual menu
- Tooltip policy

## Cross-Cutting Policy Candidates

- Focus policy
  - Own visible focus treatment across buttons, text fields, links, menus, and other interactive controls.
  - Initial review direction: use an evidence-backed visible focus indicator by default, likely an offset outline or similarly robust treatment.
  - Candidate concerns: focus indicator visibility, focus color role, focus ring shape/offset, focus-visible behavior, and focus-not-obscured behavior around sticky headers or overlays.
  - Do not model focus separately inside Button Contract or Text Field Contract unless a future concept defines a component-specific exception.

## Review Notes

- Dialog, wizard, notification, search condition panel, empty state, error state, and loading state are broader screen or workflow patterns, not simple component styling.
- Grid, pagination, sorting, filtering, and bulk actions should likely be reviewed together as data-workflow patterns.
- Combobox, searchable text field, autocomplete, select, and multi-select overlap and should be separated by user task and accessibility behavior before becoming contract options.
- Tooltip policy should remain cautious because it can become a hidden-explanation mechanism rather than visible UI guidance.
- Focus policy should be reviewed as a shared interaction/accessibility policy because focus visibility applies to every interactive element, not just one component family.
