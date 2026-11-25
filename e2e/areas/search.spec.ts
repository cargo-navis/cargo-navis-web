import type { Page, TestInfo } from '@playwright/test';

import { NALOG } from '../fake-api/areas/nalozi';
import { VOZILO } from '../fake-api/areas/vozila';
import { VOZAC } from '../fake-api/areas/zaposlenici';
import { expect, test } from '../support/test';
import { isPhone } from '../support/ui';

/** Opens ⌘K: the shortcut (Ctrl K, ⌘K on a Mac) on desktop, the top bar field on a phone. */
async function openSearch(page: Page, testInfo: TestInfo) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const input = page.getByPlaceholder('Pretraži naloge, flotu, zaposlenike, klijente i podvozare…');
  if (isPhone(testInfo)) {
    await page.getByRole('button', { name: /^Pretraži…/ }).click();
  } else {
    // The shortcut listener is attached in an effect after the page renders, so on a slow machine (CI) the first press
    // can come before it exists. Press again until the dialog opens.
    await expect(async () => {
      await page.keyboard.press('ControlOrMeta+k');
      await expect(input).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
  }
  await expect(input).toBeVisible();
  return input;
}

test.describe('⌘K search', () => {
  test('finds a nalog and opens it', async ({ page }, testInfo) => {
    await page.goto('/dashboard');
    const input = await openSearch(page, testInfo);
    await input.fill('0101');
    await page.getByRole('option', { name: /2026\/0101/ }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/${NALOG.podravka}$`));
  });

  test('finds a vehicle and an employee', async ({ page }, testInfo) => {
    await page.goto('/dashboard');
    let input = await openSearch(page, testInfo);
    await input.fill('ZG-5678');
    await page.getByRole('option', { name: /ZG-5678-CD/ }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/fleet/${VOZILO.tegljac2}$`));

    input = await openSearch(page, testInfo);
    await input.fill('Petra');
    await page.getByRole('option', { name: /Petra Babić/ }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/employees/${VOZAC.petra}$`));
  });

  test('short query, no results, error', async ({ page, fakeApi }, testInfo) => {
    await page.goto('/dashboard');
    const input = await openSearch(page, testInfo);
    await input.fill('zg');
    await expect(page.getByText('Upiši najmanje 3 znaka.')).toBeVisible();

    await input.fill('qqqxyz');
    await expect(page.getByText('Nema rezultata za „qqqxyz”.')).toBeVisible();

    fakeApi.fail('GET', '/api/search');
    await input.fill('qqqxyzw');
    await expect(page.getByText('Pretraživanje nije uspjelo.')).toBeVisible();
  });
});
