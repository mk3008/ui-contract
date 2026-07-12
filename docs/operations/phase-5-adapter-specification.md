# Phase 5 Adapter specification and adoption brief

## Decision

Adopt a separate, product-team-owned **Adapter manifest** that maps one validated,
current UI Contract to one implementation target. The portable Contract remains the
statement of design intent. Framework props, component-library APIs, CSS, tokens,
file names, and product-private identifiers may appear only in Adapter-owned
artifacts referenced by the manifest.

The Adapter boundary begins only after `importContract` returns a `contract`. An
Adapter validator must not parse raw Contract JSON, repeat Contract validation,
repair an invalid selection, or add Contract vocabulary. Switching a framework,
UI library, or target version requires validating a different or revised Adapter;
it does not justify changing the Contract unless the product's design intent itself
changes.

This document is the Phase 5 operational specification and implementation brief.
The durable definitions of portable design-system vocabulary and option admission
remain in `docs/knowledge/design-system-foundations.md`,
`docs/knowledge/design-system-anti-patterns.md`, and
`docs/concepts/ui-contract-option-governance/concept.json`. Do not duplicate this
Adapter format in those files or in `AGENTS.md`.

## Issue and customer value

UI Contract 0.4.0 has explicit import and migration outcomes and deterministic JSON
and Markdown output, but the repository does not yet define how a product team proves
that a particular implementation target realizes every Contract rule. Without a
separate boundary, framework names and local mechanics can leak into Contract values,
or missing mappings can be mistaken for an invalid Contract.

This specification lets a team retain one portable design decision artifact while
changing implementation stacks, and gives humans and AI a reviewable record of
mapping coverage, target compatibility, and approved deviations.

## Existing boundary and authority

- `src/contract/import.ts` owns raw input acceptance and migration. Its successful
  outcomes are `valid`, `migrated`, and
  `accepted-with-ignored-unknown-fields`; `invalid` and `unsupported-version` do
  not provide an Adapter input.
- `src/contract/types.ts` owns the current `UiContract` identity, including
  `schemaVersion: "0.4.0"`.
- `src/contract/catalog.ts` owns persisted design-decision and invariant paths.
  `CatalogOptionAdapter` in that file is an editor option-metadata helper and is not
  the Phase 5 Adapter.
- `src/contract/output.ts` owns portable JSON and Markdown generation. Adapter
  output must not be merged into either generated Contract artifact.
- `src/contract/schema.ts` documents the current JSON shape, but the runtime importer
  is the acceptance gate. A future Adapter validator must not attempt to reconcile
  or replace those two Contract-validation mechanisms.

The historical strategic adoption plan at commit `9c80d97` proposed this boundary,
but it is not present in the current tree. This brief records the current Phase 5
decision; the historical file is context, not a runtime or version authority.

## Ownership

| Artifact or decision | Owner | Rule |
| --- | --- | --- |
| Portable Contract JSON/Markdown and vocabulary | UI Contract Editor | Contains design intent only. |
| Adapter manifest and referenced implementation bindings | Adopting product team | May contain target-specific and private implementation references. |
| Generic Adapter manifest validator | UI Contract Editor | Checks structure, identity, exact Contract coverage, and review metadata without knowing a framework. |
| Target capability checks | Adopting product repository | Proves referenced bindings exist and work for the named target/version. |
| Exception approval and final adoption | Named human product/design/engineering owners | Cannot be self-approved by an AI or inferred from a passing structural check. |

## Minimal Adapter manifest

The first format is `adapterSpecVersion: "0.1.0"`. It uses exact versions rather
than version ranges so compatibility remains deterministic. A manifest has this
logical shape; field names and enumerated values below are normative for the first
validation slice.

```ts
type AdapterManifest = {
  adapterSpecVersion: '0.1.0'
  adapterId: string
  adapterVersion: string
  target: { id: string; version: string }
  acceptsContractSchemaVersions: readonly ['0.4.0']
  mappings: Array<{
    rule:
      | {
          kind: 'decision'
          catalogId: string
          contractPath: string
          selectedValue: string
        }
      | {
          kind: 'invariant'
          catalogId: string
          contractPath: string
          statement: string
          persistedValue: string | null
        }
    resolution:
      | { kind: 'binding'; implementationRef: string }
      | { kind: 'satisfied-by-target'; evidenceRef: string }
      | { kind: 'exception'; exceptionId: string }
  }>
  exceptions: Array<{
    id: string
    catalogId: string
    kind: 'unsupported' | 'intentional-deviation'
    rationale: string
    impact: string
    owner: string
    review: {
      status: 'proposed' | 'approved' | 'rejected'
      reviewer?: string
      reviewedAt?: string
    }
  }>
}
```

`adapterId`, `adapterVersion`, target identifiers, `implementationRef`, and
`evidenceRef` are opaque, non-empty Adapter-owned strings. The generic validator
must not interpret them as CSS, module, token, or framework syntax. Concrete binding
payloads live at `implementationRef`; evidence such as a test, story, or source path
lives at `evidenceRef`. This indirection keeps the generic format target-neutral
without pretending that target-specific mappings are portable.

Every `contractCatalog` entry has exactly one deterministic rule identity:

- For `decision`, the identity tuple is
  `['decision', entry.id, entry.path, selectedValue]`, where `selectedValue` is
  resolved from the validated `UiContract`. The corresponding manifest fields are
  `kind`, `catalogId`, `contractPath`, and `selectedValue`.
- For `invariant`, the identity tuple is
  `['invariant', entry.id, entry.path, entry.note, persistedValue]`. The statement is
  the exact catalog `note`; `persistedValue` is the string resolved from the validated
  Contract when that path exists, otherwise `null`. The corresponding manifest fields
  are `kind`, `catalogId`, `contractPath`, `statement`, and `persistedValue`.

The tuple notation defines equality and duplicate detection; it is not another field
to persist. This makes `visible-focus` deterministic from catalog metadata with
`persistedValue: null`, while `loading-feedback` combines its catalog statement with
the persisted `communicate-busy-state` value. The validator must reject a decision
whose path has no selected string, but must not invent an invariant value when its
catalog path is absent from `UiContract`.

Every derived identity must have exactly one mapping. `meta`, `product`, and
`schemaVersion` identify and describe the Contract but are not implementation mapping
requirements. `binding` means explicit implementation configuration exists;
`satisfied-by-target` means the target already satisfies the rule and supplies
repository evidence; `exception` is the only allowed route for a known gap. A missing,
duplicate, stale-value, or unknown Contract path is not an exception and must not be
silently defaulted.

## Validation stages and outcomes

Validation is sequential. Diagnostics must carry a stage (`contract`, `adapter`, or
`target`) and a stable machine-readable code in addition to human-readable text.

1. **Contract gate:** call `importContract` on raw input. Preserve its outcome and
   diagnostics. `invalid` becomes `contract-invalid`; `unsupported-version` becomes
   `contract-unsupported-version`. Stop before Adapter validation. For the three
   successful outcomes, pass only the returned current `UiContract` forward.
2. **Adapter structure and coverage:** validate the manifest identity, exact supported
   versions, unique mappings/exceptions, catalog paths, current values, resolution
   shape, exception references, and review metadata. A malformed or incomplete
   manifest is `adapter-invalid`; it never makes the Contract invalid.
3. **Compatibility:** compare exact Contract, Adapter-spec, and supplied target
   versions, then classify the resolved mappings and exceptions.
4. **Target verification:** the adopting repository checks each opaque binding and
   evidence reference. The generic validator records target diagnostics but cannot
   claim that CSS, props, tokens, or runtime behavior are correct.

The Adapter compatibility outcomes are:

| Outcome | Meaning | Adoption allowed? |
| --- | --- | --- |
| `compatible` | Every catalog path is covered by a binding or target evidence; there are no exceptions. | After final human handoff review. |
| `compatible-with-approved-exceptions` | Coverage is complete and every referenced exception is human-approved. | Only with the exceptions visible in the handoff. |
| `review-required` | The manifest is structurally valid, but at least one exception is still proposed. | No. |
| `incompatible` | Coverage depends on an exception that a human rejected. | No; revise the Adapter or target and submit new evidence. |
| `unsupported-contract-version` | The validated Contract version is not in the Adapter's exact accepted list. | No; migrate the Contract through its owner, then revalidate. |
| `unsupported-adapter-spec-version` | The validator does not support the manifest format. | No; use a supported validator/manifest. |
| `unsupported-target-version` | The supplied target identity/version differs from the manifest. | No; revise or select an Adapter. |
| `adapter-invalid` | Identity, shape, coverage, value, reference, or exception integrity failed. | No; repair the Adapter, not the Contract. |

Target verification may additionally fail with `target-invalid`. That means a
referenced implementation binding or evidence is absent or does not prove the rule;
it remains outside Contract validity and must not be relabeled `adapter-invalid` if
the generic manifest itself is sound.

## Compatibility and migration policy

- Contract migration is owned exclusively by `importContract`. A migrated Contract
  must be saved/reviewed in its current form before adoption, and its migration
  diagnostics travel with the validation report. This is an adoption gate, not an
  Adapter compatibility outcome, because the pure Adapter validator receives only
  the returned current `UiContract`.
- Ignored unknown Contract fields require human acknowledgement because their removal
  may indicate misplaced implementation data. The Adapter must not recover those
  fields from raw input.
- Adapter `0.1.0` accepts only Contract `0.4.0`. Contract `0.3.0` and future Contract versions are
  unsupported until a reviewed Adapter-spec/validator change defines their coverage.
- There is no implicit Adapter migration, version range, wildcard Contract path, or
  fallback mapping in the first format. A future Adapter format migration must emit
  an observable diagnostic and re-run complete catalog coverage.
- Changing only target libraries, target versions, bindings, or target evidence
  changes the Adapter and its `adapterVersion`; it leaves the Contract unchanged.
  Changing portable visual or interaction intent follows Contract option governance.

## Exception and review rules

An exception documents failure to realize a Contract rule; it never replaces the
rule. Its `catalogId` must identify the same derived rule as the mapping that references
its `id`; it must explain user/implementation impact, name an owner, and be referenced
by exactly one mapping. Only a human may change
`review.status` to `approved`, and the reviewer and review time then become required.
AI may draft an exception and collect evidence but must leave it `proposed`.

Reject adoption when an exception is missing, orphaned, duplicated, points to a stale
Contract value, lacks impact/rationale/owner, or is unapproved. If a gap reveals that
the Contract term is ambiguous across competent implementations, stop Adapter work
and return the term to option governance; do not hide a vocabulary defect as a local
exception.

## AI and human handoff

The handoff packet must reference, rather than copy:

- the validated generated Contract JSON path and its `schemaVersion`;
- the generated Contract Markdown path when available;
- the Adapter manifest path, `adapterSpecVersion`, `adapterId`, and
  `adapterVersion`;
- the target identity/version;
- the Contract import outcome and diagnostics;
- the Adapter and target validation outcomes, diagnostics, and repository commands;
- every exception and its review state;
- unresolved target evidence and the named human approver.

An AI may choose no framework, approve no exception, and make no final conformance
claim. A human reviewer confirms that the referenced target evidence represents the
Contract's visible/interaction meaning and explicitly accepts or rejects exceptions.
Do not paste Contract rules or mappings into `AGENTS.md`; instructions should point to
the generated artifacts so they cannot drift independently.

## Scope in

- Define the target-neutral manifest identity, mapping coverage, exception record,
  staged outcomes, version compatibility, ownership, and handoff gates.
- Define a future pure validator and repository-verifiable fixtures/tests.
- Preserve the current Contract 0.4.0 importer, catalog, schema, and outputs as inputs.

## Scope out

- No framework/UI-library Adapter, example target, CSS, token, prop, component, or
  product-private mapping.
- No mapping executor, code generator, runtime integration, package publication, or
  target introspection.
- No Contract option, catalog, schema, import, output, UI, localization, or default
  change.
- No promise that generic structural validation proves visual or runtime conformance.
- No commit, push, pull request, deployment, or release in this design phase.

## Acceptance criteria and verification plan

| Acceptance criterion | Verification method |
| --- | --- |
| A worker can distinguish invalid raw Contract input from an invalid Adapter. | Inspect the sequential gates and outcome tables against `ImportResult`; fixtures in the next slice assert that Adapter validation is not called for Contract `invalid`/`unsupported-version`. |
| Framework switching changes Adapter identity/mappings, not Contract vocabulary. | Review ownership, migration policy, and scope against foundations, anti-pattern `BAN-VOCAB-001`, and option-governance invariants. |
| Every catalog decision and invariant is accounted for without framework knowledge. | Next-slice tests derive the normative decision/invariant tuples and assert exactly one mapping for each, including catalog-only and persisted invariants. |
| Exceptions cannot silently normalize or bypass a Contract rule. | Next-slice fixtures cover missing, orphaned, duplicate, stale, proposed, rejected, and approved exceptions. |
| Version and compatibility outcomes are deterministic. | Next-slice table tests cover exact Contract/Adapter-spec/target versions and every Adapter outcome. |
| AI and human authority are explicit and reviewable. | Document inspection plus fixtures that require reviewer/time for approved exceptions; final target conformance remains human evidence. |
| This phase changes no product/schema/UI behavior and adds no whitespace errors. | Inspect changed paths and run `git diff --check`. |

Repository evidence can prove manifest structure, coverage, deterministic outcome
classification, and recorded review metadata. It cannot prove that an opaque binding
produces the intended visual treatment; target tests and human review are required
supplementary evidence for that claim.

## Concrete next implementation slice

Implement only a target-neutral, pure Adapter manifest validator:

1. Add `src/adapter/types.ts` for the normative manifest and outcome types and
   `src/adapter/validate.ts` for
   `validateAdapter(contract: UiContract, manifest: unknown, target: { id: string; version: string }): AdapterValidationResult`.
2. Derive the exact rule identities above for every `contractCatalog` entry. Decisions
   require their selected Contract string. Invariants use the exact catalog note and
   use a persisted Contract string when present or `null` when absent. Do not accept
   raw Contract input, mutate the Contract/manifest, resolve implementation
   references, or import framework packages.
3. Add focused fixtures and `src/adapter/adapter.test.ts` for one synthetic
   target-neutral complete manifest plus each invalid, compatibility, and exception
   case in the acceptance table. Assert that `visible-focus` derives an invariant
   identity from its catalog note with `persistedValue: null`; assert separately that
   `loading-feedback` derives its catalog note and persisted
   `communicate-busy-state` value. Synthetic opaque references must not resemble a
   real framework API.
4. Run the focused Adapter tests, the existing Contract tests, `npm run build`, and
   `git diff --check`. Confirm changed paths are limited to the Adapter module and its
   tests/fixtures; UI wiring and target bindings remain a separate reviewed slice.

This slice is independently reviewable because it introduces only deterministic data
validation around the existing `UiContract` and catalog. Adding an Adapter JSON Schema
or schema-evaluator dependency is deferred until the runtime validator exists and a
review can prevent schema/runtime divergence.

## Risks, open questions, and stop conditions

- **Risk — false conformance:** a structurally valid opaque reference may not implement
  the rule. Mitigation: keep `target-invalid` and human evidence separate from generic
  compatibility.
- **Risk — duplicated Contract validation:** a second validator may disagree with
  `importContract`. Mitigation: accept only its returned `UiContract`; do not validate
  raw Contract JSON in Adapter code.
- **Risk — coverage drift:** new catalog entries could escape existing Adapters.
  Mitigation: derive one identity for every `contractCatalog` entry. Non-persisted
  invariants use the exact catalog statement plus `persistedValue: null`; the Adapter
  validator does not fabricate a Contract value.
- **Risk — exception normalization:** teams may use exceptions as permanent hidden
  overrides. Mitigation: require explicit impact, owner, human approval, and visible
  handoff reporting.
- **Open question (non-blocking):** a future adoption repository may require exception
  expiry or approval roles. Do not add them to `0.1.0` without evidence from an actual
  adoption workflow.

Stop and return to Contract governance if an Adapter gap can only be solved by adding
framework/private vocabulary to the Contract, or if the Contract term does not predict
one portable design meaning. Stop the validator slice if it requires a real framework,
binding execution, UI changes, Contract validation changes, implicit fallback, or a
new schema dependency. Stop adoption when any required target evidence or human review
is absent.

## Worker report v1

```yaml
report_version: 1
task_id: phase-5-adapter-specification
attempt: 2
worker_thread_id: 019f5015-f81b-7741-a497-ca86fcaa8e15
parent_thread_id: 019f48d2-8c24-72e3-b952-a21ea8aa1f4a
status: ready_for_review
base_commit: 8145cf5e1d43f51baf57624cbac6c770ab03eb75
changed_paths:
  - docs/operations/phase-5-adapter-specification.md
acceptance:
  - criterion: Contract-invalid and Adapter-invalid outcomes are distinguishable.
    status: done
    evidence: Sequential validation gates and compatibility outcome table in this brief.
  - criterion: Framework switching is an Adapter concern.
    status: done
    evidence: Decision, ownership, compatibility policy, and scope in this brief.
  - criterion: Ownership, compatibility, exceptions, and human review are explicit.
    status: done
    evidence: Normative decision/invariant identities, manifest shape, ownership table, exception rules, and handoff section.
  - criterion: No product code, schema, or UI behavior changes are made.
    status: done
    evidence: git status --short, git diff --check, and the untracked-file diff check.
verification:
  - Repository sources and tests inspected at base commit 8145cf5.
  - git diff --check
  - git diff --no-index --check -- NUL docs/operations/phase-5-adapter-specification.md (exit 1 is expected for a new file; no whitespace diagnostic)
knowledge_candidates:
  durable_decisions:
    - Keep target-specific bindings and exceptions outside the portable Contract.
    - Validate raw Contract input before, and separately from, Adapter compatibility.
  operational_rules: []
  task_evidence:
    - This Phase 5 implementation brief and its acceptance/evidence map.
  transient_notes:
    - Historical strategy plan exists at commit 9c80d97 but not in the current tree.
human_review:
  - Approve or correct the normative Adapter 0.1.0 manifest and outcome taxonomy.
  - Decide whether to authorize the target-neutral validator slice.
blocker: null
recommended_next: parent_review
```
