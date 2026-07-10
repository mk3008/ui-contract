import { contractCatalog } from './catalog'
import { defaultContract } from './defaults'
import type { ImportResult, UiContract } from './types'

const supportedVersion = '0.2.0'
const phaseTwoVersion = '0.1.0'
const legacyVersion = '0.0.0'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const pathValue = (value: Record<string, unknown>, path: string): unknown => path.split('.').reduce<unknown>((current, key) => current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined, value)

const allowedShape: Record<string, unknown> = {
  schemaVersion: true, meta: { name: true, description: true }, product: { systemType: true, informationDensity: true, visualTone: true }, screenPatternPolicy: { searchList: true },
  designPolicy: { colorProfileId: true, brandIdentity: { mark: true, markBackground: true, markBorder: true }, color: { light: '*', dark: '*' } },
  interactionPolicy: { focus: { visibility: true, indicatorStyle: true }, validation: { trigger: true, presentation: true }, availability: { treatment: true, layout: true }, confirmation: { surface: true, scope: true }, loading: { feedback: true }, stateFeedback: { guidance: true } },
  componentPolicy: { button: { primaryEmphasis: true, secondaryEmphasis: true, dangerPlacement: true, dangerEmphasis: true, iconAdornment: true, iconOnlyPolicy: true }, textField: { fieldStyle: true, labelPlacement: true, requiredIndicator: true, messageAreaBehavior: true, placeholderUsage: true }, select: { emptyDisplay: true, multiSelectedItemDisplay: true, multiRemoveAffordance: true, searchFieldTreatment: true }, tabs: { treatment: true, adornment: true }, toggle: { treatment: true, labelPolicy: true }, checkbox: { groupLayout: true, choiceSurface: true, mixedState: true }, card: { treatment: true, interaction: true }, sidePanel: { relationship: true, responsive: true } },
}

function unknownFields(value: unknown, shape: unknown, path = ''): string[] {
  if (!value || typeof value !== 'object' || !shape || typeof shape !== 'object') return []
  const result: string[] = []
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const expected = (shape as Record<string, unknown>)[key]
    const childPath = path ? `${path}.${key}` : key
    if (expected === undefined) result.push(childPath)
    else if (expected !== '*' && expected !== true) result.push(...unknownFields(child, expected, childPath))
  }
  return result
}

function removeUnknown(value: Record<string, unknown>, shape: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, expected] of Object.entries(shape)) {
    const child = value[key]
    if (child === undefined) continue
    output[key] = expected === '*' || expected === true || !child || typeof child !== 'object' ? child : removeUnknown(child as Record<string, unknown>, expected as Record<string, unknown>)
  }
  return output
}

function migrateLegacyToPhaseTwo(value: Record<string, unknown>): Record<string, unknown> {
  const migrated = clone(value)
  migrated.schemaVersion = phaseTwoVersion
  if (!migrated.screenPatternPolicy || typeof migrated.screenPatternPolicy !== 'object') {
    migrated.screenPatternPolicy = clone(defaultContract.screenPatternPolicy)
  }
  const profile = pathValue(migrated, 'designPolicy.colorProfileId')
  if (profile === 'lineage-slate') ((migrated.designPolicy as Record<string, unknown>).colorProfileId = 'deep-slate-blue')
  return migrated
}

function migratePhaseTwoToCurrent(value: Record<string, unknown>): { value: Record<string, unknown>; diagnostics: string[] } {
  const migrated = clone(value)
  const diagnostics: string[] = []
  migrated.schemaVersion = supportedVersion
  const interactionPolicy = migrated.interactionPolicy as Record<string, unknown> | undefined
  if (!interactionPolicy || typeof interactionPolicy !== 'object') return { value: migrated, diagnostics }
  if (!interactionPolicy.loading) {
    interactionPolicy.loading = clone(defaultContract.interactionPolicy.loading)
    diagnostics.push('Added fixed Phase 3 invariant: interactionPolicy.loading.feedback = communicate-busy-state.')
  }
  if (!interactionPolicy.stateFeedback) {
    interactionPolicy.stateFeedback = clone(defaultContract.interactionPolicy.stateFeedback)
    diagnostics.push('Added fixed Phase 3 invariant: interactionPolicy.stateFeedback.guidance = explain-condition-and-next-step.')
  }
  const confirmation = interactionPolicy.confirmation as Record<string, unknown> | undefined
  if (confirmation?.scope === 'destructive-bulk-unsaved') {
    confirmation.scope = 'destructive-and-bulk'
    diagnostics.push('Migrated confirmation.scope destructive-bulk-unsaved to destructive-and-bulk; unsaved-change navigation is now screen/application-flow owned.')
  }
  return { value: migrated, diagnostics }
}

function diagnosticsFor(value: Record<string, unknown>): string[] {
  const diagnostics: string[] = []
  for (const required of ['meta', 'product', 'designPolicy', 'interactionPolicy', 'componentPolicy', 'screenPatternPolicy']) if (!value[required] || typeof value[required] !== 'object') diagnostics.push(`Missing required object: ${required}`)
  for (const entry of contractCatalog) {
    if (entry.kind !== 'decision') continue
    const selected = pathValue(value, entry.path)
    if (typeof selected !== 'string') diagnostics.push(`Missing selected value: ${entry.path}`)
    else if ((entry.id.startsWith('color-') && entry.id !== 'color-profile') || entry.id.startsWith('brand-identity-')) {
      if (!/^#[0-9a-f]{6}$/i.test(selected) && selected !== 'transparent') diagnostics.push(`Invalid color at ${entry.path}: ${selected}`)
    } else if (!entry.options?.some((item) => item.value === selected)) diagnostics.push(`Unsupported selected value at ${entry.path}: ${selected}`)
  }
  if (pathValue(value, 'interactionPolicy.loading.feedback') !== 'communicate-busy-state') diagnostics.push(`Invalid invariant at interactionPolicy.loading.feedback: ${String(pathValue(value, 'interactionPolicy.loading.feedback'))}`)
  if (pathValue(value, 'interactionPolicy.stateFeedback.guidance') !== 'explain-condition-and-next-step') diagnostics.push(`Invalid invariant at interactionPolicy.stateFeedback.guidance: ${String(pathValue(value, 'interactionPolicy.stateFeedback.guidance'))}`)
  return diagnostics
}

/** Parses imported JSON without normalising invalid selections. */
export function importContract(input: unknown): ImportResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { outcome: 'invalid', diagnostics: ['Document must be an object.'] }
  const raw = input as Record<string, unknown>
  const version = raw.schemaVersion
  if (version !== supportedVersion && version !== phaseTwoVersion && version !== legacyVersion) return { outcome: 'unsupported-version', diagnostics: [`Unsupported schemaVersion: ${String(version)}`] }
  const phaseTwoInput = version === legacyVersion ? migrateLegacyToPhaseTwo(raw) : clone(raw)
  const migration = version === supportedVersion ? { value: phaseTwoInput, diagnostics: [] } : migratePhaseTwoToCurrent(phaseTwoInput)
  const migrated = migration.value
  const diagnostics = diagnosticsFor(migrated)
  if (diagnostics.length) return { outcome: 'invalid', diagnostics }
  const ignored = unknownFields(migrated, allowedShape)
  const contract = removeUnknown(migrated, allowedShape) as UiContract
  if (version === legacyVersion) return { outcome: 'migrated', diagnostics: ['Migrated schemaVersion 0.0.0 to 0.1.0.', 'Migrated schemaVersion 0.1.0 to 0.2.0.', ...migration.diagnostics, ...ignored.map((field) => `Ignored unknown field: ${field}`)], contract }
  if (version === phaseTwoVersion) return { outcome: 'migrated', diagnostics: ['Migrated schemaVersion 0.1.0 to 0.2.0.', ...migration.diagnostics, ...ignored.map((field) => `Ignored unknown field: ${field}`)], contract }
  if (ignored.length) return { outcome: 'accepted-with-ignored-unknown-fields', diagnostics: ignored.map((field) => `Ignored unknown field: ${field}`), contract }
  return { outcome: 'valid', diagnostics: [], contract }
}

export function createDefaultContract(): UiContract { return clone(defaultContract) }
