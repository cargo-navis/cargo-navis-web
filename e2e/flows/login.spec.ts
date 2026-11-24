import { KORISNIK } from '../fake-api/areas/korisnik';
import { expect, test } from '../support/test';

// Signed out: no saved session for this file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Prijava', () => {
  test('wrong password shows the error and stays on /login', async ({ page, fakeApi }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(KORISNIK.email);
    await page.getByLabel('Lozinka').fill('kriva-lozinka');
    await page.getByRole('button', { name: 'Prijavi se' }).click();

    await expect(
      page.getByText('Nismo pronašli nijednog korisnika s tom kombinacijom emaila i lozinke.')
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    expect(fakeApi.calls('POST', '/auth/token')).toHaveLength(1);
  });

  test('correct password opens /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(KORISNIK.email);
    await page.getByLabel('Lozinka').fill(KORISNIK.password);
    await page.getByRole('button', { name: 'Prijavi se' }).click();

    // Wait for the URL, never a fixed time: wide screens play a leave animation first.
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Početna' })).toBeVisible();
  });
});
