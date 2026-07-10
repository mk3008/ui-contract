# Phase 1 implementation notes

## Toolchain decision

Phase 1 uses Vitest as the test runner. It is Vite-native, runs TypeScript without a separate transpilation pipeline, and adds only a development dependency. The versioned JSON Schema is an in-repository TypeScript artifact. The import parser is also the runtime validator so the editor can report the same diagnostics it uses to decide whether an import is accepted.

## Import and compatibility policy

`0.2.0` is the current supported version. `0.0.0` documents first migrate to `0.1.0` (including the retained `lineage-slate` to `deep-slate-blue` profile mapping) and then to `0.2.0`; valid `0.1.0` documents migrate directly to `0.2.0`. The Phase 3 migration adds the fixed loading and state-feedback invariants and translates `confirmation.scope: "destructive-bulk-unsaved"` to `"destructive-and-bulk"` with an explicit diagnostic that unsaved-change navigation is screen/application-flow owned. Unknown fields are removed only after a successful validation and reported as `accepted-with-ignored-unknown-fields` (or as additional migration diagnostics). Missing fields and unknown selected values are `invalid`; they are not filled from defaults. In particular, a `0.2.0` document using the removed confirmation scope is invalid rather than migrated. Other versions are `unsupported-version`.

This deliberately changes the old editor-only normalizer behavior at the import boundary: it silently substituted defaults for malformed selected values. The new behavior prevents hidden data loss. The old normalizer remains only for preview compatibility and is not used to import files.

## Output policy

JSON and Markdown generators accept the same validated `UiContract`. Markdown is now implemented and snapshot-tested; it is not merely a planned export format.

## Acceptance evidence map

| Acceptance criterion | Evidence |
| --- | --- |
| Catalog ownership/defaults/previews | `src/contract/catalog.ts`, catalog integrity test |
| Schema and five import outcomes | `src/contract/schema.ts`, fixtures and import tests |
| No silent invalid fallback | invalid fixture assertion |
| Shared deterministic outputs | output round trip and Markdown snapshot |
| Integrity failures | catalog integrity test |
| Legacy compatibility | `0.0.0`/`0.1.0` migration assertions and this note |
| Build and checks | `npm run verify`, `git diff --check` |
