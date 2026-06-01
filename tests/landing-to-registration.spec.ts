import { expect, test } from '@playwright/test'
import { createTestRunId, generateEmail, runQuiz, navigateToQuiz, MAIN_URL } from './helpers'

test('full funnel: landing → quiz → registration', async ({ page }) => {
  const testRunId = createTestRunId()

  await navigateToQuiz(page)
  await runQuiz(page)

  await page.waitForURL(url => url.href.includes('step=analyzing') || url.href.startsWith(MAIN_URL), { timeout: 15_000 })
  if (page.url().includes('step=analyzing')) {
    const btn = page.getByRole('button', { name: /continue/i })
    await expect(btn).toBeEnabled({ timeout: 20_000 })
    await btn.click()
    await page.waitForURL(url => !url.href.includes('step=analyzing'), { timeout: 25_000 })
  }

  await expect(page).toHaveURL(
    url => url.href.startsWith(MAIN_URL) && url.href.includes('step=registration'),
    { timeout: 20_000 }
  )
  await page.getByPlaceholder('Enter your email').fill(generateEmail(testRunId))
  await page.getByPlaceholder('Enter your password').fill('Test1234')
  await page.getByPlaceholder('Enter your password').blur()
  const continueBtn = page.getByRole('button', { name: /^continue$/i })
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 })
  await continueBtn.click()
  await expect(page).toHaveURL(
    url => url.href.startsWith(MAIN_URL) && url.href.includes('step=share-phone'),
    { timeout: 40_000 }
  )
})
