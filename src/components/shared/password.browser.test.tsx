import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PASSWORD_RULES, PasswordChecklist, PasswordInput } from './password';

/** The field and its checklist, wired like on Moj račun and Postavi lozinku. */
function NewPassword() {
  const [value, setValue] = React.useState('');
  return (
    <>
      <label htmlFor="pw">Nova lozinka</label>
      <PasswordInput id="pw" value={value} onChange={setValue} />
      <PasswordChecklist rules={PASSWORD_RULES} value={value} />
    </>
  );
}

const rule = (screen: Awaited<ReturnType<typeof render>>, label: string) =>
  screen.getByRole('listitem').filter({ hasText: label });

describe('PasswordInput + PasswordChecklist', () => {
  it('every rule is listed and unmet at first', async () => {
    const screen = await render(<NewPassword />);
    for (const { label } of PASSWORD_RULES) {
      await expect.element(rule(screen, label)).toHaveTextContent(`${label} – nije ispunjeno`);
    }
  });

  it('ticks the rules as the password grows', async () => {
    const screen = await render(<NewPassword />);
    const input = screen.getByLabelText('Nova lozinka');

    await userEvent.type(input, 'abc');
    await expect.element(rule(screen, 'Malo slovo')).toHaveTextContent('Malo slovo – ispunjeno');
    await expect.element(rule(screen, 'Veliko slovo')).toHaveTextContent('Veliko slovo – nije ispunjeno');

    await userEvent.type(input, 'Defghij1');
    for (const { label } of PASSWORD_RULES) {
      await expect.element(rule(screen, label)).toHaveTextContent(`${label} – ispunjeno`);
    }
  });

  it('the eye shows and hides the password', async () => {
    const screen = await render(<NewPassword />);
    const input = screen.getByLabelText('Nova lozinka');
    await expect.element(input).toHaveAttribute('type', 'password');

    await screen.getByRole('button', { name: 'Prikaži lozinku' }).click();
    await expect.element(input).toHaveAttribute('type', 'text');
    await screen.getByRole('button', { name: 'Sakrij lozinku' }).click();
    await expect.element(input).toHaveAttribute('type', 'password');
  });

  it('marks the field invalid only when told so', async () => {
    const screen = await render(<PasswordInput aria-label="Lozinka" invalid value="" onChange={() => undefined} />);
    await expect.element(screen.getByLabelText('Lozinka')).toHaveAttribute('aria-invalid', 'true');
  });
});
