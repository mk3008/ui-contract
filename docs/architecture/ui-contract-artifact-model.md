# UI Contract Artifact Model

## Status and purpose

This document is the normative architecture for portable UI Contract artifacts.
It separates reusable Core design intent from task structures, their reusable
substructures, interaction scenarios, adoption selection, and acceptance proof.
It does not change the current `0.6.0` runtime model. The implementation sequence
is defined in [the separation plan](../operations/core-pattern-artifact-separation-plan.md).

The current model contains two persisted `screenPatternPolicy` decisions in the
Core Contract while the acceptance surface also has five rendered example IDs. That
mixes a portable Core artifact with task structures, evidence fixtures, and examples
that are not all at the same granularity. The split makes a consumer load only the
rules needed for its task and prevents evidence from being mistaken for Contract
meaning.

## Terms

| Term | Meaning |
| --- | --- |
| Core UI Contract | Portable, cross-screen design decisions and fixed invariants. |
| Screen Pattern | A repeatable, complete operational task or screen structure that composes Core rules. |
| Composition Pattern | A reusable region structure inside one or more Screen Patterns. |
| Interaction Scenario | A cross-screen user interaction that can be composed into a Screen Pattern. |
| Bundle Manifest | Selection and integrity record for one Core Contract and its adopted artifacts. |
| Application Screen | Product-owned realization of a Pattern with business data and behavior. |
| Acceptance Evidence | Generated proof that a Pattern composes correctly; it is not a design artifact. |
| Adapter Manifest | Target-owned mapping of portable rules to a concrete implementation target. |

`pattern` below means a Screen Pattern unless it is explicitly qualified as a
Composition Pattern. A scenario is not a Screen Pattern merely because it can have
its own acceptance route.

## Ownership and non-ownership

| Artifact | Owns | Does not own | Version unit | Validation responsibility |
| --- | --- | --- | --- | --- |
| Core UI Contract | Foundation, Component Policy, Interaction Policy, fixed invariants, semantic color, focus, validation, availability, confirmation, loading, state guidance, structural consistency | Task regions, required task states, fields, columns, fixtures, screen composition order, evidence | `schemaVersion` | Core schema/import validation and Core Adapter coverage |
| Screen Pattern | One complete task structure; purpose, applies-when, required states, regions, Core requirements, dependencies, composition rules, extension points | Core values, CSS/framework details, record data, screenshots, acceptance result | `patternSchemaVersion` + `patternVersion` | Pattern schema and dependency/conflict validation |
| Composition Pattern | Reusable region structure such as a grouped form section | A complete task, Core values, application fields, scenario outcome | `patternSchemaVersion` + `patternVersion` | Composition schema and dependency validation |
| Interaction Scenario | Cross-screen operation such as destructive action, its required context, result/recovery states, and scenario dependencies | A page shell, product business decision, Core override | `scenarioSchemaVersion` + `scenarioVersion` | Scenario schema and composition validation |
| Bundle Manifest | Which artifacts are selected together, their paths, IDs, versions, and digests | Duplicated Pattern semantics or Core rules | `bundleSpecVersion` | Bundle resolution, identity, digest, and selected-dependency validation |
| Application Screen | Product fields, data, permissions, API, business flow, local wording, navigation, and extension-point values | Portable Pattern or Core meaning | Product-owned | Product tests and product review |
| Acceptance Evidence | Fixture/version, route, state, browser, viewport, Contract digest, artifact identities, DOM/ARIA/keyboard assertions, screenshots, human review | Core/Pattern semantics, application behavior, binding mappings | `evidenceSpecVersion` | Deterministic capture and evidence integrity checks |
| Adapter Manifest | Target-specific mapping references, target identity, exceptions, and review metadata | Portable Core/Pattern vocabulary or screenshot evidence | `adapterSpecVersion` + `adapterVersion` | Existing generic Adapter validator; target repository validates bindings |

## Core Contract boundary

The Core UI Contract is intentionally screen-agnostic. It owns reusable design
decisions and invariants that a competent implementer can apply across screens.
It contains no `screenPatternPolicy` in the target model. In particular, it does
not prescribe:

- a search-condition panel or result-table region;
- a required state list for a particular task;
- specific filters, columns, fields, records, or action captions;
- a Pattern's composition order or its fixture;
- framework APIs, CSS classes, or acceptance outcomes.

This preserves the existing Foundation / Component / Interaction Policy boundary.
A Pattern can require that a Core rule be present, but cannot copy or override its
value. Core invariants always take precedence.

## Pattern classification

The initial classification is as follows. It is based on current source,
`contractCatalog`, acceptance evidence, and rendered artifact routes; it is not a
claim that every current example is already an exported Pattern artifact.

| Current item | Current owner | Proposed artifact | Reason | Migration impact |
| --- | --- | --- | --- | --- |
| `search-list` | Core `screenPatternPolicy.searchList`, example ID, evidence | Screen Pattern `search-list` | It is a complete search-and-results task with its own required states. | Move the fixed Core decision to a selected Screen Pattern in the Bundle. |
| `edit-detail` | example ID and evidence; composes `formSection` | Screen Pattern `edit-detail` | It is a complete edit task with identity, validation, save, and cancel. | New Pattern artifact; no current Core decision is moved directly. |
| `edit-list` | example ID and evidence | Screen Pattern `edit-list` | It preserves list context while editing and is task-complete. | New Pattern artifact; document current composition coverage separately. |
| `read-only-detail` | example ID and evidence | Screen Pattern `read-only-detail` | It is a scan/read/recovery task, distinct from editing. | New Pattern artifact; no Core policy is copied. |
| `destructive-action` | example ID; composes confirmation policy | Interaction Scenario `destructive-action` | The current implementation requires originating context, confirmation, result, and recovery and can be composed into list or detail tasks. It is not an independent page taxonomy. | Reclassify the example as scenario evidence; keep `interactionPolicy.confirmation` in Core. |
| `form-section` | Core `screenPatternPolicy.formSection`, example composition | Composition Pattern `form-section` | It is a reusable related-field region and action separation, not a complete task. | Move the fixed Core decision to a selected Composition Pattern in the Bundle. |

`destructive-action` has no evidence of being a reusable independent application
screen: its current rendered route is an acceptance fixture around record context
and a dialog flow. Therefore it is an Interaction Scenario. A future standalone
decommission workflow would need its own Screen Pattern and an explicit review.

### Current implementation correspondence

| Current concept | Current representation | Target ownership after the split |
| --- | --- | --- |
| `screenPatternPolicy` | `UiContract`, schema, default, catalog, import, and JSON/Markdown output contain `searchList` and `formSection`. | Removed from Core `0.7.0`; preserved as Bundle selections during migration. |
| Screen Pattern example ID | `screenPatternExampleIds` lists `search-list`, `edit-detail`, `edit-list`, `read-only-detail`, and `destructive-action`. | Screen IDs become artifact IDs except `destructive-action`, which becomes a Scenario ID. |
| Acceptance evidence example | `generateScreenPatternEvidence` emits each example, fixture, composed paths, states, and artifact routes. | Evidence refers to resolved Bundle/artifact IDs, versions, and digests. |
| Rendered page artifact | `/?screen-artifact=<example>` renders a fixture-backed acceptance page. | Renderer consumes a resolved artifact plus application/fixture extension values; it does not define the artifact. |
| Catalog entry | `search-list-pattern` and `form-section-pattern` are persisted Core decisions. | Stable rule IDs remain references during migration; Pattern structure moves out of the Core catalog. |
| Adapter mapping | The current Adapter derives one required mapping for every catalog entry. | Core Adapter maps Core-only entries; Pattern Adoption Evidence proves selected Pattern realization separately. |
| Fixture | `screen-pattern-fixtures-v1` and deterministic account/form data are embedded in evidence generation and render components. | Generated acceptance input only; never portable Pattern content. |
| Human realism review | Acceptance Contract and realism review inspect complete rendered artifacts. | Continues as an Evidence gate; never becomes a Bundle, Pattern, or Core field. |

## References and composition

References are directional and acyclic:

```text
Bundle Manifest -> Core UI Contract
Bundle Manifest -> Screen / Composition / Scenario artifacts
Screen Pattern -> required Core rule IDs
Screen Pattern -> Composition Pattern and Scenario IDs
Application Screen -> selected Bundle artifacts and extension points
Acceptance Evidence -> resolved Bundle + artifact identities and digests
Core Adapter -> Core Contract only
Pattern adoption evidence -> selected Pattern/Scenario implementation proof
```

### Core precedence

1. Core invariants cannot be overridden.
2. A Pattern adds task-structural constraints; it does not redefine a Core rule.
3. Initial versions provide no Pattern-to-Core override mechanism.
4. A need to vary a Core value is an Adapter exception review or Contract
   governance question, not a Pattern field.

### Dependencies, conflict, and extension points

- A Pattern declares the Composition Patterns and Interaction Scenarios that it
  uses. Semantic dependencies belong to the Pattern; the Bundle only selects and
  resolves those dependencies.
- A resolver must reject a missing selected dependency, an ID/version/digest
  mismatch, a dependency cycle, or two selected artifacts that require
  incompatible structures for the same declared region. It must not silently pick
  one renderer or precedence order.
- Application Screens supply only declared extension-point values: fields, columns,
  filters, permissions, data, business actions, and routes. These values cannot
  alter the Pattern's required regions or the Core's semantics.

## Artifact shapes and file layout

The canonical interchange unit is a directory Bundle, not a single JSON file.
Markdown is a human-readable rendering of the equivalent JSON artifact.

```text
export/
├─ manifest.json
├─ contract.json
├─ contract.md
├─ screen-patterns/
│  ├─ search-list/{pattern.json,pattern.md}
│  ├─ edit-detail/{pattern.json,pattern.md}
│  ├─ edit-list/{pattern.json,pattern.md}
│  └─ read-only-detail/{pattern.json,pattern.md}
├─ composition-patterns/
│  └─ form-section/{pattern.json,pattern.md}
└─ interaction-scenarios/
   └─ destructive-action/{scenario.json,scenario.md}
```

Acceptance images and their generated evidence manifest live in a separate,
generated evidence location. A Bundle Manifest may reference an evidence record,
but it does not package PNG/JPEG binaries by default. A future single-file export is
out of scope until a consumer need defines its size, portability, and integrity
semantics.

### Bundle Manifest

The initial Bundle Manifest is `bundleSpecVersion: "0.1.0"`. It contains a Core
contract reference and arrays for selected Screen Patterns, Composition Patterns,
and Interaction Scenarios. Each reference retains `id`, `path`, artifact version,
and a content digest. `path` resolves the file; ID/version identify the expected
artifact; digest detects a stale or substituted file. Keeping all four is
intentional, not duplicate business meaning.

```json
{
  "bundleSpecVersion": "0.1.0",
  "contract": {
    "path": "contract.json",
    "schemaVersion": "0.7.0",
    "digest": "sha256:<core>"
  },
  "screenPatterns": [
    {
      "id": "search-list",
      "path": "screen-patterns/search-list/pattern.json",
      "patternVersion": "0.1.0",
      "digest": "sha256:<pattern>"
    }
  ],
  "compositionPatterns": [
    {
      "id": "form-section",
      "path": "composition-patterns/form-section/pattern.json",
      "patternVersion": "0.1.0",
      "digest": "sha256:<composition>"
    }
  ],
  "interactionScenarios": [
    {
      "id": "destructive-action",
      "path": "interaction-scenarios/destructive-action/scenario.json",
      "scenarioVersion": "0.1.0",
      "digest": "sha256:<scenario>"
    }
  ]
}
```

An initial Bundle may select no Patterns. This permits Core-only consumers, but it
cannot claim application-screen or Pattern acceptance coverage. A Pattern that needs
another artifact requires that dependency to be selected in the same Bundle.

Pattern artifacts minimally contain:

```text
patternSchemaVersion
id
patternVersion
title
purpose
appliesWhen
nonGoals
requires
composes
regions
requiredStates
compositionRules
extensionPoints
```

`requires` uses stable Catalog rule IDs plus the expected Core schema version or
minimum compatible Core contract version policy. Stable rule IDs are the primary
reference, not raw JSON paths. A resolver may retain a diagnostic path for humans,
but a moved path without a stable rule ID is a migration risk and must not be the
sole dependency key.

Pattern artifacts contain neither Core colors or component values, nor CSS classes,
React components, framework APIs, real records, fixture data, screenshots, or an
acceptance verdict.

## Version and migration policy

| Item | Initial target version | Version rule |
| --- | --- | --- |
| Core UI Contract after the split | `0.7.0` | Breaking removal of `screenPatternPolicy`; current `0.6.0` remains importable only through an explicit migration path. |
| Pattern / Composition Pattern schema | `0.1.0` | New artifact schemas; evolve independently from Core values. |
| Interaction Scenario schema | `0.1.0` | New artifact schema, independently versioned. |
| Bundle Manifest | `0.1.0` | Resolves selected artifact identities and digests; changes only for manifest semantics. |
| Acceptance Evidence | new `0.1.0` reference model | Replaces its current all-in-one `2.0.0` evidence shape only after Pattern artifacts exist. |

The `0.6.0` values are each one fixed choice, so migration can preserve declared
intent without loss:

```text
screenPatternPolicy.searchList  -> manifest.screenPatterns += search-list@0.1.0
screenPatternPolicy.formSection -> manifest.compositionPatterns += form-section@0.1.0
```

The `0.6.0` importer must produce both a `0.7.0` Core Contract and an explicit
generated migration Bundle. It must not silently discard the two decisions. A
Core-only import is allowed only when the caller explicitly selects Core-only mode;
the result carries a warning that Pattern declarations and Pattern evidence are not
included. The migration report names each generated artifact reference.

Legacy Core import remains accepted through the documented migration window until
the Bundle importer and export UI have been released for at least one stable
Contract minor version and all maintained fixtures/Adapter manifests support `0.7.0`.
The removal date is a later human release decision; this architecture does not set a
calendar date.

## Adapter and evidence boundaries

The current Adapter validator derives one mapping for every `contractCatalog`
entry, including the two Screen Pattern entries. In the target model, the Core
Adapter maps only Core Catalog entries. A product that does not adopt any Pattern
must not be asked to map Pattern rules.

Pattern adoption needs a separate, target-owned Pattern Adoption Evidence record.
It identifies the resolved Bundle, selected Pattern/Scenario version and digest,
implementation or test evidence references, known exceptions, and human review.
It does not extend the existing Core Adapter's opaque binding vocabulary. This keeps
portable structure selection distinct from framework mapping and lets a Core-only
product pass Core Adapter validation without fictional Pattern coverage.

Acceptance Evidence is similarly a generated proof record: it references the
resolved Bundle, Core digest, Pattern IDs/versions/digests, fixture version, states,
routes, viewport, browser, DOM/ARIA/keyboard assertions, and screenshots. It never
defines Pattern semantics. Human realism review remains a gate over the generated
artifact, not an exported field.

## AI Context Pack

Future `generateContextPack({ patterns, includeDependencies })` resolves a Bundle
and returns only:

- applicable Core rules identified by stable Catalog IDs;
- the requested Screen Pattern artifacts;
- required Composition Patterns and Interaction Scenarios when enabled;
- required Adapter mapping or Pattern-adoption evidence references;
- unresolved approved/proposed exceptions.

It excludes unrelated Patterns, acceptance screenshots, complete fixtures,
repository review history, and unrelated Core documentation. The generator is not
part of this architecture phase. Its inputs must include a resolved Bundle identity,
requested Pattern IDs, dependency flag, and optional target identity; its output must
carry resolved artifact versions/digests and unresolved-exception status.

## Non-goals and open questions

This document does not add a schema, change imports, migrate data, add a renderer,
change exports, modify Adapter code, or define a framework binding. Open questions
for human confirmation before implementation are:

1. whether one release window is adequate for `0.6.0` import support;
2. whether Core-only import should be explicit UI choice or an API mode only;
3. the approval roles and retention policy for Pattern Adoption Evidence;
4. whether a later consumer justifies a single-file Bundle representation.
