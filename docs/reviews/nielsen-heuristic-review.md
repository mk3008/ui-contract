# Nielsen Heuristic Review for UI Contract Editor

This review guide adapts Jakob Nielsen's usability heuristics to the UI Contract Editor itself.
Use it to find UX issues in the editor screens, controls, previews, and review workflow.
Do not use it to add UI Contract option values or schema fields.

## Product Purpose

UI Contract Editor is a translation tool.
Its job is to help users who do not know design-system, CSS, HTML, or frontend implementation terminology ask for the visual design they want, then express that intent in vocabulary that product designers, CSS/HTML authors, frontend programmers, and AI coding agents can understand.

The editor should not merely display attractive previews.
Each visible preview, option label, note, and JSON value should form a reliable translation pair:

- the non-specialist user can recognize the desired visual result in the preview,
- the exported Contract term is understandable to a professional frontend implementer,
- the term predicts the likely implementation outcome with enough precision that the visual result would be reproduced most of the time.

If a term would not help a frontend programmer or designer produce the intended UI, it has little value in this product even if it sounds like design terminology.

Source reference:

- Nielsen Norman Group, [10 Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/)
- Nielsen Norman Group, [Heuristic Evaluations: How to Conduct](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/)

## Responsibility Boundary

This document is a UX review checklist for the editor product.
It is not a source of contract vocabulary, not an option-governance rule, and not a design-system anti-pattern catalog.

Related documents have different responsibilities:

- `docs/knowledge/design-system-foundations.md`: Defines what UI Contract means by design systems, foundations, components, interaction policy, and screen patterns.
- `docs/concepts/ui-contract-option-governance/concept.json`: Defines how to decide whether a Contract option should be added, changed, moved, held, or rejected.
- `docs/knowledge/design-system-anti-patterns.md`: Records UI patterns that should normally be avoided or constrained as Contract options.
- `docs/reviews/nielsen-heuristic-review.md`: Provides review questions for the UX of UI Contract Editor itself.

When a finding suggests a new Contract option, route that idea through option governance first.
When a finding only changes labels, flow, feedback, preview clarity, or editor behavior, treat it as an editor UX improvement.

## Review Heuristics

### 1. System Status Is Visible

Summary:
The editor should make the user's current state, pending work, and save/export outcome clear.

Check in this tool:

- Does the editor show which contract area, section, or option group is currently being edited?
- Are dirty, saved, copied, imported, exported, or validation states visible without guessing?
- Do previews make it clear whether they reflect the current selections or stale/default values?
- Are loading, parsing, validation, and generation operations acknowledged quickly?

### 2. The Editor Uses Product-Team Language

Summary:
The editor should use terms a product designer, engineer, or AI reviewer can understand without knowing local implementation details.

Check in this tool:

- Do option labels, help text, and warnings avoid CSS, framework, and internal component jargon?
- Are contract boundaries explained in ordinary product UI terms?
- Do screen labels match how users think about design policy, components, states, and previews?
- Are source-app names or private metaphors kept out of user-facing decision surfaces?

### 2A. Contract Terms Translate Visual Intent

Summary:
The editor should prove that a visual preview and its Contract term mean the same thing to non-specialist users and frontend implementers.
The same visual or interaction meaning must keep the same base term throughout the editor. Different words for the same treatment make the tool a weaker translator, even when each individual word sounds reasonable.

Check in this tool:

- Would a non-specialist user pick this option after seeing the preview and reasonably expect the exported JSON to request that same visual treatment?
- Would a competent frontend programmer or product designer understand the Contract value without seeing this repository's source code?
- If the Contract value were handed to a frontend programmer, is there at least a high-likelihood interpretation of the resulting UI?
- Is the term specific enough to distinguish materially different treatments, such as outline, ghost, soft-filled, filled-tonal, subtle border, or destructive filled?
- Does the preview show the essential visual properties named by the term, such as fill, border, text color, contrast, state, density, or grouping?
- Are structurally identical treatments named and explained with the same vocabulary, with only the semantic color or role changed?
- Are role-specific choices derived from a common coloring-pattern list before naming the primary, secondary, or danger variants?
- Does the review flag synonym drift, where the same meaning appears under different names such as "clarifying icons" and "icon when useful"?
- Does the review flag false consistency, where the same word is reused for materially different visual or interaction meanings?
- Are ambiguous or overloaded terms flagged for renaming, splitting, preview adjustment, or option-governance review?

### 3. Users Can Back Out

Summary:
Users should be able to recover from accidental choices, imports, edits, or navigation.

Check in this tool:

- Can users undo or reset a selection without rebuilding the whole contract?
- Are destructive or broad actions, such as clearing values or replacing JSON, reversible or confirmed?
- Can users leave dialogs, drawers, edit modes, and preview states predictably?
- Does navigation preserve work or warn before losing unsaved changes?

### 4. Consistency Supports Learning

Summary:
Repeated editor patterns should behave the same way across contract areas.
Terminology consistency is part of the product's translation quality, not only UI polish.

Check in this tool:

- Do similar option groups use consistent labels, control types, empty states, and validation messages?
- Do repeated visual treatments keep the same base term across roles, such as secondary outline and danger outline differing by color rather than by unrelated wording?
- Do repeated decision patterns reuse the same base vocabulary, such as "clarifying icon", "selected state", "empty prompt", "surface", "outline", and "filled"?
- When wording differs, is the difference tied to a real design difference visible in the preview or exported JSON?
- Are preview states and selected states represented consistently across components?
- Do buttons, links, tabs, and menus follow familiar web and business-application conventions?
- Are severity labels, boundary labels, and review notes used consistently across documents and UI?

### 5. Errors Are Prevented Before They Happen

Summary:
The editor should reduce invalid, contradictory, or boundary-breaking contract edits before users commit them.

Check in this tool:

- Are impossible or currently meaningless dependent questions hidden, disabled, or explained?
- Does the editor prevent invalid JSON, missing required values, duplicate IDs, or unsupported combinations?
- Are risky choices framed with enough context before they become saved contract values?
- Are import and paste flows validated before replacing trusted content?

### 6. Users Recognize Choices Instead Of Remembering Rules

Summary:
The editor should surface enough context that users do not need to memorize governance rules.

Check in this tool:

- Are relevant summaries, examples, previews, and boundary notes close to the decision point?
- Can users see the current contract value and available alternatives at the same time?
- Are review cues visible when an option is held, rejected, moved, or evidence-sensitive?
- Does the UI avoid making users remember rules from `AGENTS.md` or knowledge documents during ordinary editing?

### 7. Efficient Workflows Are Available

Summary:
New users need guidance, while experienced users need faster ways to inspect and edit.

Check in this tool:

- Can users jump between contract sections, review notes, and previews without excessive scrolling?
- Are common review actions efficient, such as finding changed options, copying JSON, or comparing preview states?
- Does the editor support keyboard and screen-reader efficient navigation for repeated review work?
- Are advanced controls available without overwhelming first-time use?

### 8. Screens Stay Focused

Summary:
The editor should avoid visual noise that competes with contract decisions and preview interpretation.

Check in this tool:

- Are only decision-relevant controls, notes, and warnings visible in each context?
- Do decorative or preview-only elements avoid looking like editable contract controls?
- Are long explanations collapsed, linked, or summarized when they would bury the current decision?
- Does the layout keep related labels, controls, evidence, and previews visually grouped?

### 9. Errors Are Clear And Recoverable

Summary:
When something fails, users should understand what failed, why it matters, and what to do next.

Check in this tool:

- Do validation errors identify the exact field, option group, or JSON path involved?
- Are parse, import, export, and schema errors written in actionable language?
- Does the UI distinguish contract-boundary warnings from technical failures?
- Are users given a practical recovery path, such as restore previous value, edit JSON, or review governance?

### 10. Help Is Available Near The Work

Summary:
The editor should provide lightweight help for complex contract decisions without turning every screen into documentation.

Check in this tool:

- Are links to foundations, governance, anti-patterns, and review guides available where they are relevant?
- Is help concise enough to support the current decision without replacing the source documents?
- Are examples and previews used to clarify behavior that text alone cannot explain?
- Is there a clear path from an editor UX issue to this heuristic review template?

## Review Result Template

Use this template for each finding.
Keep findings focused on observed editor UX behavior.

```md
### Finding: <short title>

- Heuristic:
- Severity: blocker | major | minor | note
- Area:
- Current behavior:
- Problem:
- Translation risk:
- Frontend interpretation:
- Expected implementation confidence: high | medium | low | unknown
- Suggested improvement:
- Needs code change: yes | no | unknown
- Related contract boundary: foundation | component | interaction policy | screen pattern | option governance | none
```

Severity guidance:

- `blocker`: Prevents successful editing, review, save/export, or causes likely data loss.
- `major`: Causes frequent confusion, invalid decisions, inaccessible operation, or costly recovery.
- `minor`: Creates friction or local misunderstanding but has a clear workaround.
- `note`: Observation, polish issue, or future improvement idea.

## Review Notes

- Do not review every screen exhaustively unless a specific review task asks for it.
- Prefer concrete observations from the editor UI over speculative opinions.
- For option labels and JSON values, review whether the term would make a frontend programmer produce the previewed treatment with high probability.
- Treat vague professional-sounding words as review risks when they do not predict fill, border, color, state, grouping, or interaction treatment.
- Treat synonym drift as a review finding: same meaning with different words is a translation defect.
- Treat overloaded vocabulary as a review finding: same word with different meanings is a translation defect.
- Link a finding to Contract option governance only when the issue affects whether a contract value should exist.
- Keep code-change recommendations separate from contract-boundary recommendations.
