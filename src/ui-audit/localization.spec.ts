import { expect, test } from '@playwright/test'

const activeViews = ['Overview', 'Button', 'Text Field', 'Select', 'Tabs', 'Toggle', 'Checkbox', 'Radio Group', 'Card', 'Side Panel', 'Focus', 'Validation', 'Availability', 'State Feedback', 'Confirmation', 'Color Settings', 'Screen Patterns']
const excludedRegionSelector = 'nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title, .json-preview, [data-i18n-skip], input, textarea, .select-sample-control, .select-option, .select-search-row'
const englishStructureSelector = 'nav, h1, h2, h3, h4, h5, h6, .eyebrow, .select-column-label, .option-title'
const immutableVocabulary = new Set(['Contract Editor', 'Main page', 'Editable', 'Settings', 'Preview', 'Invariant', 'JSON', 'Markdown', 'ui-contract.json', 'ui-contract.md'])

test('audits every active view in JP and EN while preserving only structural and Contract vocabulary English', async ({ page }) => {
  await page.goto('/')
  for (const language of ['JP', 'EN'] as const) {
    await page.getByRole('button', { name: language, exact: true }).click()
    for (const view of activeViews) {
      await page.getByRole('button', { name: view, exact: true }).click()
      await expect(page.locator('main h2').first()).toBeVisible()
      await expect(page.getByRole('navigation')).toContainText('Button')
      await expect(page.getByRole('navigation')).toContainText('State Feedback')
      if (view === 'Screen Patterns') {
        await expect(page.getByText('Grouped form section', { exact: true })).toBeVisible()
        await expect(page.getByText('Account details', { exact: true })).toBeVisible()
        await expect(page.getByText(language === 'JP' ? '明確に分けたアクション領域' : 'Distinct action area', { exact: true })).toBeVisible()
      }
      if (view === 'Radio Group') {
        await expect(page.locator('.radio-group-fixed-decision .option-title')).toHaveText('Visible-label radio group')
        await expect(page.getByText(language === 'JP' ? '選択済みの例' : 'Selected example', { exact: true })).toBeVisible()
      }
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
  }
})
