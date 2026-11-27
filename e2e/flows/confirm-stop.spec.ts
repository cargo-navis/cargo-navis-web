import { STANICA } from '../fake-api/areas/prijevozi';
import { VOZILO } from '../fake-api/areas/vozila';
import { expect, test } from '../support/test';

test('confirm a utovar on the vehicle route (Prijevozi › Ruta)', async ({ page, fakeApi }) => {
  await page.goto('/dashboard/vehicle-stops');
  await page
    .getByRole('link', { name: /ZG-1234-AB/ })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/vehicle-stops/${VOZILO.tegljac1}`));
  await expect(page.getByRole('heading', { level: 1, name: 'Ruta ZG-1234-AB' })).toBeVisible();

  // The next stop is today's utovar in Koprivnica.
  await page.getByRole('button', { name: 'Završeno', exact: true }).click();

  await expect(page.getByText('Označeno završenim').first()).toBeVisible();
  expect(fakeApi.calls('POST', `/api/vehicle-stops/${STANICA.podravkaUtovar}/complete`)).toHaveLength(1);
  expect(fakeApi.db.prijevozi.stops.find((stop) => stop.id === STANICA.podravkaUtovar)?.completedAt).toBeTruthy();
});
