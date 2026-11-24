import { NALOG, TERET } from '../fake-api/areas/nalozi';
import { VOZILO } from '../fake-api/areas/vozila';
import { VOZAC } from '../fake-api/areas/zaposlenici';
import { expect, test } from '../support/test';
import { day } from '../support/time';

test('assign a vehicle to a nalog', async ({ page, fakeApi }) => {
  // 2026/0102 has no vehicle yet.
  await page.goto(`/dashboard/shipments/${NALOG.atlantic}`);
  await page.getByRole('button', { name: 'Dodijeli vozilo' }).first().click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/${NALOG.atlantic}/assign$`));

  // ZG-5678-CD comes with its driver (Petra, from its latest stop), so the driver gets notified by default.
  await page.getByRole('combobox', { name: /vozilo/i }).click();
  await page.getByRole('option', { name: /ZG-5678-CD/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Obavijesti vozača (Petra Babić)' })).toBeChecked();
  await page.getByRole('button', { name: 'Dodijeli ZG-5678-CD' }).click();

  await expect(page.getByText('Nalog #2026/0102 dodijeljen vozilu ZG-5678-CD').first()).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/dashboard/vehicle-stops/${VOZILO.tegljac2}`));

  const [assign] = fakeApi.calls('POST', '/api/vehicle-stops/assign-shipment');
  expect(assign.body).toMatchObject({
    shipmentId: NALOG.atlantic,
    vehicleId: VOZILO.tegljac2,
    cargoStopDates: [{ cargoId: TERET.atlantic, loadingDate: day(1), unloadingDate: day(2) }],
  });
  await expect.poll(() => fakeApi.calls('POST', `/api/shipments/${NALOG.atlantic}/notify-drivers`).length).toBe(1);
  const stops = fakeApi.db.prijevozi.stops.filter((stop) => stop.loadingCargoIds.includes(TERET.atlantic));
  expect(stops).toHaveLength(1);
  expect(stops[0]).toMatchObject({ vehicleId: VOZILO.tegljac2, driverId: VOZAC.petra });
});
