import { KORISNIK } from './fake-api/areas/korisnik';
import { AUTH_STATE } from './support/paths';
import { expect, test } from './support/test';

// Runs once before the desktop and phone projects: logs in through the form and saves the session (the fake httpOnly
// refresh cookie) for every later test. The access token itself lives only in memory (accessTokenStore), so each test
// starts by refreshing it with this cookie, like a reloaded tab.
test('log in once', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(KORISNIK.email);
  await page.getByLabel('Lozinka').fill(KORISNIK.password);
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.context().storageState({ path: AUTH_STATE });
});
