import { expect, test } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defaultContract } from '../contract/defaults'
import { importContract } from '../contract/import'
import { generateJson, generateMarkdown } from '../contract/output'
import { documentedScreenPatternEvidenceCapture, generateScreenPatternEvidence, generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, type ScreenPatternExampleId } from '../screen-pattern-evidence'

test.use({ viewport: { width: 1440, height: 1000 } })

function imageDimensions(path: string): { width: number; height: number } {
  const image = readFileSync(path)
  if (image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) }
  let index = 2
  while (index < image.length) {
    if (image[index] !== 0xff) { index += 1; continue }
    const marker = image[index + 1]
    index += 2
    if (marker === 0xd8 || marker === 0xd9) continue
    const length = image.readUInt16BE(index)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: image.readUInt16BE(index + 5), height: image.readUInt16BE(index + 3) }
    index += length
  }
  throw new Error(`Unsupported image format: ${path}`)
}

async function openArtifact(page: import('@playwright/test').Page, example: ScreenPatternExampleId, state?: string) {
  await page.goto(`/?screen-artifact=${example}${state ? `&state=${state}` : ''}`)
  await expect(page.locator('[data-page-artifact]')).toHaveAttribute('data-screen-pattern', example)
  await expect(page.locator('.artifact-app-header')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Application navigation' })).toBeVisible()
  await expect(page.locator('[data-screen]')).toHaveCount(1)
  await expect(page.locator('.topbar, .sidebar, .inspector, .interactive-screen-patterns')).toHaveCount(0)
  await expect(page.getByText('Acceptance surface', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Contract JSON', { exact: true })).toHaveCount(0)
  for (const metaCopy of ['Submitted conditions remain visible with the result set.', 'Updating the result table for the submitted conditions.', 'The local result request did not complete. Your conditions are still available.', 'The list remains visible while this row is edited.', 'Existing context remains visible.']) {
    await expect(page.getByText(metaCopy, { exact: true })).toHaveCount(0)
  }
  await page.evaluate(() => document.fonts.ready)
  expect(await page.locator('[data-page-artifact]').evaluate((element) => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))).toEqual({ width: 1440, height: 1000 })
}

async function captureArtifact(page: import('@playwright/test').Page, directory: string, name: string) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  const captureStyle = await page.addStyleTag({ content: 'input, textarea { caret-color: transparent !important; }' })
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
  await page.screenshot({ path: join(directory, `${name}.png`), fullPage: false, animations: 'disabled', caret: 'hide' })
  await page.screenshot({ path: join(directory, `${name}.jpg`), fullPage: false, type: 'jpeg', quality: 85, animations: 'disabled', caret: 'hide' })
  await captureStyle.evaluate((element) => element.parentNode?.removeChild(element))
}

test('exports deterministic, complete business-page PNG and JPEG evidence without editor chrome', async ({ page }, testInfo) => {
  const directory = join('output', 'playwright', 'screen-pattern-evidence', testInfo.project.name || 'local', 'images')
  const root = join(directory, '..')
  mkdirSync(directory, { recursive: true })

  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  const contractBefore = await page.locator('.json-preview').innerText()
  expect(importContract(JSON.parse(contractBefore))).toMatchObject({ outcome: 'valid' })
  const currentContract = JSON.parse(contractBefore) as typeof defaultContract
  const captureConfig = {
    imageBundle: `${root.replace(/\\/g, '/')}/images`,
    generationRoute: 'src/ui-audit/screen-pattern-evidence.spec.ts',
    captureTarget: '[data-page-artifact]',
    command: `PLAYWRIGHT_PORT=${process.env.PLAYWRIGHT_PORT ?? '4173'} npm run test:ui-audit -- screen-pattern-evidence`,
  }
  const expectedEvidence = generateScreenPatternEvidence(currentContract, captureConfig)
  writeFileSync(join(root, 'ui-contract.json'), generateJson(currentContract))
  writeFileSync(join(root, 'ui-contract.md'), generateMarkdown(currentContract))
  writeFileSync(join(root, 'screen-pattern-evidence.json'), generateScreenPatternEvidenceJson(currentContract, captureConfig))
  writeFileSync(join(root, 'screen-pattern-evidence.md'), generateScreenPatternEvidenceMarkdown(currentContract, captureConfig))

  await page.getByRole('button', { name: 'Screen Patterns', exact: true }).click()
  await page.getByRole('button', { name: 'Search/List', exact: true }).click()
  const jsonDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download evidence JSON' }).click()
  const jsonDownloadPath = join(root, 'downloaded-screen-pattern-evidence.json')
  await (await jsonDownload).saveAs(jsonDownloadPath)
  const downloadedEvidence = JSON.parse(readFileSync(jsonDownloadPath, 'utf8'))
  expect(downloadedEvidence.contract.canonicalJson).toBe(contractBefore)
  expect(downloadedEvidence.contract.canonicalJsonDigest).toBe(generateScreenPatternEvidence(currentContract).contract.canonicalJsonDigest)
  expect(downloadedEvidence.capture).toEqual(documentedScreenPatternEvidenceCapture)

  await openArtifact(page, 'search-list')
  await expect(page.getByRole('form', { name: 'Search conditions' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await captureArtifact(page, directory, 'search-list-initial')
  await page.getByRole('button', { name: 'Apply search' }).click()
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-state', 'busy')
  await openArtifact(page, 'search-list', 'loading')
  await captureArtifact(page, directory, 'search-list-loading')
  await openArtifact(page, 'search-list')
  await page.getByLabel('Account name').fill('none')
  await page.getByRole('button', { name: 'Apply search' }).click()
  await expect(page.getByText('No accounts match these conditions')).toBeVisible()
  await openArtifact(page, 'search-list', 'empty')
  await captureArtifact(page, directory, 'search-list-empty')
  await openArtifact(page, 'search-list')
  await page.getByLabel('Account name').fill('error')
  await page.getByRole('button', { name: 'Apply search' }).click()
  await expect(page.getByRole('alert')).toContainText('Account results are unavailable')
  await openArtifact(page, 'search-list', 'error')
  await captureArtifact(page, directory, 'search-list-error')

  await openArtifact(page, 'edit-detail')
  await captureArtifact(page, directory, 'edit-detail-initial')
  await page.getByLabel(/Account name/).fill('')
  await page.getByRole('button', { name: 'Save account' }).click()
  await expect(page.getByText('Review the required account name before saving.')).toBeVisible()
  await expect(page.getByLabel(/Account name/)).toHaveAttribute('aria-describedby', 'account-name-message')
  await openArtifact(page, 'edit-detail', 'validation')
  await expect(page.getByText('Review the required account name before saving.', { exact: true })).toBeVisible()
  await captureArtifact(page, directory, 'edit-detail-validation')

  await openArtifact(page, 'edit-list')
  await captureArtifact(page, directory, 'edit-list-initial')
  await page.getByRole('button', { name: 'Edit assignment' }).first().click()
  await expect(page.getByRole('region', { name: 'Edit Harbor Supply assignment' })).toBeVisible()
  await openArtifact(page, 'edit-list', 'editing')
  await captureArtifact(page, directory, 'edit-list-editing')
  await openArtifact(page, 'edit-list')
  await page.getByRole('button', { name: 'Edit assignment' }).first().click()
  await page.getByLabel('Account name').fill('')
  await page.getByRole('button', { name: 'Save assignment' }).click()
  await expect(page.getByRole('alert')).toContainText('Enter an account name before saving.')
  await openArtifact(page, 'edit-list', 'validation')
  await expect(page.getByRole('alert')).toContainText('Enter an account name before saving.')
  await captureArtifact(page, directory, 'edit-list-validation')

  await openArtifact(page, 'read-only-detail')
  await captureArtifact(page, directory, 'read-only-detail-initial')
  await page.getByRole('button', { name: 'Refresh detail' }).click()
  await expect(page.getByRole('alert')).toContainText('Account detail is unavailable')
  await openArtifact(page, 'read-only-detail', 'error')
  await captureArtifact(page, directory, 'read-only-detail-error')

  await openArtifact(page, 'destructive-action')
  await captureArtifact(page, directory, 'destructive-action-initial')
  await page.getByRole('button', { name: 'Close account' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Close account' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await openArtifact(page, 'destructive-action', 'confirmation')
  await captureArtifact(page, directory, 'destructive-action-confirmation')
  await openArtifact(page, 'destructive-action')
  await page.getByRole('button', { name: 'Close account' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Close account' }).click()
  await expect(page.getByRole('alert')).toContainText('Account closure did not complete')
  await openArtifact(page, 'destructive-action', 'error')
  await captureArtifact(page, directory, 'destructive-action-error')
  await openArtifact(page, 'destructive-action', 'error')
  await page.getByRole('button', { name: 'Retry closure' }).click()
  await expect(page.getByRole('status')).toContainText('Account closure completed.')
  await openArtifact(page, 'destructive-action', 'result')
  await captureArtifact(page, directory, 'destructive-action-result')

  for (const state of expectedEvidence.examples.flatMap((example) => example.states)) {
    expect(existsSync(join(root, state.png))).toBe(true)
    expect(existsSync(join(root, state.jpeg))).toBe(true)
    expect(imageDimensions(join(root, state.png))).toEqual(expectedEvidence.viewport)
    expect(imageDimensions(join(root, state.jpeg))).toEqual(expectedEvidence.viewport)
  }
  expect(JSON.parse(readFileSync(join(root, 'screen-pattern-evidence.json'), 'utf8'))).toEqual(expectedEvidence)
  expect(readFileSync(join(root, 'screen-pattern-evidence.md'), 'utf8')).toContain('JPEG')
})
