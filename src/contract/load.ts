import { importContract } from './import'
import type { ContractLoadIssue, ContractLoadResult } from './types'

const error = (path: string, code: string, message: string): ContractLoadIssue => ({ path, code, message, severity: 'error' })
const warning = (message: string): ContractLoadIssue => ({ path: '/', code: 'migration.applied', message, severity: 'warning' })

function issueFromDiagnostic(message: string, code: string): ContractLoadIssue {
  const match = message.match(/^(\/[^:]*):\s*(.+)$/)
  return error(match?.[1] || '/', code, match?.[2] || message)
}

export function loadContract(value: unknown): ContractLoadResult {
  const result = importContract(value)
  if (!result.contract) {
    const code = result.outcome === 'unsupported-version' ? 'schema.unsupported-version' : 'schema.validation'
    return { ok: false, errors: result.diagnostics.map((message) => issueFromDiagnostic(message, code)) }
  }
  const warnings = result.outcome === 'migrated' ? result.diagnostics.map(warning) : []
  return { ok: true, contract: result.contract, warnings, migratedFrom: result.outcome === 'migrated' ? String((value as { schemaVersion?: unknown }).schemaVersion) : undefined }
}

export function loadContractJson(source: string): ContractLoadResult {
  try {
    return loadContract(JSON.parse(source))
  } catch {
    return { ok: false, errors: [error('/', 'json.parse', 'The file is not valid JSON.')] }
  }
}
