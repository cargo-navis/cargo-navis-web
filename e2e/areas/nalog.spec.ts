import type { Page } from '@playwright/test';

import { extractDraft, NALOG, TERET } from '../fake-api/areas/nalozi';
import { postalCode } from '../fake-api/areas/ostalo';
import { KLIJENT, PODVOZAR } from '../fake-api/areas/partneri';
import { expect, test } from '../support/test';
import { day } from '../support/time';
import { expectToast, pick } from '../support/ui';

const PDF = { name: 'Nalog Atlantic.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };

/** The summary strip's „Ruta” card (route and dates line). */
const routeCard = (page: Page) => page.getByText('Ruta', { exact: true }).first().locator('..');

test.describe('Nalog detail', () => {
  test('summary strip, tereti and the side panels of an own nalog', async ({ page }) => {
    await page.goto(`/dashboard/shipments/${NALOG.podravka}`);
    await expect(page.getByRole('heading', { level: 1, name: '2026/0101' })).toBeVisible();
    await expect(routeCard(page)).toContainText('Koprivnica → Split');
    await expect(routeCard(page)).toContainText('16.6. → 17.6.');
    await expect(page.getByText('6,8 LDM · 12.000 kg').first()).toBeVisible();
    await expect(page.getByText('ZG-1234-AB').first()).toBeVisible();
    await expect(page.getByText('Teret 1')).toBeVisible();
  });

  test('summary dates: only utovar, only istovar, none', async ({ page, fakeApi }) => {
    const cargo = fakeApi.db.nalozi.find((nalog) => nalog.id === NALOG.atlantic)!.cargo[0];

    cargo.unloadingDueDate = undefined;
    await page.goto(`/dashboard/shipments/${NALOG.atlantic}`);
    await expect(routeCard(page)).toContainText('Utovar 17.6.');

    cargo.loadingReadyDate = undefined;
    cargo.unloadingDueDate = day(2);
    await page.reload();
    await expect(routeCard(page)).toContainText('Istovar do 18.6.');

    cargo.unloadingDueDate = undefined;
    await page.reload();
    await expect(routeCard(page)).toContainText('Bez datuma');
  });

  test('agency nalog: podvozar, RUC and two tereti', async ({ page }) => {
    await page.goto(`/dashboard/shipments/${NALOG.agencija}`);
    await expect(page.getByRole('heading', { level: 1, name: '2026/0100' })).toBeVisible();
    await expect(page.getByText('Agencijski').first()).toBeVisible();
    await expect(page.getByText('Brzica prijevoz d.o.o.').first()).toBeVisible();
    await expect(page.getByText('#2026/0100-P')).toBeVisible();
    // 2100 € from Kraš, 1650 € to Brzica.
    await expect(page.getByText(/zarada 450/).first()).toBeVisible();
    // The second teret has no dates: the strip shows utovar only, plus one more place.
    await expect(routeCard(page)).toContainText('Utovar 19.6.');
    await expect(page.getByText('Teret 1')).toBeVisible();
    await expect(page.getByText('Teret 2')).toBeVisible();
  });

  test('add a document', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/shipments/${NALOG.podravka}?tab=dokumenti`);
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Dodaj', exact: true }).click();
    await (await chooser).setFiles({ name: 'CMR 2026-0101.pdf', mimeType: 'application/pdf', buffer: PDF.buffer });

    await expectToast(page, 'Dokument dodan');
    await expect(page.getByText('CMR 2026-0101.pdf')).toBeVisible();
    expect(fakeApi.calls('POST', `/api/shipments/${NALOG.podravka}/files`)).toHaveLength(1);
  });

  test('invoice status change', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/shipments/${NALOG.podravka}`);
    await page.getByRole('button', { name: 'Promijeni' }).click();
    await page.getByRole('menuitemradio', { name: 'Fakturiran', exact: true }).click();
    await expectToast(page, 'Status fakture: Fakturiran');
    expect(fakeApi.calls('PATCH', `/api/shipments/${NALOG.podravka}`)[0].body).toEqual({ invoiceStatus: 'sent' });
  });

  test('unknown nalog', async ({ page }) => {
    await page.goto('/dashboard/shipments/00000000-0000-4000-a000-000000000599');
    await expect(page.getByText('Nalog nije pronađen')).toBeVisible();
  });
});

test.describe('Nalog form', () => {
  test('edit: change the price', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/shipments/${NALOG.podravka}/edit`);
    await expect(page.getByRole('heading', { level: 1, name: 'Uredi nalog #2026/0101' })).toBeVisible();
    const price = page.getByRole('textbox', { name: 'Cijena', exact: true });
    await expect(price).toHaveValue(/1\.?450/);
    await price.fill('1600');
    await page.getByRole('button', { name: 'Spremi promjene' }).click();

    await expectToast(page, 'Nalog #2026/0101 ažuriran');
    await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/${NALOG.podravka}$`));
    expect(fakeApi.calls('PATCH', `/api/shipments/${NALOG.podravka}`)[0].body).toMatchObject({
      price: 1600,
      cargo: [{ id: TERET.podravka }],
    });
  });

  test('validation: an empty form says what is missing', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments/new');
    await page.getByRole('button', { name: 'Kreiraj nalog' }).click();
    await expect(page.getByText('Odaberi klijenta.')).toBeVisible();
    await expect(page.getByText('Upiši cijenu.')).toBeVisible();
    await expect(page.getByText('Dodaj utovar.')).toBeVisible();
    await expect(page.getByText(/polja treba ispraviti|polja trebaju ispraviti/)).toBeVisible();
    expect(fakeApi.calls('POST', '/api/shipments')).toHaveLength(0);
  });

  test('save error keeps the form open', async ({ page, fakeApi }) => {
    fakeApi.fail('PATCH', '/api/shipments/:id');
    await page.goto(`/dashboard/shipments/${NALOG.podravka}/edit`);
    await page.getByRole('textbox', { name: 'Cijena', exact: true }).fill('1600');
    await page.getByRole('button', { name: 'Spremi promjene' }).click();
    await expectToast(page, 'Dogodila se greška s unosom naloga');
    await expect(page).toHaveURL(/\/edit$/);
  });

  test('agency nalog with a podvozar', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments/new');
    await pick(page, page.getByRole('combobox', { name: 'Klijent' }), 'Kraš', /Kraš d\.d\./);
    await page.getByRole('textbox', { name: 'Cijena', exact: true }).fill('2000');
    await page.getByRole('radio', { name: /Agencijski/ }).click();
    await pick(page, page.getByRole('combobox', { name: 'Podvozar' }), 'Brzica', /Brzica prijevoz/);
    await page.getByRole('textbox', { name: 'Cijena podvozara', exact: true }).fill('1500');
    await expect(page.getByText('RUC (razlika u cijeni)').locator('..')).toContainText('500');

    await page.getByRole('textbox', { name: 'Broj paleta', exact: true }).fill('5');
    await page.getByRole('textbox', { name: 'Težina', exact: true }).fill('3000');
    for (const [kind, title, postal, place] of [
      ['utovar', 'Detalji utovara', '10000', 'Zagreb'],
      ['istovar', 'Detalji istovara', '21000', 'Split'],
    ] as const) {
      await page.getByRole('button', { name: `Dodaj ${kind}` }).click();
      const dialog = page.getByRole('dialog', { name: title });
      await dialog.getByLabel('Ulica i broj').fill('Ulica 1');
      await pick(page, dialog.getByRole('combobox', { name: 'Država' }), 'Hrvatska');
      await pick(page, dialog.getByRole('combobox', { name: 'Poštanski broj i mjesto' }), postal, `${postal} ${place}`);
      await dialog.getByRole('button', { name: `Potvrdi ${kind}` }).click();
      await expect(dialog).toBeHidden();
    }
    await page.getByRole('button', { name: 'Kreiraj nalog' }).click();

    await expectToast(page, 'Nalog #2026/0103 dodan');
    await expect(page).toHaveURL(/\/dashboard\/shipments$/);
    expect(fakeApi.calls('POST', '/api/agency-shipments')[0].body).toMatchObject({
      clientId: KLIJENT.kras,
      transportContractorId: PODVOZAR.brzica,
      price: 2000,
      contractorPrice: 1500,
      cargo: [{ unloadingAddress: { postalCodeId: postalCode('21000').id } }],
    });
  });

  test('copy a nalog', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/shipments/${NALOG.atlantic}`);
    await page.getByRole('button', { name: 'Više akcija' }).first().click();
    await page.getByRole('menuitem', { name: 'Kopiraj nalog' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Kopija naloga #2026/0102' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Cijena', exact: true })).toHaveValue(/980/);
    await page.getByRole('button', { name: 'Kreiraj nalog' }).click();

    await expectToast(page, 'Nalog #2026/0103 dodan');
    expect(fakeApi.calls('POST', '/api/shipments')[0].body).toMatchObject({ clientId: KLIJENT.atlantic, price: 980 });
  });

  test('delete from the detail page', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/shipments/${NALOG.atlantic}`);
    await page.getByRole('button', { name: 'Više akcija' }).first().click();
    await page.getByRole('menuitem', { name: 'Obriši nalog' }).click();
    await page
      .getByRole('alertdialog', { name: 'Obrisati nalog #2026/0102?' })
      .getByRole('button', { name: 'Obriši' })
      .click();

    await expectToast(page, 'Nalog #2026/0102 obrisan');
    await expect(page).toHaveURL(/\/dashboard\/shipments$/);
    expect(fakeApi.calls('DELETE', `/api/shipments/${NALOG.atlantic}`)).toHaveLength(1);
  });
});

test.describe('Nalog from a PDF', () => {
  /** Waits for the upload, then lets the fake backend finish reading it, as the AI would. */
  async function uploadedDraft(page: Page, fakeApi: import('../fake-api').FakeApi) {
    await expectToast(page, '1 nalog učitan', 'Obrada je u tijeku.');
    await expect(page.getByText('Obrada u tijeku')).toBeVisible();
    const draft = fakeApi.db.ostalo.drafts[0];
    expect(draft.fileName).toBe(PDF.name);
    extractDraft(fakeApi.db, draft.id, {
      clientId: KLIJENT.atlantic,
      price: 990,
      externalOrderReference: 'ATL-PDF-1',
      extractedText: 'Nalog za prijevoz ATL-PDF-1',
      cargo: [
        {
          id: 'draft-cargo',
          weight: 7000,
          ldm: 4,
          description: 'Napitci',
          metadata: { type: 'standard', palleteType: 'euro', palleteAmount: 10, width: 0, height: 0, length: 0 },
          loadingAddress: { ...postalCode('10000'), postalCodeId: postalCode('10000').id, streetName: 'Miramarska 23' },
          loadingReadyDate: day(1),
          unloadingAddress: {
            ...postalCode('21000'),
            postalCodeId: postalCode('21000').id,
            streetName: 'Put Supavla 1',
          },
          unloadingDueDate: day(2),
        },
      ],
    });
    return draft;
  }

  test('„Učitaj nalog”, then create it from the read data', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Učitaj nalog' }).first().click();
    await (await chooser).setFiles(PDF);

    const draft = await uploadedDraft(page, fakeApi);
    // Nothing tells the page in the tests (push is off), so reload, as after the notification.
    await page.reload();
    await expect(page.getByText('Spremno')).toBeVisible();
    await page
      .getByRole('button', { name: 'Kreiraj nalog' })
      .or(page.getByRole('link', { name: 'Kreiraj nalog' }))
      .first()
      .click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/new\\?draftId=${draft.id}`));
    await expect(page.getByText(`Popunjeno iz dokumenta · ${PDF.name}`)).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Cijena/ }).first()).toHaveValue(/990/);
    await page.getByRole('button', { name: 'Kreiraj nalog' }).click();

    await expectToast(page, 'Nalog #2026/0103 dodan');
    expect(fakeApi.calls('POST', '/api/shipments')[0].body).toMatchObject({
      draftId: draft.id,
      clientId: KLIJENT.atlantic,
      price: 990,
    });
    expect(fakeApi.db.ostalo.drafts[0].status).toBe('CONFIRMED');
  });

  test('drag and drop a PDF on the Nalozi page', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    await expect(page.getByRole('heading', { level: 1, name: 'Nalozi' })).toBeVisible();
    await page.evaluate(
      ({ name, text }) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File([text], name, { type: 'application/pdf' }));
        for (const type of ['dragenter', 'dragover', 'drop']) {
          window.dispatchEvent(new DragEvent(type, { dataTransfer: transfer, bubbles: true, cancelable: true }));
        }
      },
      { name: PDF.name, text: PDF.buffer.toString() }
    );

    await uploadedDraft(page, fakeApi);
    expect(fakeApi.calls('POST', '/api/shipment-drafts')).toHaveLength(1);
  });

  test('a non-PDF file is refused', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Učitaj nalog' }).first().click();
    await (await chooser).setFiles({ name: 'slika.png', mimeType: 'image/png', buffer: Buffer.from('png') });
    await expectToast(page, '1 datoteka nije podržana', 'Dozvoljen je samo PDF.');
    expect(fakeApi.calls('POST', '/api/shipment-drafts')).toHaveLength(0);
  });
});
