import { contractCatalog } from './catalog'
import { serializeContract } from './serialize'
import type { UiContract } from './types'

export function generateJson(contract: UiContract): string { return serializeContract(contract) }

export function generateMarkdown(contract: UiContract): string {
  const lines = [`# ${contract.meta.name}`, '', contract.meta.description, '', `Schema version: \`${contract.schemaVersion}\``, '', '## Product', '', `- System type: ${contract.product.systemType}`, `- Information density: ${contract.product.informationDensity}`, `- Visual tone: ${contract.product.visualTone}`, '', '## Fixed rules', '']
  for (const rule of contractCatalog.filter((entry) => entry.kind === 'invariant')) {
    lines.push(`### ${rule.label}`, '', rule.note, '')
    if (rule.guidance?.length) {
      lines.push('Before creating or changing a screen layout:', '')
      rule.guidance.forEach((step, index) => lines.push(`${index + 1}. ${step}`))
      lines.push('')
    }
  }
  lines.push('## Design decisions', '')
  for (const [section, policy] of [['Foundations', contract.designPolicy], ['Interaction policy', contract.interactionPolicy], ['Component policy', contract.componentPolicy], ['Screen patterns', contract.screenPatternPolicy]] as const) {
    lines.push(`### ${section}`, '')
    const flatten = (value: unknown, prefix = ''): Array<[string, string]> => value && typeof value === 'object' ? Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key)) : [[prefix, String(value)]]
    for (const [key, value] of flatten(policy)) lines.push(`- ${key}: \`${value}\``)
    lines.push('')
  }
  return `${lines.join('\n').trimEnd()}\n`
}
