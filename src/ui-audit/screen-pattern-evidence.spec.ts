import { expect, test } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defaultContract } from '../contract/defaults'
import { importContract } from '../contract/import'
import { generateJson, generateMarkdown } from '../contract/output'
import { documentedScreenPatternEvidenceCapture, generateScreenPatternEvidence, generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown } from '../screen-pattern-evidence'

const screenPatternPages = ['Search/List', 'Edit Detail', 'Edit List', 'Read-only Detail', 'Destructive Action'] as const
test.use({ viewport: { width: 1440, height: 1000 } })

async function selectScreenPattern(page: import('@playwright/test').Page, label: typeof screenPatternPages[number]) {
  await page.getByRole('button', { name: 'Screen Patterns', exact: true }).click()
  await page.getByRole('button', { name: label, exact: true }).click()
  await expect(page.locator('.main-panel > .section-heading h2')).toHaveText(label)
  await expect(page.locator('[data-screen]')).toHaveCount(1)
}
async function capture(page: import('@playwright/test').Page, directory: string, name: string) { await page.screenshot({ path: join(directory, `${name}.png`), fullPage: true }) }

test('captures deterministic full-page business-screen evidence and verifies operable recovery paths', async ({ page }, testInfo) => {
  const directory = join('output', 'playwright', 'screen-pattern-evidence', testInfo.project.name || 'local', 'images')
  mkdirSync(directory, { recursive: true })
  const root = join(directory, '..')

  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  const contractBefore = await page.locator('.json-preview').innerText()
  expect(importContract(JSON.parse(contractBefore))).toMatchObject({ outcome: 'valid' })
  const currentContract = JSON.parse(contractBefore) as typeof defaultContract
  const captureConfig = {
    imageBundle: `${root.replace(/\\/g, '/')}/images`,
    generationRoute: 'src/ui-audit/screen-pattern-evidence.spec.ts',
    command: `PLAYWRIGHT_PORT=${process.env.PLAYWRIGHT_PORT ?? '4173'} npm run test:ui-audit -- screen-pattern-evidence`,
  }
  const expectedEvidence = generateScreenPatternEvidence(currentContract, captureConfig)
  writeFileSync(join(root, 'ui-contract.json'), generateJson(currentContract))
  writeFileSync(join(root, 'ui-contract.md'), generateMarkdown(currentContract))
  writeFileSync(join(root, 'screen-pattern-evidence.json'), generateScreenPatternEvidenceJson(currentContract, captureConfig))
  writeFileSync(join(root, 'screen-pattern-evidence.md'), generateScreenPatternEvidenceMarkdown(currentContract, captureConfig))

  await selectScreenPattern(page, 'Search/List')
  await expect(page.getByRole('form', { name: 'Search conditions' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  const jsonDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download evidence JSON' }).click()
  const jsonDownloadPath = join(root, 'downloaded-screen-pattern-evidence.json')
  await (await jsonDownload).saveAs(jsonDownloadPath)
  const downloadedEvidence = JSON.parse(readFileSync(jsonDownloadPath, 'utf8'))
  expect(downloadedEvidence.contract.canonicalJson).toBe(contractBefore)
  expect(downloadedEvidence.contract.canonicalJsonDigest).toBe(generateScreenPatternEvidence(currentContract).contract.canonicalJsonDigest)
  expect(downloadedEvidence.capture).toEqual(documentedScreenPatternEvidenceCapture)
  const markdownDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download evidence Markdown' }).click()
  const markdownDownloadPath = join(root, 'downloaded-screen-pattern-evidence.md')
  await (await markdownDownload).saveAs(markdownDownloadPath)
  expect(readFileSync(markdownDownloadPath, 'utf8')).toContain(`Image bundle: \`${documentedScreenPatternEvidenceCapture.imageBundle}\``)
  expect(JSON.parse(readFileSync(join(root, 'screen-pattern-evidence.json'), 'utf8'))).toEqual(expectedEvidence)
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-primary-emphasis', 'filled')
  await expect(page.getByRole('button', { name: 'Apply search' })).toHaveCSS('background-color', 'rgb(37, 99, 235)')
  await capture(page, directory, 'search-list-initial')
  await page.getByRole('button', { name: 'Apply search' }).click()
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-state', 'busy')
  await capture(page, directory, 'search-list-loading')
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByLabel('Account name').fill('none')
  await page.getByRole('button', { name: 'Apply search' }).click()
  await expect(page.getByText('No accounts match these conditions')).toBeVisible()
  await capture(page, directory, 'search-list-empty')
  await page.getByLabel('Account name').fill('error')
  await page.getByRole('button', { name: 'Apply search' }).click()
  await expect(page.getByRole('alert')).toContainText('Account results are unavailable')
  await capture(page, directory, 'search-list-error')
  await page.getByRole('button', { name: 'Retry search' }).click()
  await expect(page.getByRole('alert')).toBeHidden()

  await selectScreenPattern(page, 'Edit Detail')
  await expect(page.getByText('Harbor Supply · Account AC-2048')).toBeVisible()
  await capture(page, directory, 'edit-detail-initial')
  await page.getByLabel(/Account name/).fill('')
  await page.getByRole('button', { name: 'Save account' }).click()
  await expect(page.getByText('Review the required account name before saving.')).toBeVisible()
  await expect(page.getByLabel(/Account name/)).toHaveAttribute('aria-describedby', 'account-name-message')
  await capture(page, directory, 'edit-detail-validation')
  await page.getByLabel(/Account name/).fill('Harbor Supply updated')
  await page.getByRole('button', { name: 'Save account' }).click()
  await expect(page.getByRole('status')).toContainText('Account changes saved locally.')
  await page.getByRole('button', { name: 'Cancel changes' }).click()

  await selectScreenPattern(page, 'Edit List')
  await expect(page.getByRole('table')).toBeVisible()
  await capture(page, directory, 'edit-list-initial')
  await page.getByRole('button', { name: 'Edit assignment' }).first().click()
  await expect(page.getByRole('region', { name: 'Edit Harbor Supply assignment' })).toBeVisible()
  await capture(page, directory, 'edit-list-editing')
  await page.getByLabel('Account name').fill('')
  await page.getByRole('button', { name: 'Commit row edit' }).click()
  await expect(page.getByRole('alert')).toContainText('Enter an account name before committing.')
  await capture(page, directory, 'edit-list-validation')
  await page.getByLabel('Account name').fill('Harbor Supply revised')
  await page.getByRole('button', { name: 'Commit row edit' }).click()
  await expect(page.getByText('Harbor Supply revised', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Edit assignment' }).first().click()
  await page.getByRole('button', { name: 'Cancel row edit' }).click()

  await selectScreenPattern(page, 'Read-only Detail')
  await expect(page.getByText('Editing is unavailable for this record.')).toBeVisible()
  await capture(page, directory, 'read-only-detail-initial')
  await page.getByRole('button', { name: 'Refresh detail' }).click()
  await expect(page.getByRole('alert')).toContainText('Account detail is unavailable')
  await capture(page, directory, 'read-only-detail-error')
  await page.getByRole('button', { name: 'Retry detail' }).click()

  await selectScreenPattern(page, 'Destructive Action')
  await capture(page, directory, 'destructive-action-initial')
  await expect(page.getByRole('button', { name: 'Close account' }).first()).toHaveCSS('color', 'rgb(185, 28, 28)')
  await page.getByRole('button', { name: 'Close account' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Close account' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await capture(page, directory, 'destructive-action-confirmation')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await page.getByRole('button', { name: 'Close account' }).first().click()
  await dialog.getByRole('button', { name: 'Close account' }).click()
  await expect(page.getByRole('alert')).toContainText('Account closure did not complete')
  await capture(page, directory, 'destructive-action-error')
  await page.getByRole('button', { name: 'Retry closure' }).click()
  await expect(page.getByRole('status')).toContainText('Account closure completed locally.')
  await capture(page, directory, 'destructive-action-result')
  await expect(page.locator('.json-preview')).toHaveText(contractBefore)
})
