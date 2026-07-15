import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js'
import { uiContractJsonSchema } from './schema'
import type { ContractLoadIssue, UiContract } from './types'

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateSchema = ajv.compile(uiContractJsonSchema)

function issueFor(error: ErrorObject): ContractLoadIssue {
  const path = error.instancePath || error.params.additionalProperty
    ? `${error.instancePath || ''}${error.keyword === 'additionalProperties' ? `/${String(error.params.additionalProperty)}` : ''}` || '/'
    : '/'
  return {
    path,
    code: `schema.${error.keyword}`,
    message: error.message ?? 'does not satisfy the UI Contract schema',
    severity: 'error',
  }
}

export function validateCurrentContract(value: unknown): ContractLoadIssue[] {
  return validateSchema(value) ? [] : (validateSchema.errors ?? []).map(issueFor)
}

export function isUiContract(value: unknown): value is UiContract {
  return validateCurrentContract(value).length === 0
}
