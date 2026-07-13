import type { UiContract } from './contract/types'
import { generateJson } from './contract/output'

export const screenPatternExampleIds = ['search-list', 'edit-detail', 'edit-list', 'read-only-detail', 'destructive-action'] as const
export type ScreenPatternExampleId = typeof screenPatternExampleIds[number]

export type ScreenPatternEvidenceCapture = { imageBundle: string; generationRoute: string; captureTarget: string; command: string }
type EvidenceState = { id: string; uiState: string; route: string; png: string; jpeg: string }
type EvidenceExample = { id: ScreenPatternExampleId; fixture: { seed: 'screen-pattern-fixtures-v1'; clock: '2026-07-13T09:00:00Z' }; composes: string[]; states: EvidenceState[] }
export type ScreenPatternEvidence = { artifactVersion: '2.0.0'; artifactKind: 'screen-pattern-acceptance-evidence'; viewport: { width: 1440; height: 1000 }; browser: 'chromium'; capture: ScreenPatternEvidenceCapture; contract: { canonicalJson: string; canonicalJsonDigest: string; schemaVersion: string }; examples: EvidenceExample[] }

export const documentedScreenPatternEvidenceCapture: ScreenPatternEvidenceCapture = {
  imageBundle: 'output/playwright/screen-pattern-evidence/<project>/images',
  generationRoute: 'src/ui-audit/screen-pattern-evidence.spec.ts',
  captureTarget: '[data-page-artifact]',
  command: 'PLAYWRIGHT_PORT=<port> npm run test:ui-audit -- screen-pattern-evidence',
}

function digest(value: string): string { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619) } return `fnv1a-32:${(hash >>> 0).toString(16).padStart(8, '0')}` }
const shared = ['designPolicy.color', 'componentPolicy.button', 'interactionPolicy.focus', 'interactionPolicy.loading.feedback', 'interactionPolicy.stateFeedback.guidance']

export function generateScreenPatternEvidence(contract: UiContract, capture: ScreenPatternEvidenceCapture = documentedScreenPatternEvidenceCapture): ScreenPatternEvidence {
  const canonicalJson = generateJson(contract)
  const images = (id: ScreenPatternExampleId, states: Array<[string, string]>) => states.map(([state, uiState]) => ({ id: state, uiState, route: `/?screen-artifact=${id}${state !== 'initial' ? `&state=${state}` : ''}`, png: `images/${id}-${state}.png`, jpeg: `images/${id}-${state}.jpg` }))
  return { artifactVersion: '2.0.0', artifactKind: 'screen-pattern-acceptance-evidence', viewport: { width: 1440, height: 1000 }, browser: 'chromium', capture, contract: { canonicalJson, canonicalJsonDigest: digest(canonicalJson), schemaVersion: contract.schemaVersion }, examples: [
    { id: 'search-list', fixture: { seed: 'screen-pattern-fixtures-v1', clock: '2026-07-13T09:00:00Z' }, composes: [...shared, 'screenPatternPolicy.searchList', 'componentPolicy.textField', 'componentPolicy.checkbox'], states: images('search-list', [['initial', 'results'], ['loading', 'busy'], ['empty', 'empty'], ['error', 'error']]) },
    { id: 'edit-detail', fixture: { seed: 'screen-pattern-fixtures-v1', clock: '2026-07-13T09:00:00Z' }, composes: [...shared, 'screenPatternPolicy.formSection', 'interactionPolicy.validation'], states: images('edit-detail', [['initial', 'initial'], ['validation', 'validation']]) },
    { id: 'edit-list', fixture: { seed: 'screen-pattern-fixtures-v1', clock: '2026-07-13T09:00:00Z' }, composes: [...shared, 'screenPatternPolicy.searchList', 'screenPatternPolicy.formSection', 'interactionPolicy.validation'], states: images('edit-list', [['initial', 'initial'], ['editing', 'editing'], ['validation', 'validation']]) },
    { id: 'read-only-detail', fixture: { seed: 'screen-pattern-fixtures-v1', clock: '2026-07-13T09:00:00Z' }, composes: [...shared, 'screenPatternPolicy.formSection', 'interactionPolicy.availability'], states: images('read-only-detail', [['initial', 'initial'], ['error', 'error']]) },
    { id: 'destructive-action', fixture: { seed: 'screen-pattern-fixtures-v1', clock: '2026-07-13T09:00:00Z' }, composes: [...shared, 'interactionPolicy.confirmation', 'componentPolicy.button'], states: images('destructive-action', [['initial', 'initial'], ['confirmation', 'confirmation'], ['error', 'error'], ['result', 'done']]) },
  ] }
}
export function generateScreenPatternEvidenceJson(contract: UiContract, capture?: ScreenPatternEvidenceCapture): string { return `${JSON.stringify(generateScreenPatternEvidence(contract, capture), null, 2)}\n` }
export function generateScreenPatternEvidenceMarkdown(contract: UiContract, capture?: ScreenPatternEvidenceCapture): string { const evidence = generateScreenPatternEvidence(contract, capture); const lines = ['# Screen pattern acceptance evidence', '', `Contract digest: \`${evidence.contract.canonicalJsonDigest}\``, `Contract JSON: \`ui-contract.json\``, `Viewport: \`${evidence.viewport.width}x${evidence.viewport.height}\``, `Browser: \`${evidence.browser}\``, `Image bundle: \`${evidence.capture.imageBundle}\``, `Generation route: \`${evidence.capture.generationRoute}\``, `Capture target: \`${evidence.capture.captureTarget}\``, `Command: \`${evidence.capture.command}\``, '']; for (const example of evidence.examples) lines.push(`## ${example.id}`, '', `Fixture: \`${example.fixture.seed}\` at \`${example.fixture.clock}\``, '', ...example.states.map((state) => `- \`${state.id}\` (${state.uiState}) via \`${state.route}\`: PNG \`${state.png}\`, JPEG \`${state.jpeg}\``), ''); return `${lines.join('\n').trimEnd()}\n` }
