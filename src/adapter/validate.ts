import { contractCatalog } from '../contract/catalog'
import type { ContractCatalogEntry } from '../contract/catalog'
import type { UiContract } from '../contract/types'
import { supportedAdapterContractSchemaVersion, supportedAdapterSpecVersion } from './types'
import type {
  AdapterDiagnostic,
  AdapterException,
  AdapterManifest,
  AdapterMapping,
  AdapterResolution,
  AdapterRule,
  AdapterTarget,
  AdapterValidationOutcome,
  AdapterValidationResult,
} from './types'

type RecordValue = Record<string, unknown>

const manifestKeys = ['adapterSpecVersion', 'adapterId', 'adapterVersion', 'target', 'acceptsContractSchemaVersions', 'mappings', 'exceptions']
const targetKeys = ['id', 'version']
const decisionRuleKeys = ['kind', 'catalogId', 'contractPath', 'selectedValue']
const invariantRuleKeys = ['kind', 'catalogId', 'contractPath', 'statement', 'persistedValue']
const bindingResolutionKeys = ['kind', 'implementationRef']
const targetResolutionKeys = ['kind', 'evidenceRef']
const exceptionResolutionKeys = ['kind', 'exceptionId']
const exceptionKeys = ['id', 'catalogId', 'kind', 'rationale', 'impact', 'owner', 'review']
const reviewKeys = ['status', 'reviewer', 'reviewedAt']

const isRecord = (value: unknown): value is RecordValue => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const hasOnlyKeys = (value: RecordValue, allowed: readonly string[]): boolean => Object.keys(value).every((key) => allowed.includes(key))
const atPath = (value: unknown, path: string): unknown => path.split('.').reduce<unknown>((current, key) => isRecord(current) ? current[key] : undefined, value)
const identity = (rule: AdapterRule): string => rule.kind === 'decision'
  ? JSON.stringify([rule.kind, rule.catalogId, rule.contractPath, rule.selectedValue])
  : JSON.stringify([rule.kind, rule.catalogId, rule.contractPath, rule.statement, rule.persistedValue])

const diagnostic = (code: string, message: string, stage: AdapterDiagnostic['stage'] = 'adapter'): AdapterDiagnostic => ({ stage, code, message })

/**
 * Derives the one required target-neutral rule per catalog entry. The caller is
 * responsible for supplying the already validated current UiContract.
 */
export function deriveRequiredRules(contract: UiContract): { rules: AdapterRule[]; diagnostics: AdapterDiagnostic[] } {
  const rules: AdapterRule[] = []
  const diagnostics: AdapterDiagnostic[] = []

  for (const entry of contractCatalog) {
    const value = atPath(contract, entry.path)
    if (entry.kind === 'decision') {
      if (!isNonEmptyString(value)) {
        diagnostics.push(diagnostic('contract-decision-value-missing', `Decision ${entry.id} has no selected string at ${entry.path}.`))
        continue
      }
      rules.push({ kind: 'decision', catalogId: entry.id, contractPath: entry.path, selectedValue: value })
      continue
    }

    if (value !== undefined && typeof value !== 'string') {
      diagnostics.push(diagnostic('contract-invariant-value-invalid', `Invariant ${entry.id} has a non-string persisted value at ${entry.path}.`))
      continue
    }
    rules.push({ kind: 'invariant', catalogId: entry.id, contractPath: entry.path, statement: entry.note, persistedValue: value ?? null })
  }

  return { rules, diagnostics }
}

function parseTarget(value: unknown, diagnostics: AdapterDiagnostic[], label: string): AdapterTarget | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, targetKeys) || !isNonEmptyString(value.id) || !isNonEmptyString(value.version)) {
    diagnostics.push(diagnostic('target-shape-invalid', `${label} must contain only non-empty id and version strings.`))
    return undefined
  }
  return { id: value.id, version: value.version }
}

function parseRule(value: unknown, diagnostics: AdapterDiagnostic[], index: number): AdapterRule | undefined {
  if (!isRecord(value) || !isNonEmptyString(value.kind)) {
    diagnostics.push(diagnostic('mapping-rule-invalid', `Mapping ${index} must have a rule object with a kind.`))
    return undefined
  }
  if (value.kind === 'decision') {
    if (!hasOnlyKeys(value, decisionRuleKeys) || !isNonEmptyString(value.catalogId) || !isNonEmptyString(value.contractPath) || !isNonEmptyString(value.selectedValue)) {
      diagnostics.push(diagnostic('decision-rule-invalid', `Decision rule in mapping ${index} has an invalid shape.`))
      return undefined
    }
    return { kind: 'decision', catalogId: value.catalogId, contractPath: value.contractPath, selectedValue: value.selectedValue }
  }
  if (value.kind === 'invariant') {
    if (!hasOnlyKeys(value, invariantRuleKeys) || !isNonEmptyString(value.catalogId) || !isNonEmptyString(value.contractPath) || !isNonEmptyString(value.statement) || (value.persistedValue !== null && !isNonEmptyString(value.persistedValue))) {
      diagnostics.push(diagnostic('invariant-rule-invalid', `Invariant rule in mapping ${index} has an invalid shape.`))
      return undefined
    }
    return { kind: 'invariant', catalogId: value.catalogId, contractPath: value.contractPath, statement: value.statement, persistedValue: value.persistedValue }
  }
  diagnostics.push(diagnostic('mapping-rule-kind-invalid', `Mapping ${index} has unsupported rule kind ${value.kind}.`))
  return undefined
}

function parseResolution(value: unknown, diagnostics: AdapterDiagnostic[], index: number): AdapterResolution | undefined {
  if (!isRecord(value) || !isNonEmptyString(value.kind)) {
    diagnostics.push(diagnostic('mapping-resolution-invalid', `Mapping ${index} must have a resolution object with a kind.`))
    return undefined
  }
  if (value.kind === 'binding' && hasOnlyKeys(value, bindingResolutionKeys) && isNonEmptyString(value.implementationRef)) return { kind: 'binding', implementationRef: value.implementationRef }
  if (value.kind === 'satisfied-by-target' && hasOnlyKeys(value, targetResolutionKeys) && isNonEmptyString(value.evidenceRef)) return { kind: 'satisfied-by-target', evidenceRef: value.evidenceRef }
  if (value.kind === 'exception' && hasOnlyKeys(value, exceptionResolutionKeys) && isNonEmptyString(value.exceptionId)) return { kind: 'exception', exceptionId: value.exceptionId }
  diagnostics.push(diagnostic('mapping-resolution-invalid', `Mapping ${index} has an invalid ${value.kind} resolution.`))
  return undefined
}

function parseException(value: unknown, diagnostics: AdapterDiagnostic[], index: number): AdapterException | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, exceptionKeys) || !isNonEmptyString(value.id) || !isNonEmptyString(value.catalogId) || (value.kind !== 'unsupported' && value.kind !== 'intentional-deviation') || !isNonEmptyString(value.rationale) || !isNonEmptyString(value.impact) || !isNonEmptyString(value.owner) || !isRecord(value.review) || !hasOnlyKeys(value.review, reviewKeys)) {
    diagnostics.push(diagnostic('exception-shape-invalid', `Exception ${index} has an invalid shape.`))
    return undefined
  }
  const review = value.review
  if (review.status !== 'proposed' && review.status !== 'approved' && review.status !== 'rejected') {
    diagnostics.push(diagnostic('exception-review-status-invalid', `Exception ${value.id} has an invalid review status.`))
    return undefined
  }
  if ((review.reviewer !== undefined && !isNonEmptyString(review.reviewer)) || (review.reviewedAt !== undefined && !isNonEmptyString(review.reviewedAt))) {
    diagnostics.push(diagnostic('exception-review-metadata-invalid', `Exception ${value.id} has invalid optional review metadata.`))
    return undefined
  }
  if (review.status === 'approved' && (!isNonEmptyString(review.reviewer) || !isNonEmptyString(review.reviewedAt))) {
    diagnostics.push(diagnostic('approved-exception-review-missing', `Approved exception ${value.id} requires reviewer and reviewedAt.`))
    return undefined
  }
  return {
    id: value.id, catalogId: value.catalogId, kind: value.kind, rationale: value.rationale, impact: value.impact, owner: value.owner,
    review: { status: review.status, ...(review.reviewer === undefined ? {} : { reviewer: review.reviewer }), ...(review.reviewedAt === undefined ? {} : { reviewedAt: review.reviewedAt }) },
  }
}

function parseManifest(value: unknown, diagnostics: AdapterDiagnostic[]): AdapterManifest | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, manifestKeys) || !isNonEmptyString(value.adapterSpecVersion) || !isNonEmptyString(value.adapterId) || !isNonEmptyString(value.adapterVersion) || !Array.isArray(value.acceptsContractSchemaVersions) || value.acceptsContractSchemaVersions.length !== 1 || !isNonEmptyString(value.acceptsContractSchemaVersions[0]) || !Array.isArray(value.mappings) || !Array.isArray(value.exceptions)) {
    diagnostics.push(diagnostic('manifest-shape-invalid', 'Manifest must use the complete Phase 5 Adapter shape.'))
    return undefined
  }
  const target = parseTarget(value.target, diagnostics, 'Manifest target')
  const mappings: AdapterMapping[] = []
  value.mappings.forEach((mapping, index) => {
    if (!isRecord(mapping) || !hasOnlyKeys(mapping, ['rule', 'resolution'])) {
      diagnostics.push(diagnostic('mapping-shape-invalid', `Mapping ${index} must contain only rule and resolution.`))
      return
    }
    const rule = parseRule(mapping.rule, diagnostics, index)
    const resolution = parseResolution(mapping.resolution, diagnostics, index)
    if (rule && resolution) mappings.push({ rule, resolution })
  })
  const exceptions = value.exceptions.map((exception, index) => parseException(exception, diagnostics, index)).filter((exception): exception is AdapterException => Boolean(exception))
  if (!target || diagnostics.length) return undefined
  return {
    adapterSpecVersion: value.adapterSpecVersion as AdapterManifest['adapterSpecVersion'], adapterId: value.adapterId, adapterVersion: value.adapterVersion, target,
    acceptsContractSchemaVersions: [value.acceptsContractSchemaVersions[0] as typeof supportedAdapterContractSchemaVersion], mappings, exceptions,
  }
}

function validateCoverage(requiredRules: readonly AdapterRule[], manifest: AdapterManifest, diagnostics: AdapterDiagnostic[]): void {
  const requiredById = new Map(contractCatalog.map((entry) => [entry.id, entry]))
  const requiredIdentities = new Set(requiredRules.map(identity))
  const mappingIdentities = new Map<string, number>()
  const exceptionReferences = new Map<string, AdapterMapping[]>()
  const exceptionsById = new Map<string, AdapterException[]>()

  for (const exception of manifest.exceptions) {
    const records = exceptionsById.get(exception.id) ?? []
    records.push(exception)
    exceptionsById.set(exception.id, records)
    if (!requiredById.has(exception.catalogId)) diagnostics.push(diagnostic('exception-catalog-id-unknown', `Exception ${exception.id} references unknown catalog ID ${exception.catalogId}.`))
  }
  for (const [exceptionId, exceptions] of exceptionsById) if (exceptions.length !== 1) diagnostics.push(diagnostic('duplicate-exception', `Exception ID ${exceptionId} appears ${exceptions.length} times.`))

  for (const mapping of manifest.mappings) {
    const key = identity(mapping.rule)
    mappingIdentities.set(key, (mappingIdentities.get(key) ?? 0) + 1)
    const catalogEntry = requiredById.get(mapping.rule.catalogId)
    if (!catalogEntry) diagnostics.push(diagnostic('unknown-rule', `Mapping references unknown catalog ID ${mapping.rule.catalogId}.`))
    else validateRuleAgainstCatalog(mapping.rule, catalogEntry, requiredIdentities, diagnostics)
    if (mapping.resolution.kind === 'exception') {
      const references = exceptionReferences.get(mapping.resolution.exceptionId) ?? []
      references.push(mapping)
      exceptionReferences.set(mapping.resolution.exceptionId, references)
    }
  }

  for (const [ruleIdentity, count] of mappingIdentities) if (count > 1) diagnostics.push(diagnostic('duplicate-rule', `Rule ${ruleIdentity} appears ${count} times.`))
  for (const rule of requiredRules) {
    const count = mappingIdentities.get(identity(rule)) ?? 0
    if (count === 0) diagnostics.push(diagnostic('missing-rule', `Required rule ${identity(rule)} has no mapping.`))
  }

  for (const exception of manifest.exceptions) {
    const references = exceptionReferences.get(exception.id) ?? []
    if (references.length !== 1) diagnostics.push(diagnostic(references.length === 0 ? 'orphaned-exception' : 'duplicate-exception-reference', `Exception ${exception.id} is referenced ${references.length} times.`))
    if (references.length === 1 && references[0].rule.catalogId !== exception.catalogId) diagnostics.push(diagnostic('exception-catalog-id-mismatch', `Exception ${exception.id} must use the catalog ID of its mapping.`))
  }
  for (const [exceptionId] of exceptionReferences) if ((exceptionsById.get(exceptionId) ?? []).length !== 1) diagnostics.push(diagnostic('missing-exception', `Mapping references missing or non-unique exception ${exceptionId}.`))
}

function validateRuleAgainstCatalog(rule: AdapterRule, entry: ContractCatalogEntry, requiredIdentities: ReadonlySet<string>, diagnostics: AdapterDiagnostic[]): void {
  if (rule.kind !== entry.kind) {
    diagnostics.push(diagnostic('rule-kind-mismatch', `Rule ${entry.id} has kind ${rule.kind}; catalog requires ${entry.kind}.`))
    return
  }
  if (rule.contractPath !== entry.path) diagnostics.push(diagnostic('contract-path-mismatch', `Rule ${entry.id} has path ${rule.contractPath}; catalog requires ${entry.path}.`))
  if (!requiredIdentities.has(identity(rule))) diagnostics.push(diagnostic('stale-rule', `Rule ${entry.id} does not match the current Contract identity.`))
}

/**
 * Validates Adapter-owned structure and compatibility only. It deliberately does
 * not accept raw JSON, call importContract, resolve opaque references, or mutate
 * either input.
 */
export function validateAdapter(contract: UiContract, manifestInput: unknown, suppliedTarget: AdapterTarget): AdapterValidationResult {
  const derived = deriveRequiredRules(contract)
  if (derived.diagnostics.length) return { outcome: 'adapter-invalid', diagnostics: derived.diagnostics, requiredRules: derived.rules }

  const diagnostics: AdapterDiagnostic[] = []
  const manifest = parseManifest(manifestInput, diagnostics)
  const supplied = parseTarget(suppliedTarget, diagnostics, 'Supplied target')
  if (!manifest || !supplied) return { outcome: 'adapter-invalid', diagnostics, requiredRules: derived.rules }

  validateCoverage(derived.rules, manifest, diagnostics)
  if (diagnostics.length) return { outcome: 'adapter-invalid', diagnostics, requiredRules: derived.rules }
  if (manifest.adapterSpecVersion !== supportedAdapterSpecVersion) return { outcome: 'unsupported-adapter-spec-version', diagnostics: [diagnostic('unsupported-adapter-spec-version', `Adapter spec ${manifest.adapterSpecVersion} is not supported.`)], requiredRules: derived.rules }
  if (manifest.acceptsContractSchemaVersions[0] !== supportedAdapterContractSchemaVersion) return { outcome: 'adapter-invalid', diagnostics: [diagnostic('accepted-contract-version-invalid', `Adapter spec 0.1.0 accepts only Contract schema ${supportedAdapterContractSchemaVersion}.`)], requiredRules: derived.rules }
  if (manifest.acceptsContractSchemaVersions[0] !== contract.schemaVersion) return { outcome: 'unsupported-contract-version', diagnostics: [diagnostic('unsupported-contract-version', `Adapter does not accept Contract schema ${contract.schemaVersion}.`)], requiredRules: derived.rules }
  if (manifest.target.id !== supplied.id || manifest.target.version !== supplied.version) return { outcome: 'unsupported-target-version', diagnostics: [diagnostic('unsupported-target-version', 'Supplied target does not match the Adapter manifest target.', 'target')], requiredRules: derived.rules }

  const reviewStatuses = manifest.mappings.flatMap((mapping) => {
    if (mapping.resolution.kind !== 'exception') return []
    const exceptionId = mapping.resolution.exceptionId
    return [manifest.exceptions.find((exception) => exception.id === exceptionId)!.review.status]
  })
  const outcome: AdapterValidationOutcome = reviewStatuses.includes('rejected') ? 'incompatible'
    : reviewStatuses.includes('proposed') ? 'review-required'
      : reviewStatuses.length ? 'compatible-with-approved-exceptions'
        : 'compatible'
  return { outcome, diagnostics: [], requiredRules: derived.rules }
}
