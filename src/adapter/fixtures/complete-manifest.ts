import { defaultContract } from '../../contract/defaults'
import type { AdapterManifest, AdapterTarget } from '../types'
import { deriveRequiredRules } from '../validate'

export const syntheticTarget: AdapterTarget = { id: 'sample-target', version: '2026.07' }

/** Uses intentionally opaque fixture references, not framework or library APIs. */
export function createCompleteManifest(): AdapterManifest {
  return {
    adapterSpecVersion: '0.1.0',
    adapterId: 'sample-adapter',
    adapterVersion: '1.0.0',
    target: { ...syntheticTarget },
    acceptsContractSchemaVersions: ['0.3.0'],
    mappings: deriveRequiredRules(defaultContract).rules.map((rule, index) => ({ rule, resolution: { kind: 'binding', implementationRef: `opaque-binding-${index + 1}` } })),
    exceptions: [],
  }
}
