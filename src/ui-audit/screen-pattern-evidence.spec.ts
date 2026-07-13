import { expect, test } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defaultContract } from '../contract/defaults'
import { importContract } from '../contract/import'
import { generateJson, generateMarkdown } from '../contract/output'
import { generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown } from '../screen-pattern-evidence'

const screenPatternPages = ['Search/List', 'Edit Detail', 'Edit List', 'Read-only Detail', 'Destructive Action'] as const

async function selectScreenPattern(page: import('@playwright/test').Page, label: typeof screenPatternPages[number]) {
  await page.getByRole('button', { name: 'Screen Patterns', exact: true }).click()
  await page.getByRole('button', { name: label, exact: true }).click()
  await expect(page.locator('.main-panel > .section-heading h2')).toHaveText(label)
  await expect(page.getByRole('tablist')).toHaveCount(0)
}

test('captures deterministic local screen-pattern evidence after semantic interaction assertions', async ({ page }, testInfo) => {
  const runDirectory = join('output', 'playwright', 'screen-pattern-evidence', testInfo.project.name || 'local')
  const imagesDirectory = join(runDirectory, 'images')
  mkdirSync(imagesDirectory, { recursive: true })
  writeFileSync(join(runDirectory, 'ui-contract.json'), generateJson(defaultContract))
  writeFileSync(join(runDirectory, 'ui-contract.md'), generateMarkdown(defaultContract))
  writeFileSync(join(runDirectory, 'screen-pattern-evidence.json'), generateScreenPatternEvidenceJson())
  writeFileSync(join(runDirectory, 'screen-pattern-evidence.md'), generateScreenPatternEvidenceMarkdown())

  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('.json-preview')).toBeVisible()
  const contractBefore = await page.locator('.json-preview').innerText()
  const markdownBefore = generateMarkdown(defaultContract)
  expect(importContract(JSON.parse(contractBefore))).toMatchObject({ outcome: 'valid' })
  await selectScreenPattern(page, 'Search/List')
  await expect(page.locator('[data-example="search-list"]')).toBeVisible()
  const evidenceJsonDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download evidence JSON', exact: true }).click()
  expect((await evidenceJsonDownload).suggestedFilename()).toBe('screen-pattern-evidence.json')
  const evidenceMarkdownDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download evidence Markdown', exact: true }).click()
  expect((await evidenceMarkdownDownload).suggestedFilename()).toBe('screen-pattern-evidence.md')

  await expect(page.getByText('Loading results', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Search results' })).toBeVisible()
  await page.getByRole('checkbox').check()
  await expect(page.getByRole('button', { name: 'Apply local bulk action', exact: true })).toBeVisible()
  await page.locator('[data-example="search-list"]').screenshot({ path: join(imagesDirectory, 'search-list-results.png') })
  await page.getByRole('button', { name: 'Show empty', exact: true }).click()
  await expect(page.getByText('No results', { exact: true })).toBeVisible()
  await page.locator('[data-example="search-list"]').screenshot({ path: join(imagesDirectory, 'search-list-empty.png') })
  await page.getByRole('button', { name: 'Show error', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Results are unavailable')
  await page.locator('[data-example="search-list"]').screenshot({ path: join(imagesDirectory, 'search-list-error.png') })

  await selectScreenPattern(page, 'Edit Detail')
  await page.getByRole('button', { name: 'Save local change', exact: true }).click()
  await expect(page.getByText('Review the field message before saving.', { exact: true })).toBeVisible()
  await page.locator('[data-example="edit-detail"]').screenshot({ path: join(imagesDirectory, 'edit-detail-validation.png') })
  await page.getByLabel('Detail value').fill('Corrected value')
  await page.getByRole('button', { name: 'Save local change', exact: true }).click()
  await expect(page.getByText('Local change saved.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel and reset', exact: true }).click()
  await expect(page.getByLabel('Detail value')).toHaveValue('')

  await selectScreenPattern(page, 'Edit List')
  await page.getByRole('checkbox').check()
  await expect(page.getByText('Selected', { exact: true })).toBeVisible()
  await page.locator('[data-example="edit-list"]').screenshot({ path: join(imagesDirectory, 'edit-list-selection.png') })
  await page.getByRole('button', { name: 'Edit row', exact: true }).click()
  await page.getByLabel('Row value', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Save row', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Enter a value before saving.')
  await page.getByLabel('Row value', { exact: true }).fill('Corrected row value')
  await page.getByRole('button', { name: 'Save row', exact: true }).click()
  await expect(page.getByText('Corrected row value', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Edit row', exact: true }).click()
  await page.getByLabel('Row value', { exact: true }).fill('Discarded row value')
  await page.getByRole('button', { name: 'Cancel row edit', exact: true }).click()
  await expect(page.getByText('Corrected row value', { exact: true })).toBeVisible()

  await selectScreenPattern(page, 'Read-only Detail')
  await expect(page.getByLabel('Reference value')).toHaveAttribute('readonly', '')
  await page.locator('[data-example="read-only-detail"]').screenshot({ path: join(imagesDirectory, 'read-only-detail.png') })

  await selectScreenPattern(page, 'Destructive Action')
  await page.getByRole('button', { name: 'Start local destructive action', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.locator('[data-example="destructive-action"]').screenshot({ path: join(imagesDirectory, 'destructive-confirmation.png') })
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Start local destructive action', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.getByText('Local destructive action confirmed.', { exact: true })).toBeVisible()
  await expect(page.locator('.json-preview')).toHaveText(contractBefore)
  expect(generateMarkdown(defaultContract)).toBe(markdownBefore)
})
