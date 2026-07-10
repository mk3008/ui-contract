import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { catalogDecision, contractCatalog, previewRegistry, translationRegistry } from './catalog'
import { defaultContract } from './defaults'
import { importContract } from './import'
import { generateJson, generateMarkdown } from './output'
import { uiContractJsonSchema } from './schema'
import { renderedMainDecisionIds } from './rendered-decisions'
import { renderedControlDecisionIds } from '../control-contracts'
import { renderedSelectDecisionIds } from '../select-contract'
import validFixture from './fixtures/valid.json'
import invalidSelectedValueFixture from './fixtures/invalid-selected-value.json'
import unsupportedVersionFixture from './fixtures/unsupported-version.json'
import { translateUiText } from '../i18n'

const schemaProperties = uiContractJsonSchema.properties as Record<string, Record<string, unknown>>

function phaseTwoContract() {
  const legacy = JSON.parse(JSON.stringify(defaultContract)) as Record<string, any>
  legacy.schemaVersion = '0.1.0'
  legacy.interactionPolicy.confirmation.scope = 'destructive-bulk-unsaved'
  delete legacy.interactionPolicy.loading
  delete legacy.interactionPolicy.stateFeedback
  return legacy
}

describe('catalog integrity', () => {
  it('has unique IDs, resolved preview and translation references, and valid defaults', () => {
    expect(new Set(contractCatalog.map((entry) => entry.id)).size).toBe(contractCatalog.length)
    expect(new Set(contractCatalog.map((entry) => entry.previewId)).size).toBe(contractCatalog.length)
    expect(new Set(contractCatalog.map((entry) => entry.translationKey)).size).toBe(contractCatalog.length)
    for (const entry of contractCatalog) {
      expect(previewRegistry.has(entry.previewId)).toBe(true)
      expect(translationRegistry.has(entry.translationKey)).toBe(true)
      if (entry.kind === 'decision') expect(entry.options?.some((item) => item.value === entry.defaultValue)).toBe(true)
    }
  })

  it('supplies every persisted editor decision through a catalog entry', () => {
    const rendered = [...renderedMainDecisionIds, ...renderedControlDecisionIds, ...renderedSelectDecisionIds]
    for (const id of rendered) expect(() => catalogDecision(id)).not.toThrow()
    expect(new Set(rendered).size).toBe(rendered.length)
  })

  it('derives every rendered default from the catalog', () => {
    const rendered = [...renderedMainDecisionIds, ...renderedControlDecisionIds, ...renderedSelectDecisionIds]
    for (const id of rendered) {
      const entry = catalogDecision(id)
      const value = entry.path.split('.').reduce<unknown>((current, key) => (current as Record<string, unknown>)[key], defaultContract)
      expect(value).toBe(entry.defaultValue)
    }
  })
})

describe('Phase 3 localization', () => {
  const stateFeedbackCopy = [
    'These are cross-cutting invariants, not component or screen-pattern choices. The application chooses data and recovery actions; every affected region follows the same feedback rule.',
    'Loading feedback',
    'Communicate that the affected region is busy to all users. Use a skeleton only for structured content; use an inline indicator for one processing action.',
    'Empty and error guidance',
    'Explain the condition in plain language and show a useful next step when one is available.',
    'Loading customers',
    'Busy status applies to this results region.',
    'No matching customers',
    'Try clearing a filter or using a broader search term.',
    'Clear filters',
    'Customers could not be loaded',
    'Check the connection and try again.',
    'Try again',
  ]

  it('translates every Phase 3 explanatory and state-feedback string in both directions', () => {
    for (const english of stateFeedbackCopy) {
      const japanese = translateUiText(english, 'ja')
      expect(japanese).not.toBe(english)
      expect(translateUiText(japanese, 'en')).toBe(english)
    }
  })
})

describe('schema and import outcomes', () => {
  it('publishes a versioned schema and classifies all import outcomes', () => {
    expect(schemaProperties.schemaVersion.const).toBe('0.2.0')
    expect(uiContractJsonSchema.$id).toBe('https://ui-contract-editor.local/schema/ui-contract-0.2.0.json')
    expect((schemaProperties.screenPatternPolicy.properties as Record<string, Record<string, unknown>>).searchList.enum).toEqual(['standard-search-list'])
    for (const key of uiContractJsonSchema.required as string[]) expect(schemaProperties[key]).toBeDefined()
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).button.properties as Record<string, Record<string, unknown>>).primaryEmphasis.enum).toContain('filled')
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).button.properties as Record<string, Record<string, unknown>>).primaryEmphasis.enum).not.toContain('gradient')
    const interactionProperties = schemaProperties.interactionPolicy.properties as Record<string, Record<string, unknown>>
    expect((interactionProperties.loading.properties as Record<string, Record<string, unknown>>).feedback.const).toBe('communicate-busy-state')
    expect((interactionProperties.stateFeedback.properties as Record<string, Record<string, unknown>>).guidance.const).toBe('explain-condition-and-next-step')
    expect(importContract(defaultContract).outcome).toBe('valid')
    expect(importContract({ ...defaultContract, meta: validFixture.meta }).outcome).toBe('valid')
    expect(importContract({ ...defaultContract, extra: true }).outcome).toBe('accepted-with-ignored-unknown-fields')
    expect(importContract(phaseTwoContract()).outcome).toBe('migrated')
    expect(importContract(invalidSelectedValueFixture).outcome).toBe('invalid')
    expect(importContract(unsupportedVersionFixture).outcome).toBe('unsupported-version')
  })

  it('migrates pre-Phase-2 documents through 0.1.0 and into the Phase 3 Contract', () => {
    const legacy = phaseTwoContract()
    legacy.schemaVersion = '0.0.0'
    delete legacy.screenPatternPolicy
    const result = importContract(legacy)
    expect(result).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.2.0', screenPatternPolicy: { searchList: 'standard-search-list' }, interactionPolicy: { confirmation: { scope: 'destructive-and-bulk' }, loading: { feedback: 'communicate-busy-state' }, stateFeedback: { guidance: 'explain-condition-and-next-step' } } } })
    expect(result.diagnostics.join(' ')).toContain('unsaved-change navigation is now screen/application-flow owned')
  })

  it('migrates valid 0.1.0 confirmation scope with an observable ownership diagnostic', () => {
    const result = importContract(phaseTwoContract())
    expect(result).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.2.0', interactionPolicy: { confirmation: { scope: 'destructive-and-bulk' } } } })
    expect(result.diagnostics.join(' ')).toContain('Migrated schemaVersion 0.1.0 to 0.2.0.')
    expect(result.diagnostics.join(' ')).toContain('Added fixed Phase 3 invariant: interactionPolicy.loading.feedback')
    expect(result.diagnostics.join(' ')).toContain('unsaved-change navigation is now screen/application-flow owned')
  })

  it('does not normalise an unsupported 0.1.0 selected value during migration', () => {
    const legacy = phaseTwoContract()
    legacy.interactionPolicy.confirmation.scope = 'unexpected-scope'
    const result = importContract(legacy)
    expect(result).toMatchObject({ outcome: 'invalid' })
    expect(result.diagnostics.join(' ')).toContain('confirmation.scope: unexpected-scope')
  })

  it('never silently replaces an invalid selected value', () => {
    const result = importContract({ ...defaultContract, componentPolicy: { ...defaultContract.componentPolicy, button: { ...defaultContract.componentPolicy.button, primaryEmphasis: 'gradient' } } })
    expect(result.contract).toBeUndefined()
    expect(result.diagnostics.join(' ')).toContain('primaryEmphasis: gradient')
  })

  it('rejects obsolete confirmation scope and altered fixed invariants in current-version input', () => {
    const obsoleteScope = importContract({ ...defaultContract, interactionPolicy: { ...defaultContract.interactionPolicy, confirmation: { ...defaultContract.interactionPolicy.confirmation, scope: 'destructive-bulk-unsaved' } } })
    const alteredInvariant = importContract({ ...defaultContract, interactionPolicy: { ...defaultContract.interactionPolicy, loading: { feedback: 'spinner-only' } } })
    expect(obsoleteScope).toMatchObject({ outcome: 'invalid' })
    expect(obsoleteScope.diagnostics.join(' ')).toContain('confirmation.scope: destructive-bulk-unsaved')
    expect(alteredInvariant).toMatchObject({ outcome: 'invalid' })
    expect(alteredInvariant.diagnostics.join(' ')).toContain('interactionPolicy.loading.feedback: spinner-only')
  })

  it('routes editor file imports through the domain importer, without a legacy normalizer', () => {
    const mainSource = readFileSync(new URL('../main.tsx', import.meta.url), 'utf8')
    expect(mainSource).toContain('importContract(JSON.parse(content))')
    expect(mainSource).not.toContain('normalizeContract')
  })

  it('keeps persisted Contract type ownership in the domain module', () => {
    for (const relativePath of ['../main.tsx', '../control-contracts.tsx', '../select-contract.tsx']) {
      const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
      expect(source).not.toMatch(/(?:type|interface)\s+(?:UiContract|SelectPolicy|TabsPolicy|TogglePolicy|CheckboxPolicy|ColorPolicy|BrandIdentityPolicy)\s*=/)
    }
  })
})

describe('output generators', () => {
  it('round-trips generated JSON through the validator', () => {
    expect(importContract(JSON.parse(generateJson(defaultContract)))).toMatchObject({ outcome: 'valid', contract: defaultContract })
  })

  it('exports the Search/List screen-pattern decision to JSON and Markdown', () => {
    const json = generateJson(defaultContract)
    const markdown = generateMarkdown(defaultContract)
    expect(json).toContain('"searchList": "standard-search-list"')
    expect(markdown).toContain('### Screen patterns')
    expect(markdown).toContain('searchList: `standard-search-list`')
  })

  it('exports the fixed loading and state-feedback interaction requirements', () => {
    const json = generateJson(defaultContract)
    const markdown = generateMarkdown(defaultContract)
    expect(json).toContain('"feedback": "communicate-busy-state"')
    expect(json).toContain('"guidance": "explain-condition-and-next-step"')
    expect(markdown).toContain('loading.feedback: `communicate-busy-state`')
    expect(markdown).toContain('stateFeedback.guidance: `explain-condition-and-next-step`')
  })

  it('generates deterministic Markdown from the same source', () => {
    const first = generateMarkdown(defaultContract)
    expect(generateMarkdown(defaultContract)).toBe(first)
    expect(first).toMatchSnapshot()
  })
})
