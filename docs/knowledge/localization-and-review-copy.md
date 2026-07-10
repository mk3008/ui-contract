# Localization and review copy

UI Contract Editor must make explanatory and state-feedback copy available in Japanese and English through the product language control. This includes helper text, status text, recovery guidance, and action labels that explain a state or next step.

Page titles, section headings, navigation/menu labels, shared UI/Contract vocabulary, and selectable option labels must remain English in both Japanese and English modes. They must not be used to avoid translating explanatory copy. Option notes are explanatory prose and must be bilingual.

Translations must preserve the same design or interaction meaning in both languages so Japanese and English reviewers can accurately evaluate the same product behavior. This rule applies to pre-existing and new human-facing editor explanatory copy, including option notes. Editor copy must use the established `src/i18n.ts` mechanism rather than a hard-coded, language-specific explanation.
