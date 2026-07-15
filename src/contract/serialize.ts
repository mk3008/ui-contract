import type { UiContract } from './types'

export function serializeContract(contract: UiContract): string {
  return `${JSON.stringify(contract, null, 2)}\n`
}
