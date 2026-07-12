# UI Contract Editor Guidance

This policy applies repository-wide. Keep repository artifacts in English and
user-facing reports in Japanese unless the user requests otherwise.

## Routing

- For delegated or multi-step work, read
  `docs/operations/codex-orchestration.md` and use `$minimal-orchestration`.
- Before changing UI Contract option values, read:
  - `docs/knowledge/design-system-foundations.md`
  - `docs/concepts/ui-contract-option-governance/concept.json`
  - `docs/knowledge/design-system-anti-patterns.md`
- For an editor UX review, use `docs/reviews/nielsen-heuristic-review.md`.

## Non-negotiable product rules

- Treat option proposals as hypotheses. Add or change values only when their
  visual result is clear to a frontend implementer and supported by established
  design-system guidance.
- Keep shared visual meaning on shared vocabulary. Do not introduce private,
  source-app, CSS, component-package, or implementation-jargon values.
- Keep button-visible properties in Button Contract; place workflow behavior
  such as confirmation, permissions, validation, and screen states in their
  owning policy.
- Choose evidence-backed, lowest-risk defaults. Report the boundary, evidence,
  and remaining uncertainty for option-set changes.
