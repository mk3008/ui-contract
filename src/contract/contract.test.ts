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

function phaseThreeContract() {
  const prior = JSON.parse(JSON.stringify(defaultContract)) as Record<string, any>
  prior.schemaVersion = '0.2.0'
  delete prior.screenPatternPolicy.formSection
  return prior
}

function phaseFourContract() {
  const prior = JSON.parse(JSON.stringify(defaultContract)) as Record<string, any>
  prior.schemaVersion = '0.3.0'
  return prior
}

function phaseFiveContract() {
  const prior = JSON.parse(JSON.stringify(defaultContract)) as Record<string, any>
  prior.schemaVersion = '0.4.0'
  delete prior.designPolicy.choiceGroupLayout
  prior.componentPolicy.checkbox.groupLayout = 'stacked-list'
  prior.componentPolicy.radioGroup = { treatment: 'visible-label-radio-group' }
  return prior
}

function phaseSixContract() {
  const prior = JSON.parse(JSON.stringify(defaultContract)) as Record<string, any>
  prior.schemaVersion = '0.5.0'
  prior.componentPolicy.tabs.treatment = 'segmented-contained'
  return prior
}

describe('catalog integrity', () => {
  it('has unique IDs, resolved preview and translation references, and valid defaults', () => {
    expect(new Set(contractCatalog.map((entry) => entry.id)).size).toBe(contractCatalog.length)
    expect(new Set(contractCatalog.map((entry) => entry.path)).size).toBe(contractCatalog.length)
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

  it('keeps Choice Group Layout in the Foundation and out of Checkbox and Radio ownership', () => {
    expect(catalogDecision('choice-group-layout')).toMatchObject({ boundary: 'foundation', path: 'designPolicy.choiceGroupLayout' })
    expect(contractCatalog.some((entry) => entry.path === 'componentPolicy.checkbox.groupLayout')).toBe(false)
    expect(contractCatalog.some((entry) => entry.path === 'componentPolicy.radioGroup.treatment')).toBe(false)
  })
})

describe('Phase 3 localization', () => {
  const stateFeedbackCopy = [
    'Interaction Policy requires observable busy feedback. Search/List owns which result region loads and the data it requests.',
    'Busy feedback is required; skeletons are only for structured content and inline indicators are for a single processing action.',
    'Interaction Policy requires plain-language explanation and an available next step. Search/List owns filters, result criteria, and whether no results exist.',
    'Explain empty conditions and an available next step; no-result criteria remain screen-owned.',
    'Interaction Policy requires plain-language recovery guidance. The screen pattern owns the failure cause, retry action, and affected content.',
    'Explain the problem and recovery path; error classification and retry behavior remain application-owned.',
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

  it('keeps page, section, and navigation labels English while translating explanatory copy', () => {
    for (const label of ['Button', 'Confirmation Policy', 'Loading feedback', 'Empty state', 'Error guidance']) {
      expect(translateUiText(label, 'ja', true)).toBe(label)
    }
    const mainSource = readFileSync(new URL('../main.tsx', import.meta.url), 'utf8')
    const i18nSource = readFileSync(new URL('../i18n.ts', import.meta.url), 'utf8')
    expect(mainSource).toContain('title="Loading feedback"')
    expect(mainSource).toContain('title="Empty state"')
    expect(mainSource).toContain('title="Error guidance"')
    expect(i18nSource).toContain("nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title")
  })

  it('covers every persisted catalog option label and note with a bilingual display translation', () => {
    for (const entry of contractCatalog) {
      if (entry.kind !== 'decision') continue
      for (const option of entry.options ?? []) {
        expect(translateUiText(option.label, 'ja', true)).toBe(option.label)
        expect(translateUiText(option.note, 'ja')).not.toBe(option.note)
        expect(translateUiText(translateUiText(option.note, 'ja'), 'en')).toBe(option.note)
      }
    }
  })
})

describe('schema and import outcomes', () => {
  it('publishes a versioned schema and classifies all import outcomes', () => {
    expect(schemaProperties.schemaVersion.const).toBe('0.6.0')
    expect(uiContractJsonSchema.$id).toBe('https://ui-contract-editor.local/schema/ui-contract-0.6.0.json')
    expect((schemaProperties.screenPatternPolicy.properties as Record<string, Record<string, unknown>>).searchList.enum).toEqual(['standard-search-list'])
    for (const key of uiContractJsonSchema.required as string[]) expect(schemaProperties[key]).toBeDefined()
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).button.properties as Record<string, Record<string, unknown>>).primaryEmphasis.enum).toContain('filled')
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).button.properties as Record<string, Record<string, unknown>>).primaryEmphasis.enum).not.toContain('gradient')
    const interactionProperties = schemaProperties.interactionPolicy.properties as Record<string, Record<string, unknown>>
    expect((interactionProperties.loading.properties as Record<string, Record<string, unknown>>).feedback.const).toBe('communicate-busy-state')
    expect((interactionProperties.stateFeedback.properties as Record<string, Record<string, unknown>>).guidance.const).toBe('explain-condition-and-next-step')
    expect((schemaProperties.screenPatternPolicy.properties as Record<string, Record<string, unknown>>).formSection.enum).toEqual(['grouped-form-section'])
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).tabs.properties as Record<string, Record<string, unknown>>).treatment.enum).toEqual(['line-tabs', 'contained-tabs'])
    expect((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).radioGroup).toBeUndefined()
    expect((schemaProperties.designPolicy.properties as Record<string, Record<string, unknown>>).choiceGroupLayout.enum).toEqual(['stacked-default-with-constrained-inline'])
    expect(importContract(defaultContract).outcome).toBe('valid')
    expect(importContract({ ...defaultContract, meta: validFixture.meta }).outcome).toBe('valid')
    expect(importContract({ ...defaultContract, extra: true }).outcome).toBe('accepted-with-ignored-unknown-fields')
    expect(importContract(phaseTwoContract()).outcome).toBe('migrated')
    expect(importContract(phaseThreeContract()).outcome).toBe('migrated')
    expect(importContract(phaseFourContract()).outcome).toBe('migrated')
    expect(importContract(invalidSelectedValueFixture).outcome).toBe('invalid')
    expect(importContract(unsupportedVersionFixture).outcome).toBe('unsupported-version')
  })

  it('migrates pre-Phase-2 documents through 0.1.0 and into the Phase 3 Contract', () => {
    const legacy = phaseTwoContract()
    legacy.schemaVersion = '0.0.0'
    delete legacy.screenPatternPolicy
    const result = importContract(legacy)
    expect(result).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.6.0', designPolicy: { choiceGroupLayout: 'stacked-default-with-constrained-inline' }, screenPatternPolicy: { searchList: 'standard-search-list', formSection: 'grouped-form-section' }, interactionPolicy: { confirmation: { scope: 'destructive-and-bulk' }, loading: { feedback: 'communicate-busy-state' }, stateFeedback: { guidance: 'explain-condition-and-next-step' } } } })
    expect(result.diagnostics.join(' ')).toContain('unsaved-change navigation is now screen/application-flow owned')
  })

  it('migrates valid 0.1.0 confirmation scope with an observable ownership diagnostic', () => {
    const result = importContract(phaseTwoContract())
    expect(result).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.6.0', interactionPolicy: { confirmation: { scope: 'destructive-and-bulk' } } } })
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

  it('migrates a valid 0.2.0 Contract with an observable Phase 4 diagnostic, but rejects invalid current form-section values', () => {
    const migrated = importContract(phaseThreeContract())
    const invalidCurrent = importContract({ ...defaultContract, screenPatternPolicy: { ...defaultContract.screenPatternPolicy, formSection: 'two-column-form' } })
    expect(migrated).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.6.0', screenPatternPolicy: { formSection: 'grouped-form-section' } } })
    expect(migrated.diagnostics.join(' ')).toContain('Added fixed Phase 4 Screen Pattern')
    expect(invalidCurrent).toMatchObject({ outcome: 'invalid' })
    expect(invalidCurrent.diagnostics.join(' ')).toContain('formSection: two-column-form')
  })

  it('migrates a valid old Contract without introducing a Radio Group Component Contract', () => {
    const migrated = importContract(phaseFourContract())
    expect(migrated).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.6.0' } })
    expect(migrated.contract?.componentPolicy).not.toHaveProperty('radioGroup')
  })

  it('moves the old Checkbox arrangement into the shared Foundation policy and rejects malformed current values', () => {
    const migrated = importContract(phaseFiveContract())
    const invalidCurrent = importContract({ ...defaultContract, designPolicy: { ...defaultContract.designPolicy, choiceGroupLayout: 'unbounded-inline' } })
    expect(migrated).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.6.0', designPolicy: { choiceGroupLayout: 'stacked-default-with-constrained-inline' }, componentPolicy: { checkbox: { choiceSurface: 'plain-label', mixedState: 'show-indeterminate' } } } })
    expect(migrated.contract?.componentPolicy).not.toHaveProperty('radioGroup')
    expect(migrated.diagnostics.join(' ')).toContain('Moved Checkbox group layout to Foundation policy')
    expect(migrated.diagnostics.join(' ')).toContain('Removed obsolete Radio Group Component Contract')
    expect(invalidCurrent).toMatchObject({ outcome: 'invalid' })
    expect(invalidCurrent.diagnostics.join(' ')).toContain('choiceGroupLayout: unbounded-inline')
  })

  it('migrates the former segmented Tabs treatment to contained tabs and rejects it in current-version input', () => {
    const migrated = importContract(phaseSixContract())
    const invalidCurrent = importContract({ ...defaultContract, componentPolicy: { ...defaultContract.componentPolicy, tabs: { ...defaultContract.componentPolicy.tabs, treatment: 'segmented-contained' } } })
    expect(migrated).toMatchObject({ outcome: 'migrated', contract: { schemaVersion: '0.6.0', componentPolicy: { tabs: { treatment: 'contained-tabs', adornment: 'text-only' } } } })
    expect(migrated.diagnostics.join(' ')).toContain('segmented binary presentation remains Toggle-owned')
    expect(invalidCurrent).toMatchObject({ outcome: 'invalid' })
    expect(invalidCurrent.diagnostics.join(' ')).toContain('tabs.treatment: segmented-contained')
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
    for (const relativePath of ['../main.tsx', '../control-contracts.tsx', '../select-contract.tsx', '../choice-group-layout-contract.tsx']) {
      const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
      expect(source).not.toMatch(/(?:type|interface)\s+(?:UiContract|SelectPolicy|TabsPolicy|TogglePolicy|CheckboxPolicy|ColorPolicy|BrandIdentityPolicy)\s*=/)
    }
  })
})

describe('output generators', () => {
  it('round-trips generated JSON through the validator', () => {
    expect(importContract(JSON.parse(generateJson(defaultContract)))).toMatchObject({ outcome: 'valid', contract: defaultContract })
  })

  it('exports the shared Choice Group Layout and screen-pattern decisions without Radio Group policy', () => {
    const json = generateJson(defaultContract)
    const markdown = generateMarkdown(defaultContract)
    expect(json).toContain('"searchList": "standard-search-list"')
    expect(json).toContain('"formSection": "grouped-form-section"')
    expect(json).toContain('"choiceGroupLayout": "stacked-default-with-constrained-inline"')
    expect(json).not.toContain('"radioGroup"')
    expect(markdown).toContain('### Screen patterns')
    expect(markdown).toContain('searchList: `standard-search-list`')
    expect(markdown).toContain('formSection: `grouped-form-section`')
    expect(markdown).not.toContain('radioGroup.treatment')
    expect(markdown).toContain('choiceGroupLayout: `stacked-default-with-constrained-inline`')
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
