import { INVITE } from '../fake-api/areas/korisnik';
import { expect, test } from '../support/test';
import { expectToast, isPhone } from '../support/ui';

// Login itself is in e2e/flows/login.spec.ts (phase 1).

test.describe('404 outside the app', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows the route page and goes home', async ({ page }) => {
    const response = await page.goto('/ovo-ne-postoji');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Skrenuli smo s rute.' })).toBeVisible();
    await expect(page.getByText('404', { exact: true })).toBeVisible();

    // „Na Početnu” is a full load of /: the middleware sends it to /dashboard, which, signed out, goes to /login.
    // (An <a> rendered as a Base UI Button, so its role is button.)
    await page.getByRole('button', { name: 'Na Početnu' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Set password from an invite link', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const link = `/set-password?token=${INVITE.token}&email=${encodeURIComponent(INVITE.email)}`;

  test('valid link: rules, then the password is set', async ({ page, fakeApi }) => {
    await page.goto(link);
    await expect(page.getByText(INVITE.email)).toBeVisible();
    const password = page.getByLabel('Nova lozinka', { exact: true });
    const confirm = page.getByLabel('Potvrda lozinke', { exact: true });

    await password.fill('kratka');
    await confirm.click();
    await expect(page.getByText('Lozinka mora imati najmanje 10 znakova')).toBeVisible();

    await password.fill('dugackalozinka1');
    await confirm.click();
    await expect(page.getByText('Lozinka mora sadržavati najmanje jedno veliko slovo')).toBeVisible();

    await password.fill('DugackaLozinka1');
    await confirm.fill('DugackaLozinka2');
    await page.getByRole('button', { name: 'Postavi lozinku' }).click();
    await expect(page.getByText('Lozinke se ne podudaraju')).toBeVisible();

    await confirm.fill('DugackaLozinka1');
    await page.getByRole('button', { name: 'Postavi lozinku' }).click();
    await expectToast(page, 'Lozinka postavljena', 'Sad se možeš prijaviti.');
    await expect(page).toHaveURL(/\/login$/);
    expect(fakeApi.calls('POST', '/auth/accept-invite')[0].body).toEqual({
      token: INVITE.token,
      newPassword: 'DugackaLozinka1',
    });
  });

  test('invalid or expired link', async ({ page }) => {
    await page.goto('/set-password?token=istekao');
    await page.getByLabel('Nova lozinka', { exact: true }).fill('DugackaLozinka1');
    await page.getByLabel('Potvrda lozinke', { exact: true }).fill('DugackaLozinka1');
    await page.getByRole('button', { name: 'Postavi lozinku' }).click();
    await expect(page.getByText('Link nije valjan', { exact: true })).toBeVisible();
    await expect(page.getByText(/nije valjan ili je istekao/)).toBeVisible();
  });

  test('no token at all', async ({ page }) => {
    await page.goto('/set-password');
    await expect(page.getByText('Link nije valjan', { exact: true })).toBeVisible();
  });
});

test.describe('Logout', () => {
  test('from the user menu', async ({ page, fakeApi }, testInfo) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1, name: 'Početna' })).toBeVisible();
    if (isPhone(testInfo)) {
      await page.getByRole('button', { name: 'Sakrij / prikaži navigaciju' }).click();
    }
    await page.getByRole('button', { name: /Marija Kovač/ }).click();
    await page.getByRole('menuitem', { name: 'Odjava' }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(fakeApi.calls('POST', '/auth/logout')).toHaveLength(1);
  });
});
