import type { Page } from '@playwright/test';

import type { Db } from '../fake-api';
import { manyNalozi } from '../fake-api/areas/nalozi';
import { insertStop, STANICA, stopAddress } from '../fake-api/areas/prijevozi';
import { DRIVER_LINK } from '../fake-api/areas/vozac';
import { VOZILO } from '../fake-api/areas/vozila';
import { VOZAC } from '../fake-api/areas/zaposlenici';
import { uuid } from '../fake-api/ids';
import { expect, test } from '../support/test';
import { at, day } from '../support/time';
import { expectToast } from '../support/ui';

// The driver portal runs on the phone project only (playwright.config.ts). No dashboard session here: the driver
// signs in with their link.
test.use({ storageState: { cookies: [], origins: [] } });

const LINK = `/driver/${DRIVER_LINK.token}`;

/** Skips the full-screen „install the app” gate, as „Nastavi u pregledniku” does for the tab. */
async function continueInBrowser(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('driver-continue-in-browser', 'true'));
}

/** The stop card whose place is `place` (cards are buttons that open the stop drawer). */
const stopCard = (page: Page, place: string) =>
  page.locator('button[aria-haspopup="dialog"]').filter({ hasText: place }).first();

/** 24 finished stops for Ivan before today's (12 nalozi, utovar and istovar each), so the list has two pages. */
function history(db: Db) {
  const nalozi = manyNalozi(12);
  db.nalozi.push(...nalozi);
  // Inserted at the start of the route one by one, so the oldest goes in last.
  nalozi.toReversed().forEach((nalog, index) => {
    const daysAgo = 2 + index * 2;
    const common = { vehicleId: VOZILO.tegljac1, driverId: VOZAC.ivan };
    insertStop(
      db,
      {
        ...common,
        id: uuid(7_100 + index * 2 + 1),
        address: stopAddress('Domovinskog rata 2', '21000'),
        date: day(-daysAgo + 1),
        completedAt: at(-daysAgo + 1, 14),
        unloadingCargoIds: [nalog.cargo[0].id],
      },
      null
    );
    insertStop(
      db,
      {
        ...common,
        id: uuid(7_100 + index * 2),
        address: stopAddress('Radnička cesta 1', '10000'),
        date: day(-daysAgo),
        completedAt: at(-daysAgo, 9),
        loadingCargoIds: [nalog.cargo[0].id],
      },
      null
    );
  });
}

test.describe('Driver portal', () => {
  test('the link signs in and shows the route', async ({ page, fakeApi }) => {
    await continueInBrowser(page);
    await page.goto(LINK);
    await expect(page.getByRole('tab', { name: 'Ruta' })).toHaveAttribute('aria-selected', 'true');
    await expect(stopCard(page, 'Koprivnica')).toContainText('Danas');
    await expect(stopCard(page, 'Split')).toContainText('Sutra');
    expect(fakeApi.calls('POST', '/auth/exchange')[0].body).toEqual({ token: DRIVER_LINK.token });
  });

  test('install gate first in a phone browser', async ({ page }) => {
    await page.goto(LINK);
    await expect(page.getByText('Instaliraj Cargo Navis')).toBeVisible();
    await page.getByRole('button', { name: 'Nastavi u pregledniku' }).click();
    await expect(stopCard(page, 'Koprivnica')).toBeVisible();
    await expect(page.getByText('Koristi aplikaciju Cargo Navis')).toBeVisible();
  });

  test('confirm utovar, then istovar; undo from the toast', async ({ page, fakeApi }) => {
    await continueInBrowser(page);
    await page.goto(LINK);

    // The istovar waits for the utovar of its teret.
    await stopCard(page, 'Split').click();
    await expect(page.getByRole('button', { name: 'Potvrdi istovar' })).toBeDisabled();
    await page.keyboard.press('Escape');

    await stopCard(page, 'Koprivnica').click();
    await page.getByRole('button', { name: 'Potvrdi utovar' }).click();
    await expectToast(page, 'Utovar potvrđen', /Podravka d\.d\. • #2026\/0101/);
    expect(fakeApi.db.prijevozi.stops.find((stop) => stop.id === STANICA.podravkaUtovar)?.completedAt).toBeTruthy();

    await page.getByRole('button', { name: 'Poništi' }).click();
    await expectToast(page, 'Potvrda poništena');
    expect(fakeApi.calls('POST', `/api/vehicle-stops/${STANICA.podravkaUtovar}/uncomplete`)).toHaveLength(1);

    await stopCard(page, 'Koprivnica').click();
    await page.getByRole('button', { name: 'Potvrdi utovar' }).click();
    await expectToast(page, 'Utovar potvrđen');
    await stopCard(page, 'Split').click();
    await page.getByRole('button', { name: 'Potvrdi istovar' }).click();
    await expectToast(page, 'Istovar potvrđen');
  });

  test('add a CMR to a stop', async ({ page, fakeApi }) => {
    await continueInBrowser(page);
    await page.goto(LINK);
    await stopCard(page, 'Koprivnica').click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Dodaj dokument' }).click();
    await (await chooser).setFiles({ name: 'CMR.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });

    await expectToast(page, 'Dokument dodan');
    const stop = fakeApi.db.prijevozi.stops.find((item) => item.id === STANICA.podravkaUtovar)!;
    expect(stop.documents).toMatchObject([{ name: 'CMR.pdf', uploadedBy: VOZAC.ivan }]);
  });

  test('Nalozi tab', async ({ page }) => {
    await continueInBrowser(page);
    await page.goto(LINK);
    await page.getByRole('tab', { name: 'Nalozi' }).click();
    await expect(page.getByText('Nalog #2026/0101').first()).toBeVisible();
    await expect(page.getByText('0/2 mjesta').first()).toBeVisible();
  });

  test('the lists load the next page at the end (latest first)', async ({ page, fakeApi }) => {
    history(fakeApi.db);
    await continueInBrowser(page);
    await page.goto(LINK);
    await expect(stopCard(page, 'Koprivnica')).toBeVisible();
    expect(fakeApi.calls('GET', '/api/driver/stops').map((call) => call.query.get('page'))).toEqual(['1']);

    await page.mouse.wheel(0, 20_000);
    await expect
      .poll(() => fakeApi.calls('GET', '/api/driver/stops').map((call) => call.query.get('page')))
      .toContain('2');
  });

  test('an expired link', async ({ page }) => {
    await continueInBrowser(page);
    await page.goto('/driver/stari-link');
    await expect(page.getByText('Link je istekao')).toBeVisible();
    await expect(page.getByText('Za pristup ti je potreban novi link. Zatraži ga od nadređenog.')).toBeVisible();
  });
});
