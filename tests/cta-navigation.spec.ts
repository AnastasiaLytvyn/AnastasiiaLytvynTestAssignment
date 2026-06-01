import { test, expect, type Page, type Locator } from '@playwright/test'

const ctaButtons: Array<{ name: string; locator: (page: Page) => Locator }> = [
  {
    name: 'Get Started (header)',
    locator: (page) =>
      page.locator('header').getByRole('button', { name: /get started/i }),
  },
  {
    name: 'Check Eligibility (hero)',
    locator: (page) =>
      page
        .getByRole('region', { name: /hero/i })
        .getByRole('button', { name: /check eligibility/i }),
  },
  {
    name: 'Check Eligibility (steps)',
    locator: (page) =>
      page
        .getByRole('region', { name: /how it works/i })
        .getByRole('button', { name: /check eligibility/i }),
  },
  {
    name: 'Get Started (body)',
    locator: (page) =>
      page.locator('main').getByRole('button', { name: /get started/i }),
  },
  {
    name: 'Check Eligibility (benefits)',
    locator: (page) =>
      page
        .getByRole('region', { name: /benefits/i })
        .getByRole('button', { name: /check eligibility/i }),
  },
  {
    name: 'Check Eligibility (footer)',
    locator: (page) =>
      page
        .locator('footer')
        .getByRole('button', { name: /check eligibility/i }),
  },
]

test.describe('landing page CTAs open quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const btn of ctaButtons) {
    test(`CTA → ${btn.name} opens quiz`, async ({ page }, testInfo) => {
      test.skip(
        btn.name === 'Get Started (header)' &&
          testInfo.project.name !== 'chromium',
        'Header CTA is only visible on Desktop',
      )
      const locator = btn.locator(page)
      await locator.click()

      await expect(page).toHaveURL(/quiz\?step=intro/)
      await expect(
        page.getByRole('button', { name: /continue/i }),
      ).toBeVisible()
    })
  }
})
