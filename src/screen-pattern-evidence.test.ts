import { describe, expect, it } from 'vitest'
import { importContract } from './contract/import'
import { isLocalUndoEligible } from './interactive-screen-patterns'
import { generateScreenPatternEvidence, generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, screenPatternExampleIds } from './screen-pattern-evidence'

describe('screen-pattern evidence', () => {
  it('is deterministic and contains exactly the required local interactive examples', () => {
    const evidence = generateScreenPatternEvidence()
    expect(evidence.artifactVersion).toBe('1.0.0')
    expect(evidence.artifactKind).toBe('screen-pattern-evidence')
    expect(evidence.classification).toBe('interactive-example-not-contract-policy')
    expect(evidence.examples.map((example) => example.id)).toEqual(screenPatternExampleIds)
    expect(generateScreenPatternEvidenceJson()).toBe(generateScreenPatternEvidenceJson())
    expect(generateScreenPatternEvidenceMarkdown()).toBe(generateScreenPatternEvidenceMarkdown())
  })

  it('uses only safe local image paths and existing Contract paths', () => {
    const allowedPaths = new Set([
      'screenPatternPolicy.searchList', 'screenPatternPolicy.formSection',
      'interactionPolicy.loading.feedback', 'interactionPolicy.stateFeedback.guidance',
      'interactionPolicy.validation.trigger', 'interactionPolicy.validation.presentation',
      'interactionPolicy.availability.treatment', 'interactionPolicy.availability.layout',
      'interactionPolicy.confirmation.surface', 'interactionPolicy.confirmation.scope',
      'componentPolicy.checkbox.choiceSurface', 'componentPolicy.checkbox.mixedState',
    ])
    const evidence = generateScreenPatternEvidence()
    for (const example of evidence.examples) {
      expect(example.composes.every((path) => allowedPaths.has(path))).toBe(true)
      expect(example.images.every((image) => /^images\/[a-z0-9-]+\.png$/.test(image))).toBe(true)
    }
    const images = evidence.examples.flatMap((example) => example.images)
    expect(new Set(images).size).toBe(images.length)
    expect(generateScreenPatternEvidenceJson()).not.toMatch(/https?:|data:|\.\.[\\/]|[A-Za-z]:[\\/]/)
  })

  it('is never accepted as UiContract import input', () => {
    expect(importContract(generateScreenPatternEvidence())).toMatchObject({ outcome: 'unsupported-version' })
  })

  it('offers a local undo only for the existing reversible confirmation surface', () => {
    expect(isLocalUndoEligible('danger-dialog')).toBe(false)
    expect(isLocalUndoEligible('typed-confirmation')).toBe(false)
    expect(isLocalUndoEligible('undo-when-reversible')).toBe(true)
  })
})
