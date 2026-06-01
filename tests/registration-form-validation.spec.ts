import { expect, test } from '@playwright/test'
import { createTestRunId, generateEmail, runQuiz, navigateToQuiz, MAIN_URL } from './helpers'

test.describe('registration form', () => {
  test.beforeEach(async ({ page }) => {
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
  })

  test('empty form — continue button is disabled', async ({ page }) => {
    const continueBtn = page.getByRole('button', { name: /^continue$/i })

    await expect(continueBtn).toBeDisabled()
  })

  test('invalid email — continue button stays disabled', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill('test.com')
    await page.getByPlaceholder('Enter your email').blur()
    await page.getByPlaceholder('Enter your password').fill('Test1234')

    const continueBtn = page.getByRole('button', { name: /^continue$/i })
    await expect(continueBtn).toBeDisabled()
    await expect(page.locator('mat-form-field').filter({ has: page.getByPlaceholder('Enter your email') }))
      .toHaveClass(/mat-form-field-invalid/)
  })

  test('password too short — continue button stays disabled', async ({ page }) => {
    const testRunId = createTestRunId()

    await page.getByPlaceholder('Enter your email').fill(generateEmail(testRunId))
    await page.getByPlaceholder('Enter your password').fill('abc')
    await page.getByPlaceholder('Enter your password').blur()

    const continueBtn = page.getByRole('button', { name: /^continue$/i })
    await expect(continueBtn).toBeDisabled()
    await expect(page.locator('mat-form-field').filter({ has: page.getByPlaceholder('Enter your password') }))
      .toHaveClass(/mat-form-field-invalid/)
  })
})
