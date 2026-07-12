# Codex orchestration adapter

For work requiring delegation, recovery, stale handling, or durable progress,
use the globally installed `$minimal-orchestration` skill. It is the authority
for Root, Worker, and Runtime Adjudicator roles, state transitions, task
packets, recovery, and generated progress views.

Before dispatch, retain this repository's required concept reading and record
the task-specific ledger at `tmp/orchestration/<run-id>/ledger.json`. Render it
after every state transition and keep worker reports as evidence rather than a
second task state. Do not hand-edit generated progress files.
