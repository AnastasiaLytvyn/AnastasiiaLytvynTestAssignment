import { expect, type Page } from '@playwright/test'

if (!process.env.BASE_URL) {
  throw new Error('BASE_URL is not set. Add it to your .env file.')
}
if (!process.env.MAIN_URL) {
  throw new Error('MAIN_URL is not set. Add it to your .env file.')
}
export const BASE_URL = process.env.BASE_URL.replace(/\/$/, '')
export const MAIN_URL = process.env.MAIN_URL.replace(/\/$/, '')

// ─── Test data ────────────────────────────────────────────────────────────────

export function createTestRunId(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6)
  return `${mm}${dd}${hh}${min}${rand}`
}

export function generateEmail(testRunId: string): string {
  return `test.data+${testRunId}@mailinator.com`
}

// ─── Step handlers ────────────────────────────────────────────────────────────

export async function handleContinue(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /continue/i })
  await expect(btn).toBeEnabled({ timeout: 10_000 })
  await btn.click()
}

export async function handleFirstOption(page: Page): Promise<void> {
  const quizOption = page.locator('main .quiz-step__option').first()
  if (await quizOption.isVisible({ timeout: 500 }).catch(() => false)) {
    await quizOption.click()
    return
  }
  await page.locator('main button').filter({ hasNotText: /continue/i }).first().click()
}

export async function handleStateCounty(page: Page): Promise<void> {
  await page.getByText('keyboard_arrow_down').first().click()
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5_000 })
  await page.getByRole('option').first().click()

  await expect(page.getByRole('textbox', { name: /your county/i })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('textbox', { name: /your county/i }).click()
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10_000 })
  await page.getByRole('option').first().click()
  await page.waitForTimeout(500)

  await handleContinue(page)
}

export async function handleName(page: Page): Promise<void> {
  await expect(page.getByTestId('quiz-input-first_name')).toBeVisible({ timeout: 10_000 })
  await page.getByTestId('quiz-input-first_name').fill('Fake')
  await page.getByTestId('quiz-input-last_name').fill('Data')
  const btn = page.getByTestId('quiz-form-continue-btn')
  await expect(btn).toBeEnabled({ timeout: 5_000 })
  await btn.click()
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export async function navigateToQuiz(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('.hero-section__cta').click()
  await page.waitForURL(/step=/, { timeout: 10_000 })
  if (page.url().includes('step=intro')) {
    await handleContinue(page)
  }
}

// ─── Quiz runner ──────────────────────────────────────────────────────────────

export async function runQuiz(page: Page): Promise<void> {
  for (let step = 0; step < 25; step++) {
    const urlBefore = page.url()

    if (!urlBefore.startsWith(BASE_URL)) break
    if (urlBefore.includes('step=analyzing')) break

    await page
      .locator('main button, main .quiz-step__option, main input, main mat-select')
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })

    if (await page.getByTestId('quiz-input-first_name').isVisible({ timeout: 500 }).catch(() => false)) {
      await handleName(page)
      break
    }

    if (await page.locator('mat-select').count() > 0) {
      await handleStateCounty(page)
    } else if (await page.locator('main .quiz-step__option').count() > 0) {
      await handleFirstOption(page)
    } else if (await page.locator('main button').filter({ hasNotText: /continue/i }).count() > 0) {
      await handleFirstOption(page)
    } else {
      await handleContinue(page)
    }

    await page.waitForURL(u => u.href !== urlBefore, { timeout: 10_000 })
      .catch(() => console.warn('URL did not change after action — possible SPA transition'))
  }
}
