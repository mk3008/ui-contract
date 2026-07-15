# Core and Pattern Artifact Separation Plan

## Goal

Implement the artifact model in
[UI Contract Artifact Model](../architecture/ui-contract-artifact-model.md) without
losing the two existing `0.6.0` declarations or weakening current acceptance proof.
Every phase is independently reviewable and reversible before the next phase begins.

## Global constraints

- Preserve the existing Core import/migration behavior until the phase that replaces
  it has passed its compatibility tests.
- Do not add Pattern-to-Core overrides.
- Do not put application data, fixture values, screenshots, framework APIs, or CSS
  into portable artifacts.
- Treat any unresolvable Core/Pattern conflict as a validation error or human review
  gate, never as renderer precedence.

## Phase 1 — Define artifact types and schemas

**Purpose:** add typed, versioned JSON schemas for Screen Pattern, Composition
Pattern, Interaction Scenario, and Bundle Manifest without changing Core behavior.

| Item | Decision |
| --- | --- |
| Change scope | New artifact types, schemas, validators, fixtures, and focused tests. |
| Non-goals | No Core field removal, export UI, renderer migration, or Adapter change. |
| Input / output | Artifact JSON -> validated typed artifact or structured diagnostics. |
| Schema / version | New Pattern/Scenario/Bundle `0.1.0`; Core remains `0.6.0`. |
| Migration | None. |
| Automated acceptance | Valid/minimal/unknown-field/ID-version-digest/dependency-cycle fixtures pass. |
| Human check | Confirm field names are portable and no Core rule is duplicated. |
| Rollback | Remove unused new modules and schemas. |
| Dependency | None. |

## Phase 2 — Remove `screenPatternPolicy` from Core

**Purpose:** release Core `0.7.0` with only Foundation, Component, Interaction
Policy, and invariants.

| Item | Decision |
| --- | --- |
| Change scope | Core type/default/schema/catalog/output/import/migration and contract tests. |
| Non-goals | Pattern content, renderer, Bundle export UI, or Adapter implementation. |
| Input / output | `0.6.0` Core -> `0.7.0` Core plus migration Bundle intent; `0.7.0` Core contains no pattern field. |
| Schema / version | Core `0.7.0`; legacy `0.6.0` remains accepted through migration. |
| Migration | Preserve `searchList` and `formSection` as explicit generated Bundle selections. |
| Automated acceptance | No `screenPatternPolicy` in `0.7.0`; every accepted `0.6.0` input retains both declarations in the migration result. |
| Human check | Confirm Core-only import warning and deprecation wording. |
| Rollback | Keep `0.6.0` importer/export compatibility behind the prior release branch; do not publish `0.7.0` until migration tests pass. |
| Dependency | Phase 1. |

## Phase 3 — Add Bundle Manifest

**Purpose:** make selection, identity, path, version, and digest resolution explicit.

| Item | Decision |
| --- | --- |
| Change scope | Bundle resolver, manifest JSON/Markdown output, importer, fixtures, and tests. |
| Non-goals | Single-file Bundle, screenshot packaging, Pattern renderer change. |
| Input / output | Core plus artifact directory -> resolved Bundle or dependency/conflict diagnostics. |
| Schema / version | Bundle `0.1.0`; references retain path, ID, version, digest. |
| Migration | Phase 2 migration emits a valid Bundle Manifest. Empty arrays are allowed for a Core-only Bundle. |
| Automated acceptance | Missing/stale/digest-mismatched/cyclic/conflicting dependency fixtures fail deterministically. |
| Human check | Confirm directory layout is usable for export/import consumers. |
| Rollback | Continue exporting standalone Core JSON/Markdown alongside the new Bundle output. |
| Dependency | Phases 1–2. |

## Phase 4 — Move Search/List to the first Screen Pattern

**Purpose:** create `search-list@0.1.0` as the first independent complete task
artifact.

| Item | Decision |
| --- | --- |
| Change scope | Pattern artifact, required states/regions/dependencies, renderer input, acceptance traceability, tests. |
| Non-goals | New search variants, application-specific filters/columns, or Core policy overrides. |
| Input / output | Resolved Bundle with `search-list` -> Search/List structure and declared extension points. |
| Schema / version | Pattern `0.1.0`; no Core version change. |
| Migration | Map legacy `standard-search-list` to this artifact. |
| Automated acceptance | Apply/reset, count, sorting, paging, explicit selection, stable batch region, loading/empty/error states, and ARIA/keyboard proof remain covered. |
| Human check | Review the complete operational page and concise copy. |
| Rollback | Retain legacy acceptance route until the Pattern route has equivalent evidence. |
| Dependency | Phases 1–3. |

## Phase 5 — Move Form Section to a Composition Pattern

**Purpose:** extract `form-section@0.1.0` as a reusable region, not a full screen.

| Item | Decision |
| --- | --- |
| Change scope | Composition artifact, required group/action regions, edit-detail dependency declaration, tests. |
| Non-goals | New form layouts, field definitions, or validation-policy changes. |
| Input / output | Selected `form-section` -> region contract with application-supplied fields. |
| Schema / version | Composition Pattern `0.1.0`; no Core version change. |
| Migration | Map legacy `grouped-form-section` to this artifact selection. |
| Automated acceptance | Group label, reading order, action separation, validation and focus behavior remain proven. |
| Human check | Confirm the boundary is regional rather than task-complete. |
| Rollback | Retain old evidence mapping until Edit Detail resolves the composition artifact. |
| Dependency | Phases 1–3. |

## Phase 6 — Move Edit Detail to the second Screen Pattern

**Purpose:** make `edit-detail@0.1.0` a complete task that depends on
`form-section`.

| Item | Decision |
| --- | --- |
| Change scope | Pattern artifact, dependency resolver use, extension points, renderer/evidence wiring, tests. |
| Non-goals | Edit List or Read-only Detail migration, new form semantics, or scenario overrides. |
| Input / output | Resolved Core + `edit-detail` + `form-section` -> editable task structure. |
| Schema / version | Pattern `0.1.0`; no Core version change. |
| Migration | No extra legacy Core value; preserve the former evidence relationship explicitly. |
| Automated acceptance | Required identity, grouped fields, save/cancel, validation, and outcome focus proof pass. |
| Human check | Confirm task realism and field/action scanability. |
| Rollback | Preserve the existing edit-detail fixture route until equivalent evidence is accepted. |
| Dependency | Phase 5. |

## Phase 7 — Connect Acceptance Evidence to Pattern artifacts

**Purpose:** replace the current all-in-one example list with evidence that resolves
Bundle and artifact identities without redefining semantics.

| Item | Decision |
| --- | --- |
| Change scope | Evidence schema/generator, routes, digest traceability, DOM/ARIA/keyboard assertions, screenshot metadata. |
| Non-goals | Evidence binaries inside Bundles or relaxed human realism gate. |
| Input / output | Resolved Bundle + deterministic fixture -> separate evidence record and generated images. |
| Schema / version | Evidence reference model `0.1.0`; retain legacy evidence reader during transition. |
| Migration | Map old example IDs to their Pattern or Scenario evidence roles; no screenshots are migrated as design data. |
| Automated acceptance | Every evidence record names Core/Pattern versions/digests, states, routes, viewport, browser, and primary DOM/ARIA/keyboard proof. |
| Human check | Perform realism review on generated full-page artifacts. |
| Rollback | Keep old evidence generator until new records reproduce all required states. |
| Dependency | Phases 3–6. |

## Phase 8 — Separate Core Adapter and Pattern adoption

**Purpose:** stop requiring products to map Patterns they did not adopt.

| Item | Decision |
| --- | --- |
| Change scope | Adapter spec/types/validator/tests and a separate Pattern Adoption Evidence format. |
| Non-goals | Framework binding execution, target introspection, or automatic exception approval. |
| Input / output | Core Contract -> Core Adapter coverage; selected Bundle artifacts -> Pattern adoption evidence. |
| Schema / version | New Adapter spec version only if the existing `0.1.0` cannot express Core-only coverage safely. |
| Migration | Existing `0.1.0` manifests are either migrated with diagnostics or remain valid only for `0.6.0` until retirement. |
| Automated acceptance | Core-only product has no Pattern mapping requirement; selected Pattern proof is complete and target references stay opaque. |
| Human check | Approve exception/adoption review roles and target evidence. |
| Rollback | Preserve old validator path for supported legacy Contracts. |
| Dependency | Phases 2–7. |

## Phase 9 — Add AI Context Pack

**Purpose:** provide a minimal resolved rule set for a requested task.

| Item | Decision |
| --- | --- |
| Change scope | Context-pack resolver, output type, dependency inclusion, tests, and documentation. |
| Non-goals | Prompt templates, acceptance screenshots, repository history export, or implementation generator. |
| Input / output | Resolved Bundle + requested Pattern IDs + dependency flag -> selected Core rules/artifacts/mappings/exceptions. |
| Schema / version | Context Pack output `0.1.0`; no Contract schema change. |
| Migration | None. |
| Automated acceptance | Excludes unrelated artifacts/fixtures/evidence, includes required dependencies and unresolved exceptions. |
| Human check | Confirm the pack is sufficient for a designer/implementer without being a full repository dump. |
| Rollback | Keep Bundle artifacts usable without Context Pack generation. |
| Dependency | Phases 3, 6, and 8. |

## Phase 10 — Complete legacy migration and compatibility decision

**Purpose:** decide whether the maintained `0.6.0` compatibility window can end.

| Item | Decision |
| --- | --- |
| Change scope | Migration telemetry/review record, fixtures, documentation, release decision. |
| Non-goals | Silent legacy removal or unreviewed semantic conversion. |
| Input / output | Supported legacy documents/manifests -> compatibility decision and final migration report. |
| Schema / version | No new version unless the human release decision approves removal. |
| Migration | Validate no information loss from `screenPatternPolicy` split and all maintained adapters/evidence use the new model. |
| Automated acceptance | Migration fixture matrix and compatibility reports pass; no `0.6.0` path silently discards selected artifacts. |
| Human check | Approve end-of-support date, Core-only import UX, and any maintained consumer exception. |
| Rollback | Retain the compatibility importer if any maintained consumer is not migrated. |
| Dependency | Phases 1–9. |

## Phase gate summary

No phase may advance when it requires a Pattern to override Core, when a stable rule
ID cannot be resolved, when `form-section` must become a full task to work, when
`destructive-action` proves to require an independent page taxonomy, when a legacy
`0.6.0` migration drops either declaration, or when an Adapter identity cannot remain
target-neutral. These are human decision gates, not implementation shortcuts.
