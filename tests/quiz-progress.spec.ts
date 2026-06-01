import { expect, test } from '@playwright/test'
import { navigateToQuiz } from './helpers'

test('quiz saves progress after page reload', async ({ page }) => {
  await navigateToQuiz(page)

  await page.locator('main .quiz-step__option').first().waitFor({ state: 'visible', timeout: 10_000 })
  const urlBefore = page.url()
  await page.locator('main .quiz-step__option').first().click()
  await page.waitForURL(u => u.href !== urlBefore, { timeout: 10_000 })
  await page.locator('main .quiz-step__option').first().waitFor({ state: 'visible', timeout: 10_000 })

  const urlBeforeReload = page.url()
  const optionTextBeforeReload = await page.locator('main .quiz-step__option').first().textContent()

  await page.reload()
  await page.waitForLoadState('domcontentloaded')

  await expect(page).toHaveURL(urlBeforeReload)
  await expect(page.locator('main .quiz-step__option').first()).toHaveText(optionTextBeforeReload!)
})
