export type Schema = Record<string, unknown>

export const idPattern = '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'
export const semverPattern = '^(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)(?:-[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$'
export const digestPattern = '^sha256:[0-9a-f]{64}$'
export const identifier: Schema = { type: 'string', pattern: idPattern }
export const version: Schema = { type: 'string', pattern: semverPattern }
export const digest: Schema = { type: 'string', pattern: digestPattern }
export const text: Schema = { type: 'string', minLength: 1 }
export const stringArray = (): Schema => ({ type: 'array', items: text })
export const strictObject = (properties: Record<string, Schema>): Schema => ({ type: 'object', required: Object.keys(properties), properties, additionalProperties: false })
