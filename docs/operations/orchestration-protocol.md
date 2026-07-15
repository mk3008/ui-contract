# Repository orchestration protocol

`protocolVersion: 1`

## Purpose and trigger

This protocol is the repository-owned minimum contract for recoverable Codex
orchestration. Use it only when work is delegated to multiple agents, when
independent workstreams run in parallel, when stale-task or recovery handling
is needed, or when progress must survive a long or cross-session run.

Do not use it merely because a single agent will investigate, implement, and
test a change in several steps.

## State and evidence

The ledger is the only source of truth for execution state. Store it at:

```text
tmp/orchestration/<run-id>/ledger.json
```

Store the generated human-readable progress view at:

```text
tmp/orchestration/<run-id>/progress.md
```

Worker reports are evidence. They may describe changes and verification, but
they do not create or replace task state. Link them from the ledger. Do not
hand-edit `progress.md` or other generated progress files.

The `tmp/orchestration/` directory contains temporary run artifacts and is not
committed. Preserve the final outcome, material decisions, verification, and
any unmet condition in the pull request body or final work report instead.

## Minimum ledger format

Each ledger must contain at least:

```json
{
  "protocolVersion": 1,
  "runId": "example-run",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z",
  "rootTask": "Describe the outcome being coordinated.",
  "tasks": []
}
```

Each task must contain at least:

```json
{
  "id": "unique-task-id",
  "title": "Independently reviewable deliverable",
  "status": "pending",
  "owner": "orchestrator or assigned worker",
  "dependencies": [],
  "evidence": [],
  "result": null,
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

Allowed task statuses are `pending`, `ready`, `in_progress`, `blocked`,
`completed`, `failed`, `stale`, and `cancelled`.

## Recommended implementation and fallback

`$minimal-orchestration` is a recommended implementation of this protocol. It
may provide task packets, direct handshakes, monitoring, and generated progress
views, but it is not the authority for repository semantics.

Use it only when the skill is available and its protocol version is compatible
with this document. If the skill is unavailable or compatibility cannot be
confirmed:

1. Do not guess skill-specific internal behavior.
2. Fall back to a single agent and use this document's ledger format only when
   orchestration remains necessary.
3. Record in the final report that delegation could not be used.

When orchestration is not needed, do not create a ledger.
