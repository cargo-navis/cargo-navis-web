import type { Db } from '../fake-api';
import { fail } from '../fake-api';
import { TERET } from '../fake-api/areas/nalozi';
import { insertStop, STANICA, stopAddress } from '../fake-api/areas/prijevozi';
import { VOZILO } from '../fake-api/areas/vozila';
import { VOZAC } from '../fake-api/areas/zaposlenici';
import { uuid } from '../fake-api/ids';
import { expect, test } from '../support/test';
import { day } from '../support/time';
import { expectToast } from '../support/ui';

const RUTA = `/dashboard/vehicle-stops/${VOZILO.tegljac1}`;
const ZAGREB_UTOVAR = uuid(721);

/**
 * ZG-1234-AB gets a second utovar today (2026/0102's teret in Zagreb) right after Koprivnica: two unfinished stops on
 * the same date, so Ruta shows the „Isti dan” box and „Pomakni”.
 */
function twoStopsToday(db: Db) {
  insertStop(
    db,
    {
      id: ZAGREB_UTOVAR,
      vehicleId: VOZILO.tegljac1,
      driverId: VOZAC.ivan,
      address: stopAddress('Miramarska 23', '10000'),
      date: day(0),
      loadingCargoIds: [TERET.atlantic],
    },
    STANICA.podravkaUtovar
  );
}

test.describe('Prijevozi „Kao danas”', () => {
  test('a row per vehicle; search by driver', async ({ page }) => {
    await page.goto('/dashboard/vehicle-stops');
    await expect(page.getByRole('heading', { level: 1, name: 'Prijevozi' })).toBeVisible();
    await expect(page.getByRole('link', { name: /ZG-1234-AB/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /ZG-5678-CD/ }).first()).toBeVisible();

    await page.getByLabel('Pretraži prijevoze').fill('Petra');
    await expect(page.getByRole('link', { name: /ZG-5678-CD/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /ZG-1234-AB/ })).toHaveCount(0);

    await page.getByLabel('Pretraži prijevoze').fill('Nitko');
    await expect(page.getByText('Nema rezultata za „Nitko”')).toBeVisible();
  });

  test('empty and error states', async ({ page, fakeApi }) => {
    fakeApi.empty('GET', '/api/vehicle-stops');
    await page.goto('/dashboard/vehicle-stops');
    await expect(page.getByText('Još nema prijevoza')).toBeVisible();

    fakeApi.fail('GET', '/api/vehicle-stops');
    await page.reload();
    await expect(page.getByText('Prijevozi se nisu učitali')).toBeVisible();
  });
});

test.describe('Ruta', () => {
  test('„Isti dan” box and „Pomakni kasnije”', async ({ page, fakeApi }) => {
    twoStopsToday(fakeApi.db);
    await page.goto(RUTA);
    await expect(page.getByText(/16\.6\. · 2 mjesta isti dan/)).toBeVisible();

    // Koprivnica is first today; move it after Zagreb.
    await page.getByRole('button', { name: 'Pomakni kasnije' }).first().click();
    await expectToast(page, 'Redoslijed promijenjen', /prvo Zagreb, zatim Koprivnica/);
    expect(fakeApi.calls('PATCH', `/api/vehicle-stops/${STANICA.podravkaUtovar}/rearrange`)[0].body).toEqual({
      previousStopId: ZAGREB_UTOVAR,
    });
  });

  test('undated stops get no „Isti dan” and no „Pomakni”', async ({ page, fakeApi }) => {
    twoStopsToday(fakeApi.db);
    for (const stop of fakeApi.db.prijevozi.stops.filter((item) => item.vehicleId === VOZILO.tegljac1)) {
      stop.date = null;
    }
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1, name: 'Ruta ZG-1234-AB' })).toBeVisible();
    await expect(page.getByText('Bez datuma').first()).toBeVisible();
    await expect(page.getByText(/isti dan/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Pomakni/ })).toHaveCount(0);
  });

  test('confirm a stop from its menu, then undo', async ({ page, fakeApi }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: /^Akcije: utovar Koprivnica/ }).click();
    await page.getByRole('menuitem', { name: 'Označi završenim' }).click();
    await expectToast(page, 'Označeno završenim');
    await expect
      .poll(() => fakeApi.db.prijevozi.stops.find((s) => s.id === STANICA.podravkaUtovar)?.completedAt)
      .toBeTruthy();

    await page.getByRole('button', { name: /^Akcije: utovar Koprivnica/ }).click();
    await page.getByRole('menuitem', { name: 'Poništi završeno' }).click();
    await expectToast(page, 'Završeno poništeno');
    expect(fakeApi.calls('POST', `/api/vehicle-stops/${STANICA.podravkaUtovar}/uncomplete`)).toHaveLength(1);
  });

  test('an istovar before its utovar is refused', async ({ page, fakeApi }) => {
    fakeApi.on('POST', '/api/vehicle-stops/:id/complete', fail(422, 'Cargo not loaded', 'CARGO_NOT_YET_LOADED'), {
      times: 1,
    });
    await page.goto(RUTA);
    await page.getByRole('button', { name: /^Akcije: istovar Split/ }).click();
    await page.getByRole('menuitem', { name: 'Označi završenim' }).click();
    await expectToast(page, 'Istovar se ne može završiti: teret još nije utovaren', 'Prvo završi utovar.');
  });

  test('unknown vehicle', async ({ page }) => {
    await page.goto('/dashboard/vehicle-stops/00000000-0000-4000-a000-000000000499');
    await expect(page.getByText('Vozilo nije pronađeno')).toBeVisible();
  });
});
