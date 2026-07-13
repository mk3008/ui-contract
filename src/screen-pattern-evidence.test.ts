import { describe, expect, it } from 'vitest'
import { importContract } from './contract/import'
import { defaultContract } from './contract/defaults'
import { generateJson } from './contract/output'
import { isLocalUndoEligible } from './interactive-screen-patterns'
import { generateScreenPatternEvidence, generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, screenPatternExampleIds } from './screen-pattern-evidence'

describe('screen-pattern acceptance evidence', () => {
  it('is deterministic and records a canonical Contract snapshot for all five screens', () => {
    const evidence = generateScreenPatternEvidence(defaultContract)
    expect(evidence.artifactVersion).toBe('2.0.0')
    expect(evidence.artifactKind).toBe('screen-pattern-acceptance-evidence')
    expect(evidence.viewport).toEqual({ width: 1440, height: 1000 })
    expect(evidence.examples.map((example) => example.id)).toEqual(screenPatternExampleIds)
    expect(evidence.examples.every((example) => example.fixture.seed === 'screen-pattern-fixtures-v1')).toBe(true)
    expect(evidence.examples.every((example) => example.states.some((state) => state.id === 'initial'))).toBe(true)
    expect(evidence.contract.canonicalJsonDigest).toMatch(/^fnv1a-32:[0-9a-f]{8}$/)
    expect(evidence.contract.canonicalJson).toBe(generateJson(defaultContract))
    expect(generateScreenPatternEvidenceJson(defaultContract)).toBe(generateScreenPatternEvidenceJson(defaultContract))
    expect(generateScreenPatternEvidenceMarkdown(defaultContract)).toBe(generateScreenPatternEvidenceMarkdown(defaultContract))
  })

  it('uses the current Contract snapshot while preserving portable screen fixture data', () => {
    const changed = structuredClone(defaultContract)
    changed.designPolicy.color.light.primary = '#7c3aed'
    const baseline = generateScreenPatternEvidence(defaultContract)
    const evidence = generateScreenPatternEvidence(changed)
    expect(evidence.contract.canonicalJson).toBe(generateJson(changed))
    expect(evidence.contract.canonicalJsonDigest).not.toBe(baseline.contract.canonicalJsonDigest)
    expect(evidence.examples).toEqual(baseline.examples)
    expect(evidence.capture).toEqual(baseline.capture)
  })

  it('distinguishes unsearched, returned, and zero-result Search/List evidence', () => {
    const searchList = generateScreenPatternEvidence(defaultContract).examples.find((example) => example.id === 'search-list')
    expect(searchList?.states.map((state) => [state.id, state.uiState, state.route])).toEqual([
      ['initial', 'unsearched', '/?screen-artifact=search-list'],
      ['results', 'results', '/?screen-artifact=search-list&state=results'],
      ['selected', 'selection', '/?screen-artifact=search-list&state=selected'],
      ['loading', 'busy', '/?screen-artifact=search-list&state=loading'],
      ['zero-results', 'empty', '/?screen-artifact=search-list&state=zero-results'],
      ['error', 'error', '/?screen-artifact=search-list&state=error'],
    ])
  })

  it('keeps evidence paths portable and Contract downloads independent', () => {
    const evidence = generateScreenPatternEvidence(defaultContract)
    for (const example of evidence.examples) {
      expect(example.composes.every((path) => /^(designPolicy|componentPolicy|interactionPolicy|screenPatternPolicy)\./.test(path))).toBe(true)
      expect(example.states.every((state) => state.route.startsWith(`/?screen-artifact=${example.id}`) && new RegExp(`^images/${example.id}-[a-z-]+\\.png$`).test(state.png) && new RegExp(`^images/${example.id}-[a-z-]+\\.jpg$`).test(state.jpeg))).toBe(true)
    }
    for (const example of evidence.examples) {
      expect(example.states.every((state) => state.route === `/?screen-artifact=${example.id}${state.id === 'initial' ? '' : `&state=${state.id}`}`)).toBe(true)
    }
    expect(generateScreenPatternEvidenceJson(defaultContract)).not.toMatch(/https?:|data:|\.\.[\\/]|[A-Za-z]:[\\/]/)
    expect(importContract(generateScreenPatternEvidence(defaultContract))).toMatchObject({ outcome: 'unsupported-version' })
  })

  it('offers a local undo only for the existing reversible confirmation surface', () => {
    expect(isLocalUndoEligible('danger-dialog')).toBe(false)
    expect(isLocalUndoEligible('typed-confirmation')).toBe(false)
    expect(isLocalUndoEligible('undo-when-reversible')).toBe(true)
  })
})
