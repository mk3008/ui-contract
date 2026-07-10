import type { UiContract } from './types'

export function generateJson(contract: UiContract): string { return `${JSON.stringify(contract, null, 2)}\n` }

export function generateMarkdown(contract: UiContract): string {
  const lines = [`# ${contract.meta.name}`, '', contract.meta.description, '', `Schema version: \`${contract.schemaVersion}\``, '', '## Product', '', `- System type: ${contract.product.systemType}`, `- Information density: ${contract.product.informationDensity}`, `- Visual tone: ${contract.product.visualTone}`, '', '## Design decisions', '']
  for (const [section, policy] of [['Foundations', contract.designPolicy], ['Interaction policy', contract.interactionPolicy], ['Component policy', contract.componentPolicy]] as const) {
    lines.push(`### ${section}`, '')
    const flatten = (value: unknown, prefix = ''): Array<[string, string]> => value && typeof value === 'object' ? Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key)) : [[prefix, String(value)]]
    for (const [key, value] of flatten(policy)) lines.push(`- ${key}: \`${value}\``)
    lines.push('')
  }
  return `${lines.join('\n').trimEnd()}\n`
}
