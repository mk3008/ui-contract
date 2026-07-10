import { contractCatalog } from './catalog'

/** Versioned, transportable JSON Schema. The parser below is the runtime validator. */
export const uiContractJsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://ui-contract-editor.local/schema/ui-contract-0.1.0.json',
  title: 'UI Contract',
  type: 'object',
  required: ['schemaVersion', 'meta', 'product', 'designPolicy', 'interactionPolicy', 'componentPolicy'],
  properties: {
    schemaVersion: { const: '0.1.0' },
    meta: { type: 'object', required: ['name', 'description'], properties: { name: { type: 'string' }, description: { type: 'string' } }, additionalProperties: false },
    product: { type: 'object', required: ['systemType', 'informationDensity', 'visualTone'], properties: { systemType: { type: 'string' }, informationDensity: { type: 'string' }, visualTone: { type: 'string' } }, additionalProperties: false },
  },
  additionalProperties: false,
  $comment: `Decision paths: ${contractCatalog.filter((entry) => entry.kind === 'decision').map((entry) => entry.path).join(', ')}`,
} as const
