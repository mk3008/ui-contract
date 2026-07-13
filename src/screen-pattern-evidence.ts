export const screenPatternExampleIds = [
  'search-list',
  'edit-detail',
  'edit-list',
  'read-only-detail',
  'destructive-action',
] as const

export type ScreenPatternExampleId = typeof screenPatternExampleIds[number]

type EvidenceExample = {
  id: ScreenPatternExampleId
  classification: 'interactive-example-not-contract-policy'
  composes: string[]
  scenarios: Array<{ id: string; assertion: string }>
  images: string[]
}

export type ScreenPatternEvidence = {
  artifactVersion: '1.0.0'
  artifactKind: 'screen-pattern-evidence'
  classification: 'interactive-example-not-contract-policy'
  examples: EvidenceExample[]
}

/** Product-level evidence for local examples. It deliberately is not a UiContract document. */
export function generateScreenPatternEvidence(): ScreenPatternEvidence {
  return {
    artifactVersion: '1.0.0',
    artifactKind: 'screen-pattern-evidence',
    classification: 'interactive-example-not-contract-policy',
    examples: [
      {
        id: 'search-list',
        classification: 'interactive-example-not-contract-policy',
        composes: ['screenPatternPolicy.searchList', 'interactionPolicy.loading.feedback', 'interactionPolicy.stateFeedback.guidance', 'componentPolicy.checkbox.choiceSurface', 'componentPolicy.checkbox.mixedState'],
        scenarios: [
          { id: 'busy-to-results', assertion: 'A labelled busy results region changes to results after the local continuation action.' },
          { id: 'empty-and-retryable-error', assertion: 'Empty and error states expose labelled guidance and an available recovery action.' },
          { id: 'selection-and-bulk-context', assertion: 'Selecting a row exposes a non-colour bulk context with the selected count.' },
        ],
        images: ['images/search-list-results.png', 'images/search-list-empty.png', 'images/search-list-error.png'],
      },
      {
        id: 'edit-detail',
        classification: 'interactive-example-not-contract-policy',
        composes: ['screenPatternPolicy.formSection', 'interactionPolicy.validation.trigger', 'interactionPolicy.validation.presentation'],
        scenarios: [
          { id: 'invalid-submit', assertion: 'An invalid local submit shows a labelled field message and summary.' },
          { id: 'correct-save-cancel', assertion: 'A corrected value can be saved, and cancel restores the local draft.' },
        ],
        images: ['images/edit-detail-validation.png'],
      },
      {
        id: 'edit-list',
        classification: 'interactive-example-not-contract-policy',
        composes: ['screenPatternPolicy.searchList', 'interactionPolicy.validation.trigger', 'interactionPolicy.validation.presentation', 'componentPolicy.checkbox.choiceSurface'],
        scenarios: [
          { id: 'selection-local-edit', assertion: 'A selectable row exposes a local row editor without changing the Contract.' },
          { id: 'validate-save-cancel', assertion: 'The local editor reports validation, saves a correction, and can be cancelled.' },
        ],
        images: ['images/edit-list-selection.png'],
      },
      {
        id: 'read-only-detail',
        classification: 'interactive-example-not-contract-policy',
        composes: ['screenPatternPolicy.formSection', 'interactionPolicy.availability.treatment', 'interactionPolicy.availability.layout'],
        scenarios: [
          { id: 'reviewable-not-editable', assertion: 'Values remain reviewable through labelled read-only controls while the current availability treatment remains visible.' },
        ],
        images: ['images/read-only-detail.png'],
      },
      {
        id: 'destructive-action',
        classification: 'interactive-example-not-contract-policy',
        composes: ['interactionPolicy.confirmation.surface', 'interactionPolicy.confirmation.scope'],
        scenarios: [
          { id: 'cancel-confirm', assertion: 'The current confirmation surface supports cancelling or confirming a local destructive action.' },
          { id: 'eligible-undo', assertion: 'An undo action appears only when the current confirmation surface permits reversal.' },
        ],
        images: ['images/destructive-confirmation.png'],
      },
    ],
  }
}

export function generateScreenPatternEvidenceJson(): string {
  return `${JSON.stringify(generateScreenPatternEvidence(), null, 2)}\n`
}

export function generateScreenPatternEvidenceMarkdown(): string {
  const evidence = generateScreenPatternEvidence()
  const lines = ['# Screen pattern evidence', '', `Artifact kind: \`${evidence.artifactKind}\``, `Artifact version: \`${evidence.artifactVersion}\``, `Classification: \`${evidence.classification}\``, '']
  for (const example of evidence.examples) {
    lines.push(`## ${example.id}`, '', `Classification: \`${example.classification}\``, '', '### Composes', '', ...example.composes.map((path) => `- \`${path}\``), '', '### Scenarios', '')
    for (const scenario of example.scenarios) lines.push(`- \`${scenario.id}\`: ${scenario.assertion}`)
    lines.push('', '### Images', '', ...example.images.map((image) => `- \`${image}\``), '')
  }
  return `${lines.join('\n').trimEnd()}\n`
}
