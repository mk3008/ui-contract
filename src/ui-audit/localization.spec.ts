import { expect, test } from '@playwright/test'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const activeViews = ['Overview', 'Button', 'Text Field', 'Select', 'Tabs', 'Toggle', 'Checkbox', 'Choice Group Layout', 'Card', 'Side Panel', 'Focus', 'Validation', 'Availability', 'State Feedback', 'Confirmation', 'Color Settings', 'Settings']
const screenPatternPages = ['Search/List', 'Edit Detail', 'Edit List', 'Read-only Detail', 'Destructive Action'] as const
const sectionedContractEditors = new Set(['Button', 'Text Field', 'Select', 'Tabs', 'Toggle', 'Checkbox', 'Card', 'Side Panel', 'Focus', 'Validation', 'Availability', 'Confirmation'])
const excludedRegionSelector = 'nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title, [data-i18n-skip], input, textarea, .select-sample-control, .select-option, .select-search-row'
const englishStructureSelector = 'nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title'
const immutableVocabulary = new Set(['Contract Editor', 'Foundation', 'Main page', 'Settings', 'Preview', 'Invariant', 'JSON', 'Markdown', 'ui-contract.json', 'ui-contract.md'])
const fixtureRecordValues = new Set(['Lumen Office', 'Pine Services', 'M. Suzuki', 'A. Tanaka'])

async function expectLocalizedPage(page: import('@playwright/test').Page, language: 'JP' | 'EN', view: string) {
  const untranslatedStructure = await page.locator(englishStructureSelector).allTextContents()
  expect(untranslatedStructure.filter((text) => /[ぁ-んァ-ン一-龯]/.test(text)), `${view} has a structural label that does not remain English`).toEqual([])
  const visibleCopy = await page.locator('main *').evaluateAll((nodes, excludedSelector) => {
    const visible = (node: Element) => {
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    }
    return nodes
      .filter((node) => visible(node) && !node.closest(excludedSelector))
      .flatMap((node) => {
        const text = node.children.length === 0 ? node.textContent?.trim() ?? '' : ''
        const attributes = ['aria-label', 'title', 'placeholder']
          .map((attribute) => node.getAttribute(attribute)?.trim() ?? '')
        return [text, ...attributes].filter(Boolean)
      })
  }, excludedRegionSelector)
  const allowed = (text: string) => immutableVocabulary.has(text) || fixtureRecordValues.has(text) || /^#?[0-9a-fA-F]{6}$/.test(text) || /^\d+$/.test(text) || /^AC-\d+$/.test(text)
  const untranslated = language === 'JP'
    ? visibleCopy.filter((text) => /^[\x20-\x7E]+$/.test(text) && !allowed(text))
    : visibleCopy.filter((text) => /[ぁ-んァ-ン一-龯]/.test(text) && !allowed(text))
  expect(untranslated, `${view} has visible ${language === 'JP' ? 'English' : 'Japanese'} non-structural copy without its language pair`).toEqual([])
}

test('audits every active view in JP and EN while preserving only structural and Contract vocabulary English', async ({ page }) => {
  await page.goto('/')
  for (const language of ['JP', 'EN'] as const) {
    await page.getByRole('button', { name: language, exact: true }).click()
    for (const view of activeViews) {
      await page.getByRole('button', { name: view, exact: true }).click()
      await expect(page.locator(view === 'Overview' ? 'main h3' : 'main h2').first()).toBeVisible()
      await expect(page.locator('nav.menu-list')).toContainText('Button')
      await expect(page.locator('nav.menu-list')).toContainText('State Feedback')
      if (view === 'Choice Group Layout') {
        await expect(page.locator('.choice-group-layout-fixed-decision .option-title')).toHaveText('Stacked by default')
        await expect(page.locator('main .section-heading .eyebrow')).toHaveText('Foundation')
        await expect(page.getByText('Constrained inline allowance', { exact: true })).toBeVisible()
      }
      if (sectionedContractEditors.has(view)) {
        await expect(page.locator('main .select-sectioned-panel')).toBeVisible()
        expect(await page.locator('main .select-policy-section-grid').count()).toBeGreaterThan(0)
      }
      await expectLocalizedPage(page, language, view)
    }
    for (const screenPattern of screenPatternPages) {
      await page.getByRole('button', { name: screenPattern, exact: true }).click()
      await expect(page.locator('.main-panel > .section-heading h2')).toHaveText(screenPattern)
      await expect(page.getByRole('tablist')).toHaveCount(0)
      await expect(page.getByText(/Each screen is a deterministic, local business-task mock|各画面は、現在の Contract を構成する決定的なローカル業務タスクモック/, { exact: true })).toHaveCount(0)
      await expectLocalizedPage(page, language, screenPattern)
    }
  }
})

test('orders the navigation as a guided, non-blocking authoring sequence', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const navigation = page.locator('nav.menu-list')
  await expect(navigation).toHaveAttribute('aria-label', 'Contract authoring navigation')
  await expect(navigation.locator('.menu-group-label')).toHaveText(['Foundations', 'Components', 'Interaction Policies', 'Screen Patterns'])
  await expect(navigation.locator('[data-authored-flow="true"] .submenu-item')).toHaveText([
    'Color Settings', 'Choice Group Layout',
    'Button', 'Text Field', 'Select', 'Toggle', 'Checkbox', 'Tabs', 'Card', 'Side Panel',
    'Focus', 'Validation', 'Availability', 'State Feedback', 'Confirmation',
    'Search/List', 'Edit Detail', 'Edit List', 'Read-only Detail', 'Destructive Action',
  ])
  await expect(navigation.locator('[data-authored-flow="true"] > .menu-item')).toHaveCount(0)
  await expect(navigation.locator('[data-authored-flow="false"] [role="separator"]')).toHaveAttribute('aria-label', 'Settings')
  await expect(navigation.locator('[data-authored-flow="false"]')).toHaveText('Settings')

  const evidenceDirectory = join('output', 'playwright', 'wizard-navigation', testInfo.project.name || 'local')
  rmSync(evidenceDirectory, { recursive: true, force: true })
  mkdirSync(evidenceDirectory, { recursive: true })
  await page.screenshot({ path: join(evidenceDirectory, 'desktop-top.png'), animations: 'disabled' })
  await page.locator('aside.sidebar').evaluate((element) => { element.scrollTop = element.scrollHeight })
  await page.screenshot({ path: join(evidenceDirectory, 'desktop-bottom.png'), animations: 'disabled' })
  await page.setViewportSize({ width: 700, height: 900 })
  await page.goto('/')
  await page.screenshot({ path: join(evidenceDirectory, 'narrow.png'), animations: 'disabled' })

  for (const target of ['Color Settings', 'Button', 'Focus', 'Search/List', 'Settings']) {
    const entry = navigation.getByRole('button', { name: target, exact: true })
    await entry.focus()
    await page.keyboard.press('Enter')
    await expect(entry).toHaveClass(/is-active/)
  }
})

test('makes Focus Policy differences visible in the preview', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('ui-contract-language', 'en'))
  await page.reload()
  await page.getByRole('button', { name: 'Focus', exact: true }).click()

  const preview = page.locator('.focus-stage')
  const keyboardFocus = preview.locator('.focus-sample-primary')
  const pointerFocus = preview.getByRole('button', { name: 'Preview', exact: true })
  await expect(preview.getByText('Keyboard focus', { exact: true })).toBeVisible()
  await expect(preview.getByText('Pointer focus', { exact: true })).toBeVisible()
  await expect(preview.getByText('Active text input', { exact: true })).toBeVisible()
  await expect(keyboardFocus).toHaveClass(/is-focused/)
  await expect(pointerFocus).toHaveClass(/is-pointer-quiet/)
  const outerRing = await keyboardFocus.evaluate((element) => {
    const style = window.getComputedStyle(element)
    return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow }
  })
  expect(outerRing).toMatchObject({ outlineWidth: '3px' })
  expect(outerRing.boxShadow).not.toBe('none')

  await page.getByText('All focused controls', { exact: true }).click()
  await expect(pointerFocus).toHaveClass(/is-focused/)
  await page.getByText('High contrast highlight', { exact: true }).click()
  const highContrast = await keyboardFocus.evaluate((element) => {
    const style = window.getComputedStyle(element)
    return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow }
  })
  expect(highContrast).toMatchObject({ outlineWidth: '4px' })
  expect(highContrast.boxShadow).not.toBe(outerRing.boxShadow)
})

test('keeps the shared editor header structural, English, and free of explanatory chrome in both locales', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('header.topbar')

  for (const language of ['JP', 'EN'] as const) {
    await page.getByRole('button', { name: language, exact: true }).click()
    await expect(header.locator('.brand-name')).toHaveText('UI Contract Editor')
    await expect(header.getByRole('heading', { name: 'Contract Workspace', exact: true })).toBeVisible()
    await expect(header.locator('.brand-subtitle, .topbar-title p')).toHaveCount(0)
    await expect(header.getByText('Business UI rules', { exact: true })).toHaveCount(0)
    await expect(header.getByText('Component and color policy are the first editable slices.', { exact: true })).toHaveCount(0)
    await expect(page.locator('.inspector, .json-preview, #contract-inspector')).toHaveCount(0)
    await expect(header.getByRole('button', { name: /Contract JSON/ })).toHaveCount(0)
    await expect(page.locator('.sidebar-card')).toHaveCount(0)
    await expect(page.getByText(language === 'JP' ? '現在の対象' : 'Current focus', { exact: true })).toHaveCount(0)
    await expect(page.getByText(language === 'JP' ? 'コンポーネントとカラー規約の編集は、焦点を絞ったプレビューにつながっています。' : 'Component and color contract editing are wired to focused previews.', { exact: true })).toHaveCount(0)
    await expect(header.locator('.topbar-actions')).toHaveCSS('flex-wrap', 'nowrap')
    await expect(header.getByRole('button', { name: language === 'JP' ? 'UI Contract を読み込む' : 'Load UI Contract' })).toBeVisible()
    await expect(header.getByRole('button', { name: language === 'JP' ? 'UI Contract を保存' : 'Save UI Contract' })).toBeVisible()
    await expect(page.locator('.overview-tagline')).toHaveCount(0)
    await expect(page.locator('.overview-hero h3')).toHaveCount(1)
    await expect(page.locator('.overview-hero h3')).toHaveText('UI Contract Editor')
    await expect(page.getByText(language === 'JP' ? '業務UIの原則を書くためのエディタです。「どうあるべきか」を定義します。' : 'An editor for writing business UI principles. It defines how the UI should behave and appear.', { exact: true })).toBeVisible()
    await expect(page.getByText(language === 'JP' ? 'UIの規約を作る' : 'Define the UI contract.', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Contract and design system', exact: true })).toBeVisible()
    await expect(page.getByText(language === 'JP' ? 'UI Contract は、プロダクト、デザイン、エンジニアリング、AIの利用者へ設計意図を伝えるため、関係する再利用可能なUIルールを具体化した、可搬で実装から独立したガードレイヤーです。完全なデザインシステム、製品仕様、CSS、テーマプリセット、コードやコンポーネント実装ではありません。デザインシステムには原則や基盤に加え、コンポーネント、パターン、ドキュメント、トークン、ツール、実装アセットも含まれます。Contract はその関連ルールを明示してエクスポート可能にしますが、デザインシステムを置き換えず、状況に応じた判断をなくしません。' : 'A UI Contract is a portable, implementation-independent guardrail layer that makes relevant reusable UI rules concrete for communicating design intent to product, design, engineering, and AI consumers. It is not a complete design system, product specification, CSS, theme preset, or code or component implementation. A design system includes principles and foundations as well as components, patterns, documentation, tokens, tools, and implementation assets. The Contract makes related rules explicit and exportable; it does not replace the design system or remove contextual judgment.', { exact: true })).toBeVisible()
  }
})

test('uses the recovered editor width without an inspector column at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 })
  await page.goto('/')
  const contentGrid = page.locator('.content-grid')
  const mainPanel = page.locator('.main-panel')
  await expect(contentGrid).toHaveCount(1)
  await expect(mainPanel).toBeVisible()
  await expect(page.locator('.inspector, .json-preview, #contract-inspector, .sidebar-card')).toHaveCount(0)
  const [gridBox, panelBox] = await Promise.all([contentGrid.boundingBox(), mainPanel.boundingBox()])
  expect(gridBox).not.toBeNull()
  expect(panelBox).not.toBeNull()
  expect(panelBox!.x).toBeGreaterThanOrEqual(gridBox!.x)
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(gridBox!.x + gridBox!.width + 0.1)
})

test('keeps the header visible while navigation and editor content scroll independently', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const header = page.locator('header.topbar')
  const sidebar = page.locator('aside.sidebar')
  const workspace = page.locator('main.workspace')
  await expect(header).toBeVisible()
  await expect(sidebar).toHaveCSS('overflow-y', 'auto')
  await expect(workspace).toHaveCSS('overflow-y', 'auto')

  const [sidebarMetrics, workspaceMetrics, pageMetrics, headerBefore] = await Promise.all([
    sidebar.evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, scrollTop: element.scrollTop })),
    workspace.evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, scrollTop: element.scrollTop })),
    page.evaluate(() => ({ clientHeight: document.scrollingElement!.clientHeight, scrollHeight: document.scrollingElement!.scrollHeight, scrollTop: document.scrollingElement!.scrollTop })),
    header.boundingBox(),
  ])
  expect(sidebarMetrics.scrollHeight).toBeGreaterThan(sidebarMetrics.clientHeight)
  expect(workspaceMetrics.scrollHeight).toBeGreaterThan(workspaceMetrics.clientHeight)
  expect(pageMetrics.scrollHeight).toBeLessThanOrEqual(pageMetrics.clientHeight + 1)
  expect(headerBefore).not.toBeNull()

  await workspace.evaluate((element) => { element.scrollTop = 240 })
  await expect.poll(() => workspace.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  const headerAfter = await header.boundingBox()
  expect(headerAfter).not.toBeNull()
  expect(Math.abs(headerAfter!.y - headerBefore!.y)).toBeLessThanOrEqual(0.1)
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBe(0)

  await sidebar.evaluate((element) => { element.scrollTop = 240 })
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  const sidebarScrollTop = await sidebar.evaluate((element) => element.scrollTop)
  await workspace.evaluate((element) => { element.scrollTop = 480 })
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBe(sidebarScrollTop)
  await expect.poll(() => page.evaluate(() => document.scrollingElement!.scrollTop)).toBe(0)
})

test('retains file import and Contract save without the Inspector', async ({ page }, testInfo) => {
  await page.goto('/')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({ name: 'loaded-contract.json', mimeType: 'application/json', buffer: readFileSync('src/contract/fixtures/valid.json') })
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'UI Contract を保存' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('ui-contract.json')
  const savedPath = testInfo.outputPath('valid.json')
  await download.saveAs(savedPath)
  expect(JSON.parse(readFileSync(savedPath, 'utf8'))).toMatchObject({ schemaVersion: '0.6.0', meta: { name: 'Business UI Contract' } })
})

test('recovers from malformed and unsupported Contract files with the existing Load control', async ({ page }) => {
  await page.goto('/')
  const input = page.locator('input[type="file"]')
  await input.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{') })
  await expect(page.getByRole('alert')).toContainText('このファイルをJSONとして読み込めませんでした。')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '別のファイルを選ぶ' }).click()
  await chooser
  await input.setInputFiles({ name: 'unsupported.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":"99.0.0"}') })
  await expect(page.getByRole('alert')).toContainText('このContractは読み込めません。')
  const recoveryChooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '別のファイルを選ぶ' }).click()
  await recoveryChooser
  await input.setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: readFileSync('src/contract/fixtures/valid.json') })
  await expect(page.getByRole('alert')).toHaveCount(0)

  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await input.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{') })
  await expect(page.getByRole('alert')).toContainText('Could not read this file as JSON.')
})
