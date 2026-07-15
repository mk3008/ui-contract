# Codex orchestration integration

This repository owns the interoperability contract in
[`orchestration-protocol.md`](orchestration-protocol.md). That protocol defines
when orchestration is warranted, the durable ledger shape, generated progress
locations, and the boundary between execution state and evidence.

Use orchestration only for delegated multi-agent work, independent parallel
workstreams, stale or recovery handling, or progress that must survive a long
or cross-session run. A normal single-agent investigation, implementation, and
test sequence does not need a ledger merely because it has several steps.

`$minimal-orchestration` is a recommended implementation, not this
repository's authority. It may be used when available and compatible with
`protocolVersion: 1`. When it is unavailable or compatibility cannot be
confirmed, do not infer its internal behavior: use the repository protocol's
ledger format with a single-agent fallback and record the missed delegation in
the final report. Do not create a ledger when orchestration is unnecessary.

For an orchestrated run, record the state only in
`tmp/orchestration/<run-id>/ledger.json`. Generate the human progress view at
`tmp/orchestration/<run-id>/progress.md`; do not hand-edit generated progress
files. Worker reports are evidence referenced by the ledger, not another state
machine.
