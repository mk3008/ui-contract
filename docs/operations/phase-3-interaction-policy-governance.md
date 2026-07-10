# Phase 3 interaction-policy governance

## Inventory and ownership

`interactionPolicy.focus`, `validation`, and `availability` were already persisted decisions. `interactionPolicy.confirmation` already owned destructive-action confirmation, but its former `destructive-bulk-unsaved` scope mixed destructive work with an unsaved-changes navigation/workflow guard. Phase 3 replaces it with `destructive-and-bulk`; unsaved-change handling remains application or screen-flow owned.

Phase 2 assigned loading and empty/error feedback to Interaction Policy but did not persist the rules. Phase 3 adds two fixed cross-cutting invariants:

- `interactionPolicy.loading.feedback: "communicate-busy-state"`
- `interactionPolicy.stateFeedback.guidance: "explain-condition-and-next-step"`

They are intentionally not selectable. The application decides what data loads, whether a recovery action exists, and which action is destructive. Components decide only their visible treatment; screen patterns decide only their structure. These invariants govern the shared presentation of the resulting states.

## Compatibility

Phase 3 is published as schema version `0.2.0`; `0.1.0` remains the prior supported shape. Importing a valid `0.1.0` contract migrates the two absent fixed invariants and translates `confirmation.scope: "destructive-bulk-unsaved"` to `"destructive-and-bulk"`. The import result is `migrated` and explicitly says that unsaved-change navigation is now screen/application-flow owned. A `0.0.0` document follows its existing migration to `0.1.0` and then this same visible Phase 3 migration. A `0.2.0` document using the old scope is invalid rather than silently normalized.

## Evidence checked

- Carbon’s [loading pattern](https://carbondesignsystem.com/patterns/loading-pattern/) distinguishes skeletons for structured/data content from inline indicators for a single processing action, and requires feedback that a screen is not frozen.
- Carbon’s [empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/) requires contextual explanation, differentiates no-data/user-action/error-management states, and calls for a useful next step when one exists.
- W3C [WAI-ARIA](https://www.w3.org/TR/wai-aria/) documents `aria-busy` for an updating region; WCAG’s [status-message understanding](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html) includes busy and error feedback as programmatically determinable status information.
- The local anti-pattern knowledge was checked before research. Its validation and availability constraints remain unchanged.

## Translation and boundary review

The invariant names and literal values are plain, portable DESIGN.md rules. A frontend implementer can produce the previewed region-busy, empty-guidance, and error-recovery treatments without framework-specific props or local terminology. The preview deliberately demonstrates state feedback only; it does not choose data, permissions, retry behavior, filters, actions, or a workflow.

Remaining uncertainty: exact copy, recovery action, loading duration, and whether a particular action is reversible are case-owned and intentionally absent from this Contract.
