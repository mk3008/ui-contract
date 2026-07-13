import { expect, test } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defaultContract } from '../contract/defaults'
import { importContract } from '../contract/import'
import { generateJson, generateMarkdown } from '../contract/output'
import { generateScreenPatternEvidence, generateScreenPatternEvidenceJson, generateScreenPatternEvidenceMarkdown, type ScreenPatternExampleId } from '../screen-pattern-evidence'

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
  await expect(page.locator('[data-screen]')).toHaveCount(1)
  await expect(page.locator('.topbar, .sidebar, .inspector, .interactive-screen-patterns, .artifact-app-header, .artifact-nav, .artifact-context')).toHaveCount(0)
  await expect(page.getByText('Acceptance surface', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Contract JSON', { exact: true })).toHaveCount(0)
  for (const chromeCopy of ['Northstar Operations', 'Customer administration', 'Operations team', 'Customer operations']) {
    await expect(page.getByText(chromeCopy, { exact: true })).toHaveCount(0)
  }
  for (const metaCopy of ['Submitted conditions remain visible with the result set.', 'Updating the result table for the submitted conditions.', 'The local result request did not complete. Your conditions are still available.', 'The list remains visible while this row is edited.', 'Existing context remains visible.', 'Review changes before saving.']) {
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
  rmSync(directory, { recursive: true, force: true })
  mkdirSync(directory, { recursive: true })

  await page.goto('/')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  const loadControl = page.getByRole('button', { name: 'Load UI Contract' })
  const saveControl = page.getByRole('button', { name: 'Save UI Contract' })
  await expect(loadControl).toHaveText('読込')
  await expect(saveControl).toHaveText('保存')
  await expect(loadControl).toHaveCSS('white-space', 'nowrap')
  await expect(saveControl).toHaveCSS('white-space', 'nowrap')
  const loadChooser = page.waitForEvent('filechooser')
  await loadControl.click()
  await loadChooser
  const contractSaveDownload = page.waitForEvent('download')
  await saveControl.click()
  const savedContract = await contractSaveDownload
  expect(savedContract.suggestedFilename()).toBe('ui-contract.json')
  const savedContractPath = join(root, 'downloaded-ui-contract.json')
  await savedContract.saveAs(savedContractPath)
  const contractBefore = readFileSync(savedContractPath, 'utf8')
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
  await expect(page.getByRole('button', { name: /Screen Pattern evidence/i })).toHaveCount(0)

  await openArtifact(page, 'search-list')
  await expect(page.getByRole('form', { name: 'Search conditions' })).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveCount(0)
  await captureArtifact(page, directory, 'search-list-initial')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-state', 'busy')
  const searchButton = page.getByRole('button', { name: 'Search' })
  await expect(searchButton).toHaveClass(/is-loading/)
  await expect(searchButton).toHaveAttribute('aria-busy', 'true')
  await expect(searchButton.locator('.button-loading-indicator')).toBeVisible()
  await expect(searchButton).toBeDisabled()
  await expect(page.getByRole('region', { name: 'Account results' })).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByRole('status')).toContainText('Loading accounts')
  await page.waitForTimeout(2_500)
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-state', 'busy')
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-state', 'results')
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.locator('.table-context-summary')).toContainText('4 accounts')
  const tableContextToolbar = page.locator('[data-table-context-toolbar]')
  const initialToolbarHeight = (await tableContextToolbar.boundingBox())!.height
  expect(initialToolbarHeight).toBeGreaterThan(40)
  expect(initialToolbarHeight).toBeLessThanOrEqual(52)
  await captureArtifact(page, directory, 'search-list-results')
  await openArtifact(page, 'search-list')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.locator('[data-screen="search-list"]')).toHaveAttribute('data-state', 'busy')
  await openArtifact(page, 'search-list', 'loading')
  await captureArtifact(page, directory, 'search-list-loading')
  await openArtifact(page, 'search-list')
  await page.getByLabel('Account name').fill('Meridian Logistics')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByText('No accounts found.')).toBeVisible()
  await expect(page.getByLabel('Account name')).toHaveValue('Meridian Logistics')
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await openArtifact(page, 'search-list', 'zero-results')
  await expect(page.getByText('No accounts found.')).toBeVisible()
  await expect(page.getByLabel('Account name')).toHaveValue('Meridian Logistics')
  await captureArtifact(page, directory, 'search-list-zero-results')
  await openArtifact(page, 'search-list')
  await page.getByLabel('Account name').fill('error')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByRole('alert')).toContainText('Account results are unavailable')
  await openArtifact(page, 'search-list', 'error')
  await captureArtifact(page, directory, 'search-list-error')

  await openArtifact(page, 'edit-detail')
  await captureArtifact(page, directory, 'edit-detail-initial')
  await expect(page.getByRole('button', { name: 'Cancel account changes' })).toHaveText('Cancel')
  await expect(page.getByRole('button', { name: 'Save account changes' })).toHaveText('Save')
  await page.getByLabel(/Account name/).fill('')
  await page.getByLabel(/Date of birth/).fill('2030-01-01')
  await page.getByLabel(/^Email/).fill('alex.morgan')
  await page.getByLabel(/Phone number/).fill('')
  await page.getByLabel(/Street address/).fill('')
  await page.getByLabel(/^City/).fill('')
  await page.getByLabel(/Postal code/).fill('')
  await page.getByRole('button', { name: 'Save account changes' }).click()
  await expect(page.getByText('Correct the highlighted required and invalid fields before saving.')).toBeVisible()
  await expect(page.getByLabel(/Account name/)).toHaveAttribute('aria-describedby', 'name-message')
  await expect(page.getByText('Enter a date of birth in the past.')).toBeVisible()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await expect(page.getByText('Enter a phone number.')).toBeVisible()
  await openArtifact(page, 'edit-detail', 'validation')
  await expect(page.getByText('Correct the highlighted required and invalid fields before saving.', { exact: true })).toBeVisible()
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
  await expect(page.getByLabel('Account name')).toHaveValue('Lumen Office')
  await expect(page.getByLabel('Account name')).toHaveAttribute('readonly', '')
  await expect(page.getByLabel('Date of birth')).toHaveValue('1985-11-22')
  await expect(page.getByLabel('Street address')).toHaveAttribute('readonly', '')
  await captureArtifact(page, directory, 'read-only-detail-initial')
  await page.getByRole('button', { name: 'Refresh' }).click()
  await expect(page.getByRole('alert')).toContainText('Account detail is unavailable')
  await openArtifact(page, 'read-only-detail', 'error')
  await captureArtifact(page, directory, 'read-only-detail-error')

  await openArtifact(page, 'destructive-action')
  await expect(page.getByLabel('Account name')).toHaveValue('Pine Services')
  await expect(page.getByLabel('Email')).toHaveValue('support@pine.example')
  await expect(page.getByLabel('Postal code')).toHaveValue('94111')
  await captureArtifact(page, directory, 'destructive-action-initial')
  await page.getByRole('button', { name: 'Close Pine Services' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Close Pine Services' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await openArtifact(page, 'destructive-action', 'confirmation')
  await captureArtifact(page, directory, 'destructive-action-confirmation')
  await openArtifact(page, 'destructive-action')
  await page.getByRole('button', { name: 'Close Pine Services' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Close Pine Services' }).click()
  await expect(page.getByRole('alert')).toContainText('Account closure did not complete')
  await openArtifact(page, 'destructive-action', 'error')
  await captureArtifact(page, directory, 'destructive-action-error')
  await openArtifact(page, 'destructive-action', 'error')
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByRole('status')).toContainText('Pine Services was closed.')
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

test('keeps internal metadata out of the Search/List business screen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Screen Patterns', exact: true }).click()
  await page.getByRole('button', { name: 'Search/List', exact: true }).click()

  const preview = page.locator('.interactive-example-stage [data-screen="search-list"]')
  await expect(preview).not.toContainText('Operations workspace')
  await expect(preview).not.toContainText('standard-search-list')
})

test('keeps Search/List structured content and omits paging for four visible results on wide desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Screen Patterns', exact: true }).click()
  await page.getByRole('button', { name: 'Search/List', exact: true }).click()
  const preview = page.locator('.interactive-example-stage [data-screen="search-list"]')
  const previewBox = await preview.boundingBox()
  expect(previewBox).not.toBeNull()
  expect(previewBox!.width).toBeLessThanOrEqual(1180)

  await page.goto('/?screen-artifact=search-list')
  const screen = page.locator('[data-page-artifact] [data-screen="search-list"]')
  const fields = page.locator('.search-condition-fields')
  const actions = page.locator('.search-condition-actions')
  const table = page.getByRole('table')
  await page.getByRole('button', { name: /Search|検索/ }).click()
  await expect(table).toBeVisible()
  const [screenBox, fieldsBox, actionsBox, tableBox] = await Promise.all([screen.boundingBox(), fields.boundingBox(), actions.boundingBox(), table.boundingBox()])
  expect(screenBox).not.toBeNull()
  expect(fieldsBox).not.toBeNull()
  expect(actionsBox).not.toBeNull()
  expect(tableBox).not.toBeNull()
  expect(screenBox!.width).toBeLessThanOrEqual(1180)
  expect(screenBox!.x).toBeGreaterThan(100)
  expect(actionsBox!.x).toBeGreaterThanOrEqual(fieldsBox!.x)
  expect(actionsBox!.y).toBeGreaterThanOrEqual(fieldsBox!.y + fieldsBox!.height)
  expect(actionsBox!.y - (fieldsBox!.y + fieldsBox!.height)).toBeLessThanOrEqual(24)
  expect(tableBox!.x + tableBox!.width).toBeLessThan(1820)
  await expect(page.getByRole('navigation', { name: 'Account result pages' })).toHaveCount(0)
})

test('keeps all five artifact panels content-driven and business tables compact at desktop', async ({ page }) => {
  const examples = ['search-list', 'edit-detail', 'edit-list', 'read-only-detail', 'destructive-action'] as const
  for (const example of examples) {
    await page.goto(`/?screen-artifact=${example}`)
    const screen = page.locator('[data-screen]')
    const box = await screen.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeLessThan(820)
  }

  await page.goto('/?screen-artifact=search-list')
  const fields = page.locator('.search-condition-fields')
  const actions = page.locator('.search-condition-actions')
  const [fieldsBox, actionsBox] = await Promise.all([fields.boundingBox(), actions.boundingBox()])
  expect(fieldsBox).not.toBeNull()
  expect(actionsBox).not.toBeNull()
  expect(actionsBox!.y - (fieldsBox!.y + fieldsBox!.height)).toBeLessThanOrEqual(24)

  await page.goto('/?screen-artifact=edit-list')
  const rows = page.locator('tbody tr')
  for (let index = 0; index < await rows.count(); index += 1) {
    const rowBox = await rows.nth(index).boundingBox()
    expect(rowBox).not.toBeNull()
    expect(rowBox!.height).toBeLessThan(80)
  }
})

test('keeps Japanese Edit Detail actions concise while preserving contextual accessible names', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'JP', exact: true }).click()
  await page.getByRole('button', { name: 'Screen Patterns', exact: true }).click()
  await page.getByRole('button', { name: 'Edit Detail', exact: true }).click()
  await expect(page.getByRole('button', { name: 'アカウント変更をキャンセル' })).toHaveText('キャンセル')
  await expect(page.getByRole('button', { name: 'アカウント変更を保存' })).toHaveText('保存')
  await expect(page.getByText('保存前に変更内容を確認してください。', { exact: true })).toHaveCount(0)
})

test('keeps every Screen Pattern focused on a labeled task, record, state, or action', async ({ page }) => {
  const forbiddenCopy = [
    'Find and maintain customer account records.', 'Harbor Supply · Account AC-2048', 'Lumen Office · Account AC-2049', 'Pine Services · Account AC-2050',
    'Customer account', 'View activity', 'Regional portfolio · 8 active assignments', 'Select all assignments', 'Account result pages',
  ]
  for (const example of ['search-list', 'edit-detail', 'edit-list', 'read-only-detail', 'destructive-action'] as const) {
    await page.goto(`/?screen-artifact=${example}`)
    const screen = page.locator('[data-screen]')
    for (const copy of forbiddenCopy) await expect(screen.getByText(copy, { exact: true })).toHaveCount(0)
    await expect(screen.locator('small').filter({ hasText: /^AC-\d{4}$/ })).toHaveCount(0)
  }

  await page.goto('/?screen-artifact=edit-detail')
  await expect(page.getByText(/^(Account ID|アカウント ID)$/)).toBeVisible()
  await expect(page.getByText('AC-2048', { exact: true })).toBeVisible()
  await page.goto('/?screen-artifact=read-only-detail')
  await expect(page.getByText(/^(Account ID|アカウント ID)$/)).toBeVisible()
  await expect(page.getByText('AC-2049', { exact: true })).toBeVisible()
  await page.goto('/?screen-artifact=destructive-action')
  await expect(page.getByText(/^(Account ID|アカウント ID)$/)).toBeVisible()
  await expect(page.getByText('AC-2050', { exact: true })).toBeVisible()
  const closePineServices = page.getByRole('button', { name: /^(Close Pine Services|Pine Services を閉鎖)$/ })
  await expect(closePineServices).toBeVisible()
  await closePineServices.click()
  await expect(page.getByRole('dialog').getByRole('button', { name: /^(Close Pine Services|Pine Services を閉鎖)$/ })).toBeVisible()
})
