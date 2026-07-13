import { expect, test } from '@playwright/test'

const activeViews = ['Overview', 'Button', 'Text Field', 'Select', 'Tabs', 'Toggle', 'Checkbox', 'Choice Group Layout', 'Card', 'Side Panel', 'Focus', 'Validation', 'Availability', 'State Feedback', 'Confirmation', 'Color Settings', 'Screen Patterns']
const screenPatternPages = ['Search/List', 'Edit Detail', 'Edit List', 'Read-only Detail', 'Destructive Action'] as const
const sectionedContractEditors = new Set(['Button', 'Text Field', 'Select', 'Tabs', 'Toggle', 'Checkbox', 'Card', 'Side Panel', 'Focus', 'Validation', 'Availability', 'Confirmation'])
const excludedRegionSelector = 'nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title, .json-preview, [data-i18n-skip], input, textarea, .select-sample-control, .select-option, .select-search-row'
const englishStructureSelector = 'nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title'
const immutableVocabulary = new Set(['Contract Editor', 'Foundation', 'Main page', 'Editable', 'Settings', 'Preview', 'Invariant', 'JSON', 'Markdown', 'ui-contract.json', 'ui-contract.md'])

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
  const allowed = (text: string) => immutableVocabulary.has(text) || /^#?[0-9a-fA-F]{6}$/.test(text) || /^\d+$/.test(text)
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
      await expect(page.locator('main h2').first()).toBeVisible()
      await expect(page.locator('nav.menu-list')).toContainText('Button')
      await expect(page.locator('nav.menu-list')).toContainText('State Feedback')
      if (view === 'Screen Patterns') {
        for (const screenPattern of screenPatternPages) {
          await page.getByRole('button', { name: screenPattern, exact: true }).click()
          await expect(page.locator('.main-panel > .section-heading h2')).toHaveText(screenPattern)
          await expect(page.getByRole('tablist')).toHaveCount(0)
          await expect(page.getByText(language === 'JP' ? '各画面は、現在の Contract を構成する決定的なローカル業務タスクモックです。フィクスチャのデータと結果は Contract ポリシーではありません。' : 'Each screen is a deterministic, local business-task mock that composes the current Contract. Fixture data and outcomes are not Contract policy.', { exact: true })).toBeVisible()
          await expectLocalizedPage(page, language, screenPattern)
        }
      }
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
  }
})
