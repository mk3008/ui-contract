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

const schemaProperties = uiContractJsonSchema.properties as Record<string, Record<string, unknown>>

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

describe('schema and import outcomes', () => {
  it('publishes a versioned schema and classifies all import outcomes', () => {
    expect(schemaProperties.schemaVersion.const).toBe('0.1.0')
    expect((schemaProperties.screenPatternPolicy.properties as Record<string, Record<string, unknown>>).searchList.enum).toEqual(['standard-search-list'])
    for (const key of uiContractJsonSchema.required as string[]) expect(schemaProperties[key]).toBeDefined()
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).button.properties as Record<string, Record<string, unknown>>).primaryEmphasis.enum).toContain('filled')
    expect(((schemaProperties.componentPolicy.properties as Record<string, Record<string, unknown>>).button.properties as Record<string, Record<string, unknown>>).primaryEmphasis.enum).not.toContain('gradient')
    expect(importContract(defaultContract).outcome).toBe('valid')
    expect(importContract({ ...defaultContract, meta: validFixture.meta }).outcome).toBe('valid')
    expect(importContract({ ...defaultContract, extra: true }).outcome).toBe('accepted-with-ignored-unknown-fields')
    expect(importContract({ ...defaultContract, schemaVersion: '0.0.0' }).outcome).toBe('migrated')
    expect(importContract(invalidSelectedValueFixture).outcome).toBe('invalid')
    expect(importContract(unsupportedVersionFixture).outcome).toBe('unsupported-version')
  })

  it('migrates a pre-Phase-2 legacy document to the catalog default Search/List policy', () => {
    const legacy = { ...defaultContract, schemaVersion: '0.0.0' as const }
    delete (legacy as Partial<typeof legacy>).screenPatternPolicy
    const result = importContract(legacy)
    expect(result).toMatchObject({ outcome: 'migrated', contract: { screenPatternPolicy: { searchList: 'standard-search-list' } } })
  })

  it('never silently replaces an invalid selected value', () => {
    const result = importContract({ ...defaultContract, componentPolicy: { ...defaultContract.componentPolicy, button: { ...defaultContract.componentPolicy.button, primaryEmphasis: 'gradient' } } })
    expect(result.contract).toBeUndefined()
    expect(result.diagnostics.join(' ')).toContain('primaryEmphasis: gradient')
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

  it('generates deterministic Markdown from the same source', () => {
    const first = generateMarkdown(defaultContract)
    expect(generateMarkdown(defaultContract)).toBe(first)
    expect(first).toMatchSnapshot()
  })
})
