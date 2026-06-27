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
- Card / content block
- Detail drawer / side panel
- Inspector / side panel policy
- Popover / contextual menu
- Tooltip policy

## Cross-Cutting Policy Candidates

- Focus policy
  - Own visible focus treatment across buttons, text fields, links, menus, and other interactive controls.
  - Initial review direction: use an evidence-backed visible focus indicator by default, likely an offset outline or similarly robust treatment.
  - Candidate concerns: focus indicator visibility, focus color role, focus ring shape/offset, focus-visible behavior, and focus-not-obscured behavior around sticky headers or overlays.
  - Do not model focus separately inside Button Contract or Text Field Contract unless a future concept defines a component-specific exception.

- Responsive / small viewport policy
  - Own how core workspaces, navigation, inspectors, previews, and action areas adapt on small screens.
  - Candidate concerns: sidebar collapse, right-panel collapse, sticky header behavior, preview stacking, minimum usable control size, and whether dense editor surfaces should remain available on mobile.
  - Do not model this as per-component size choices. It is a layout and workflow policy.

- Side panel policy
  - Own supporting panels such as inspectors, details, property editors, legends, and contextual help.
  - Candidate concerns: default open/closed state, width, sticky behavior, whether the panel scrolls independently, collapse affordance, and small viewport fallback.
  - Do not model this as a generic card or dialog. Side panels are persistent workspace companions, while dialogs interrupt the current flow.

- Navigation history policy
  - Own browser back/forward behavior for SPA-like editor screens.
  - Candidate concerns: whether selected menu/page, selected component, preview mode, opened panels, and inspector state should push history, replace history, or remain local UI state.
  - This is screen/application behavior, not a visual component contract.

- Confirmation policy
  - Own when an action requires confirmation and what confirmation surface is used.
  - Candidate concerns: destructive actions, irreversible actions, bulk actions, navigation-away with unsaved changes, and typed confirmation for high-risk operations.
  - Do not place destructive confirmation in Button Contract; buttons can show danger intent, but confirmation is workflow/dialog policy.

## Review Notes

- Current classification:
  - Contract Editor: Card / content block, Side panel policy, Confirmation policy.
  - Screen Patterns: Navigation history policy, Responsive / small viewport policy.
- Card, Side panel, and Confirmation should not treat the extracted lineage-viewer design as authoritative. Use it as a seed, then expose only broadly recognizable business UI policy choices with live previews.
- Checkbox review note:
  - Keep the default as a plain checkbox + label because major systems treat the label as the normal click target.
  - Add an explicit `Choice surface` axis for row or bordered-row treatment when the product needs a clearer clickable area in dense tools.
  - Treat bordered checkbox rows as close to selectable tile / choice-row behavior, not as the universal checkbox default.
- Dialog, wizard, notification, search condition panel, empty state, error state, and loading state are broader screen or workflow patterns, not simple component styling.
- Grid, pagination, sorting, filtering, and bulk actions should likely be reviewed together as data-workflow patterns.
- Combobox, searchable text field, autocomplete, select, and multi-select overlap and should be separated by user task and accessibility behavior before becoming contract options.
- Tooltip policy should remain cautious because it can become a hidden-explanation mechanism rather than visible UI guidance.
- Focus policy should be reviewed as a shared interaction/accessibility policy because focus visibility applies to every interactive element, not just one component family.
- Card should be reviewed as a content-structure pattern before becoming a visual style option. The editor already uses cards internally, but that does not prove that business applications need a selectable Card Contract.
- SPA history and mobile behavior should be reviewed as application shell or screen-pattern policies. They affect user workflow and recovery, not only component appearance.
- Confirmation should be reviewed together with Dialog, Button danger intent, and destructive-action policy so the same rule is not duplicated across component contracts.
