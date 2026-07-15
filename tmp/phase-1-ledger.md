# Task Brief: Phase 1 — Catalog, Schema, Output, and Test Foundation

## Issue

Contract metadata, normalisation, and output are coupled to UI components; invalid imports are silently defaulted.

## Customer and Customer Value

Contracts can be safely reopened, reviewed, and handed off without hidden data loss; contributors have one source for decision metadata.

## Decision and Boundaries

Create a portable domain layer: catalog owns metadata, schema/import owns validation and migration, generators own output, and the editor consumes validated Contracts.

## Scope In

Catalog, versioned schema, explicit import outcomes, shared JSON/Markdown generators, migrations, tests, and scripts.

## Scope Out

New selectable values, Search/List persistence, adapters, framework mappings, and visual redesign.

## Acceptance Criteria

1. Catalog-backed decisions/invariants and preview/translation references.
2. Five import outcomes with diagnostics.
3. No silent invalid selected-value replacement.
4. Deterministic JSON and Markdown from validated source.
5. Integrity, fixture, round-trip, migration, and output tests.
6. Legacy compatibility is classified.
7. Test and build commands pass.

## Implementation Notes

Use Vitest and an in-repository JSON Schema validator: this is the smallest Vite-compatible test runner and avoids a second runtime schema dependency.

## Verification Method

`npm test`, `npm run build`, `git diff --check`, plus inspected generated JSON/Markdown test fixture.

## Evidence Required

Tests map directly to the seven acceptance criteria above.

## Risks and Open Questions

Legacy imports with invalid selected values must become `invalid`, rather than preserving the prior silent fallback behavior.

## Stop Conditions

Stop if retained supported legacy shapes cannot be distinguished from malformed documents.

## Handoff

Phase 2 can begin only after this ledger marks all evidence ready.

## Ledger Snapshot

| Field | Status |
| --- | --- |
| Goal | Complete Phase 1 without adding choices. |
| Now | Complete Phase 1 acceptance audit: exact Contract types, catalog selectors, domain import/migration, outputs, and tests are in place. |
| Next | Phase 2 may begin only as its separately scoped vertical slice. |
| Blockers | None for Phase 1. |
| Evidence Ready? | Yes: 9 tests, production build, and whitespace diff checks pass. |
