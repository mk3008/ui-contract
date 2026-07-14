# Design-System Anti-Pattern Knowledge

This knowledge base records design-system guidance that should normally block or constrain UI Contract options.
Use it before adding, renaming, or normalizing selectable contract values.

The goal is not to copy one design system. The goal is to avoid presenting patterns as ordinary choices when multiple established systems describe them as confusing, inaccessible, rare, or context-dependent.

## How To Use This File

- Treat each proposed option as a hypothesis.
- Check this file before doing new internet research.
- If a proposed option conflicts with a `hard deny`, do not add it unless the product concept explicitly records a stronger reason.
- If a proposed option matches a `boundary deny`, move it to the owning policy area instead of adding it to Button Contract.
- If evidence here is old, unclear, or insufficient for a new component area, then do fresh research and update this file.

## Evidence Levels

- `hard deny`: Multiple sources or a strong official source warn against normal use.
- `boundary deny`: The pattern may be valid, but it belongs outside the current contract boundary.
- `context-limited`: The pattern exists, but only under specific conditions.

## Button Anti-Patterns

### BAN-BTN-001: Do not make disabled buttons the default unavailable-action pattern

Evidence level: `hard deny`

Decision:
Do not add Button Contract options that imply disabled buttons are the default way to handle unavailable actions. Disabled button styling may exist, but availability, permission, and explanation policy must be handled separately.

Evidence:
- Primer says disabled buttons should generally be avoided because they cannot be reached by keyboard users.
- GOV.UK, Scottish Government, and NHS warn that disabled buttons can confuse users and should be used only when research shows they help.
- Shopify says async operations should use loading rather than disabled because loading communicates progress.

Sources:
- https://primer.style/product/components/button/accessibility/
- https://design-system.service.gov.uk/components/button/
- https://designsystem.gov.scot/components/button
- https://service-manual.nhs.uk/design-system/components/buttons
- https://shopify.dev/docs/api/app-home/web-components/actions/button

### BAN-BTN-002: Do not put unavailable-action explanation UI inside Button Contract

Evidence level: `boundary deny`

Decision:
Do not add Button Contract options such as `disabled inline hint`, `disabled tooltip`, or `disabled dialog` as button visual choices. Explanation mechanisms belong to availability, permission, form validation, or support-message policy.

Evidence:
- Fluent allows tooltips for disabled buttons.
- Primer's inactive-button guidance allows a tooltip or dialog as feedback.
- These are behavior/explanation policies, not button styling policies.

Sources:
- https://fluent2.microsoft.design/components/web/react/core/button/usage
- https://primer.style/product/components/button/guidelines/

### BAN-BTN-003: Do not present hidden/collapsed unavailable actions as disabled-button styling

Evidence level: `boundary deny`

Decision:
Do not add options like `hide disabled action`, `collapse disabled action space`, or `reserve disabled action space` under Button Contract. These describe availability and layout policy, not button visual state.

Rationale:
Hiding, disabling, and preserving space affect discoverability, keyboard access, and layout stability. They require screen-level or permission-level review.

Related evidence:
- GOV.UK, Scottish Government, NHS, and Primer warn that disabled controls are confusing or inaccessible.
- The official systems reviewed do not make hide/collapse behavior a button visual variant.

Sources:
- https://design-system.service.gov.uk/components/button/
- https://designsystem.gov.scot/components/button
- https://service-manual.nhs.uk/design-system/components/buttons
- https://primer.style/product/components/button/accessibility/

### BAN-BTN-003A: Do not expose near-identical disabled visual treatments as contract choices

Evidence level: `context-limited`

Decision:
Do not add multiple disabled styling options when their user-facing distinction is weak. Disabled styling may be previewed as a fixed derived state, but ordinary users should not have to choose between nearly identical gray treatments.

Rationale:
Disabled controls are already a constrained and potentially confusing state. Offering small visual variants can imply disabled buttons are a normal design lever, while not solving the larger availability, permission, or explanation problem.

Local consequence:
Button Contract should not expose `disabledTreatment` as a selectable option unless a later component concept defines a materially different, evidence-backed disabled-state strategy. The preview should use a conventional neutral disabled state instead of preserving primary, danger, or secondary color identity.

### BAN-BTN-004: Do not use icon-only buttons for destructive actions

Evidence level: `hard deny`

Decision:
Do not add or normalize a danger/destructive button option that can render as icon-only. Destructive actions need a visible label.

Evidence:
- Carbon explicitly says danger buttons cannot be used in icon-only form and should keep a visual label.

Sources:
- https://carbondesignsystem.com/components/button/usage/

### BAN-BTN-005: Do not treat icon-only buttons as normal button defaults

Evidence level: `context-limited`

Decision:
Icon-only button use must be constrained to recognizable actions, space-limited surfaces, or toolbar-like contexts. It must not be the default for ordinary business actions.

Local interpretation:
Separate two questions: whether labeled buttons should receive decorative/clarifying icons, and whether icon-only buttons are allowed at all. Tooltip text is not sufficient as the primary meaning guarantee for ordinary business actions because hover-only help does not reliably serve touch, keyboard, or always-visible comprehension needs. Icon-only actions need at least an accessible name and a recognizable, space-limited context; visible text remains preferred when space allows.

Evidence:
- Carbon says icon-only buttons should be used sparingly and require explanatory text such as a tooltip.
- Atlassian describes icon-only buttons as suitable for common recognizable actions where space is limited.
- Shopify says visible text is preferred when possible; icon-only controls need an accessible label.
- Primer says labels should not rely too heavily on icons or visual cues.

Sources:
- https://carbondesignsystem.com/components/button/usage/
- https://atlassian.design/components/button/icon-button
- https://polaris-react.shopify.com/components/actions/button
- https://primer.style/product/components/button/accessibility/

### BAN-BTN-006: Do not overuse icons in labeled buttons

Evidence level: `context-limited`

Decision:
Do not add options that imply every button should carry an icon. Icons may clarify selected actions, but the label must carry the action meaning.

Evidence:
- Carbon says icons should be used sparingly and must directly relate to the action.
- Primer notes that button text must convey meaning and should not rely on icons or color alone.

Sources:
- https://carbondesignsystem.com/components/button/usage/
- https://primer.style/product/components/button/accessibility/

### BAN-BTN-007: Do not use ghost/transparent styling as ordinary secondary emphasis

Evidence level: `context-limited`

Decision:
Do not present `ghost`, `transparent`, or text-like buttons as the default secondary-emphasis choice for business actions. If such a style exists, constrain it to low-priority actions in clear context, dense toolbars, or many minor actions.

Evidence:
- Carbon describes ghost as the least pronounced action and gives specific pairing/context examples.
- Atlassian subtle buttons are for places where it is already clear that text is interactive.
- Fluent uses subtle or transparent appearances for many minor actions to avoid a busy layout, not as the ordinary secondary button default.

Sources:
- https://carbondesignsystem.com/components/button/usage/
- https://atlassian.design/components/button/examples
- https://fluent2.microsoft.design/components/web/react/core/button/usage

### BAN-BTN-008: Do not create multiple primary actions in one layout

Evidence level: `hard deny`

Decision:
Do not add options that normalize multiple primary buttons in the same action group or layout region.

Evidence:
- Fluent says only one primary button should be used in a layout for the most important action.
- Primer says to use one primary button on a page whenever possible.
- Government Project Delivery guidance limits primary buttons to improve effectiveness.

Sources:
- https://fluent2.microsoft.design/components/web/react/core/button/usage
- https://primer.style/product/components/button/guidelines/
- https://projectdelivery.gov.uk/get-involved/connect-and-contribute/publishing-content-on-the-government-project-delivery-website/design-system/components/button/

### BAN-BTN-009: Do not overuse warning or danger buttons

Evidence level: `hard deny`

Decision:
Danger and warning treatment must be sparse and tied to genuinely destructive or high-risk actions. Do not add options that make danger styling a general emphasis color.

Evidence:
- GOV.UK says warning buttons only work if used very sparingly and most services should not need one.
- Carbon frames danger buttons around destructive effects on user data.

Sources:
- https://design-system.service.gov.uk/components/button/
- https://carbondesignsystem.com/components/button/usage/

### BAN-BTN-010: Do not make loading look like ordinary disabled state

Evidence level: `hard deny`

Decision:
Async progress should use a loading state rather than only disabled styling. If the action is in progress, the user needs progress feedback.

Evidence:
- Shopify says to use loading over disabled for async operations because loading communicates progress.
- Primer loading uses a button loading state and preserves focus with `aria-disabled`.
- Carbon supports inline loading in button context.

Sources:
- https://shopify.dev/docs/api/app-home/web-components/actions/button
- https://primer.style/product/components/button/
- https://carbondesignsystem.com/components/button/usage/

### BAN-BTN-011: Do not let loading-state visuals cause avoidable layout movement

Evidence level: `boundary deny`

Decision:
Do not add a loading option that replaces a label with an icon/spinner while shrinking the button footprint. If a label is visually hidden during loading, reserve the original button footprint unless a separate layout concept explicitly permits reflow.

Local interpretation:
For this editor's business-application baseline, do not expose a selectable loading-state option for spinner-only or label-replacement loading. Use the conventional spinner-with-visible-label preview until a future concept defines materially different, evidence-backed loading patterns.

Evidence:
- Atlassian, Carbon, Primer, and Shopify support loading indicators, but the reviewed official guidance does not recommend shrinking action rows as a benefit.
- Primer emphasizes preserving focus during loading.
- This project treats avoidable layout movement as a UI Contract risk unless a screen/layout policy owns the reflow.

Sources:
- https://atlassian.design/components/button/examples
- https://carbondesignsystem.com/components/button/usage/
- https://primer.style/product/components/button/
- https://shopify.dev/docs/api/app-home/web-components/actions/button

### BAN-BTN-012: Do not confuse action buttons and navigation links

Evidence level: `hard deny`

Decision:
Use button semantics for actions and link semantics for navigation. Do not add options that normalize buttons-as-links or links-as-buttons without semantic review.

Evidence:
- Fluent says buttons trigger actions; for navigation, try a link.
- Shopify says merchants expect buttons to submit data or take action and links to navigate.
- USWDS warns that screen readers and keyboards handle links and buttons differently.
- Scottish Government gives explicit requirements when a link is perceived as an action.

Sources:
- https://fluent2.microsoft.design/components/web/react/core/button/usage
- https://polaris-react.shopify.com/components/actions/button
- https://designsystem.digital.gov/components/button/
- https://designsystem.gov.scot/components/button

### BAN-BTN-013: Do not rely on color, icon, or ARIA label to replace visible meaning

Evidence level: `hard deny`

Decision:
Button labels must remain clear and descriptive. Do not make color, icon, or hidden accessible labels carry the main action meaning for ordinary buttons.

Evidence:
- Primer says color alone is not reliable and button text must provide sufficient meaning.
- Shopify says visible text is preferred when possible and warns that visible/programmatic label mismatch can confuse speech users.
- Fluent asks for active, brief labels that reflect the action.

Sources:
- https://primer.style/product/components/button/accessibility/
- https://polaris-react.shopify.com/components/actions/button
- https://fluent2.microsoft.design/components/web/react/core/button/usage

### BAN-BTN-014: Do not allow multi-line button labels as a normal variant

Evidence level: `hard deny`

Decision:
Do not add a button option that intentionally allows ordinary button labels to wrap or break lines. Long copy should be rewritten or moved out of the button.

Evidence:
- Primer says button labels should be succinct and buttons should not contain line breaks that lose the button shape.

Sources:
- https://primer.style/product/components/button/guidelines/

### BAN-BTN-015: Do not mix button sizes within the same action group without a layout reason

Evidence level: `context-limited`

Decision:
Button size is valid as a policy, but do not mix sizes casually in a single action group. If mixed sizes are needed, the layout concept must explain why.

Evidence:
- Scottish Government says button groups should use a consistent sizing approach and should not mix button sizes with width modifiers.
- Carbon defines productive button sizes for specific use cases rather than arbitrary mixing.

Sources:
- https://designsystem.gov.scot/components/button
- https://carbondesignsystem.com/components/button/style/

## Current Local Consequences

- `secondaryEmphasis` should not include `ghost` as an ordinary secondary choice.
- `loadingState` should not be exposed as a normal selectable Button Contract option while the only alternative is spinner-only or label-replacement loading.
- `disabledTreatment` should not be exposed as a normal selectable Button Contract option until a materially different, evidence-backed disabled-state strategy exists.
- `dangerEmphasis` may include lower-emphasis variants, but destructive icon-only rendering is denied.
- `iconAdornment` should cover whether labeled buttons receive clarifying icons.
- `iconOnlyPolicy` should cover whether icon-only actions are allowed, and should constrain them to recognizable, space-limited actions with accessible names.

## Focus Anti-Patterns

### BAN-FOCUS-001: Do not hide focus indicators

Evidence level: `hard deny`

Decision:
Do not add Focus Policy options that remove, suppress, or make focus indicators subtle enough that keyboard users cannot reliably locate the active element.

Local interpretation:
Focus indicators must be clearly visible without reading as selected, destructive,
invalid, or visually dominant over the focused control. Preserve the control's
shape and box geometry: do not change border width or move adjacent content
when focus appears. Use semantic Focus tokens rather than primary, danger, or
error colors, and verify that the indicator remains perceivable on light, dark,
neutral, and coloured surfaces.

Evidence:
- WCAG says each item receiving keyboard focus needs a visible indicator.
- GOV.UK says focus states tell users which element is ready to be interacted with.
- NHS says focus state styles are used so users know which element they are on and can interact with.
- Atlassian describes focus rings as a clear indication of keyboard focus.
- Shopify accessibility guidance expects visible and consistent focus indicators on active elements.

Sources:
- https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- https://design-system.service.gov.uk/get-started/focus-states/
- https://service-manual.nhs.uk/design-system/styles/focus-state
- https://atlassian.design/components/focus-ring
- https://shopify.dev/docs/apps/build/accessibility

## State Visibility Anti-Patterns

### BAN-STATE-001: Do not make selected or active state depend on low-contrast color alone

Evidence level: `hard deny`

Decision:
Any selected, active, checked, focused, or current state shown in a UI Contract preview must be readable and visibly distinct.
Do not present an option as acceptable if the selected state uses a strong background but leaves foreground text, icons, or checkmarks with weak contrast.

Local interpretation:
When a preview uses a strong primary background, its foreground must be forced or verified to a high-contrast foreground.
When a selected row or choice surface is shown, use more than color when possible, such as a checkmark, border, selected row background, or explicit selected label.
This applies to tabs, segmented toggles, checkbox rows, selectable cards, listbox options, and any future selectable surface.

Evidence:
- WCAG contrast requirements apply to text and visual state indicators.
- Mature design systems describe selected, checked, active, and focus states as explicit states that must be perceivable.
- This project treats state visibility as a system-design requirement, not a local CSS detail.

Sources:
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- https://atlassian.design/foundations/accessibility
- https://m3.material.io/foundations/interaction/states

## Contract Vocabulary Anti-Patterns

### BAN-VOCAB-001: Do not use local or source-app terms as contract vocabulary

Evidence level: `hard deny`

Decision:
Do not expose project-specific names, source-application names, private metaphors, CSS class names, or component-library jargon as UI Contract option names or JSON values.
Contract vocabulary must be understandable as DESIGN.md-style guidance by another AI or product team without this repository's history.

Local interpretation:
Source applications may inspire an option, but their names belong in review notes or provenance records, not in the contract itself.
If a value cannot be explained with common design-system vocabulary or plain business UI language, classify it as `hold` until it is renamed, moved, or rejected.
Concrete color values and color roles are allowed because color is an explicit foundation; exact sizes, CSS selectors, and local component names are not.

Evidence:
- Mature design systems publish shared language for product teams, not repository-private implementation terms.
- UI Contract artifacts are intended to survive library changes and be readable by agents that only see the contract.

## Validation Anti-Patterns

### BAN-VALIDATION-001: Do not validate ordinary text fields on every keystroke by default

Evidence level: `hard deny`

Decision:
Do not add Validation Policy options that make while-typing validation the ordinary default for business forms. Prefer submit/step validation or validation after the user has finished editing the field.

Evidence:
- UK Parliament says to only display error messages after form submit or continuing to the next step, and not while users are typing because it can cause stress and frustration.
- GOV.UK error guidance shows validation errors next to the field and in an error summary.
- Shopify text field guidance separates required indicators from actual validation and uses explicit error properties for validation messages.

Sources:
- https://designsystem.parliament.uk/forms/text-input/
- https://design-system.service.gov.uk/components/error-message/
- https://shopify.dev/docs/api/app-home/web-components/forms/text-field

## Availability Anti-Patterns

### BAN-AVAILABILITY-001: Do not treat disabled as the default unavailable state

Evidence level: `hard deny`

Decision:
Do not make disabled controls the default for unavailable actions or fields. Prefer keeping recoverable actions enabled with clear feedback, using read-only for reviewable fixed values, and hiding only when a control is truly not applicable.

Evidence:
- Existing button guidance warns that disabled controls can confuse users and create accessibility issues.
- Carbon treats read-only as a distinct state for content users may review but not modify.
- Carbon text input and select guidance distinguish enabled, disabled, read-only, error, warning, and focus states.

Sources:
- https://primer.style/product/components/button/accessibility/
- https://carbondesignsystem.com/patterns/read-only-states-pattern/
- https://carbondesignsystem.com/components/text-input/usage/
- https://carbondesignsystem.com/components/select/usage/

## Select Anti-Patterns

### BAN-SELECT-001: Do not use a basic select for long or user-specific option lists

Evidence level: `context-limited`

Decision:
Basic select controls are acceptable for short, stable lists. For long, dynamic, or user-specific lists, use a filterable combobox pattern instead of forcing users to scan a long menu.

Evidence:
- Shopify says Select is for choosing one option and notes it is useful when there are 4 or more options to avoid clutter; it also provides Combobox for accessible autocomplete/filtering.
- Carbon distinguishes Select from Dropdown/Combo box patterns and documents filterable/list states for dropdown, combobox, and multiselect.
- Atlassian Select supports filtering examples, reflecting search/filter as a first-class select-family need.

Sources:
- https://polaris-react.shopify.com/components/selection-and-input/select
- https://polaris-react.shopify.com/components/selection-and-input/combobox
- https://carbondesignsystem.com/components/select/usage/
- https://carbondesignsystem.com/components/dropdown/usage/
- https://atlassian.design/components/select

## Maintenance Rule

When a future review uses new external evidence, update this file with:

- the anti-pattern or constraint,
- the evidence level,
- the affected contract area,
- official source URLs,
- whether the result is `hard deny`, `boundary deny`, or `context-limited`.
