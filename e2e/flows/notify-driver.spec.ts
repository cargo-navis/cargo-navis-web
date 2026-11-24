import { NALOG } from '../fake-api/areas/nalozi';
import { expect, test } from '../support/test';

test('notify the driver, then notify again', async ({ page, fakeApi }) => {
  // 2026/0101 is on ZG-1234-AB with Ivan, who hasn't been told yet.
  await page.goto(`/dashboard/shipments/${NALOG.podravka}`);
  await page.getByRole('button', { name: 'Obavijesti vozača' }).first().click();

  await expect(page.getByText('Vozač Ivan Horvat obaviješten o nalogu za Podravka d.d.').first()).toBeVisible();
  expect(fakeApi.calls('POST', `/api/shipments/${NALOG.podravka}/notify-drivers`)).toHaveLength(1);

  // Once sent, the button asks before sending again.
  await page.getByRole('button', { name: 'Obavijesti ponovno' }).first().click();
  const dialog = page.getByRole('alertdialog', { name: 'Obavijestiti ponovno?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Pošalji ponovno' }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => fakeApi.calls('POST', `/api/shipments/${NALOG.podravka}/notify-drivers`).length).toBe(2);
});
