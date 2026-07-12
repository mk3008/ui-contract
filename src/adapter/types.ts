export const supportedAdapterSpecVersion = '0.1.0' as const
/** Adapter 0.1 validates the current Contract shape only; no version range is accepted. */
export const supportedAdapterContractSchemaVersion = '0.4.0' as const

export type AdapterTarget = { id: string; version: string }

export type DecisionAdapterRule = {
  kind: 'decision'
  catalogId: string
  contractPath: string
  selectedValue: string
}

export type InvariantAdapterRule = {
  kind: 'invariant'
  catalogId: string
  contractPath: string
  statement: string
  persistedValue: string | null
}

export type AdapterRule = DecisionAdapterRule | InvariantAdapterRule

export type AdapterResolution =
  | { kind: 'binding'; implementationRef: string }
  | { kind: 'satisfied-by-target'; evidenceRef: string }
  | { kind: 'exception'; exceptionId: string }

export type AdapterMapping = { rule: AdapterRule; resolution: AdapterResolution }

export type AdapterException = {
  id: string
  catalogId: string
  kind: 'unsupported' | 'intentional-deviation'
  rationale: string
  impact: string
  owner: string
  review: {
    status: 'proposed' | 'approved' | 'rejected'
    reviewer?: string
    reviewedAt?: string
  }
}

/** The target-neutral Phase 5 Adapter manifest. References remain opaque strings. */
export type AdapterManifest = {
  adapterSpecVersion: typeof supportedAdapterSpecVersion
  adapterId: string
  adapterVersion: string
  target: AdapterTarget
  acceptsContractSchemaVersions: readonly [typeof supportedAdapterContractSchemaVersion]
  mappings: AdapterMapping[]
  exceptions: AdapterException[]
}

export type AdapterDiagnosticStage = 'contract' | 'adapter' | 'target'

export type AdapterDiagnostic = {
  stage: AdapterDiagnosticStage
  code: string
  message: string
}

/** Includes the full Phase 5 taxonomy; this pure entry point cannot produce raw-input outcomes. */
export type AdapterValidationOutcome =
  | 'contract-invalid'
  | 'contract-unsupported-version'
  | 'adapter-invalid'
  | 'unsupported-contract-version'
  | 'unsupported-adapter-spec-version'
  | 'unsupported-target-version'
  | 'compatible'
  | 'compatible-with-approved-exceptions'
  | 'review-required'
  | 'incompatible'
  | 'target-invalid'

export type AdapterValidationResult = {
  outcome: AdapterValidationOutcome
  diagnostics: readonly AdapterDiagnostic[]
  requiredRules: readonly AdapterRule[]
}
