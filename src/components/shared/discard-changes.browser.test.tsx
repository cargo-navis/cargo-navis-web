import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useDiscardGuard } from './discard-changes';

const question = () => page.getByRole('alertdialog', { name: 'Odbaciti promjene?' });
const keepEditing = () => question().getByRole('button', { name: 'Nastavi uređivanje' });
const discard = () => question().getByRole('button', { name: 'Odbaci' });

/** A dialog with a form, wired like the doc comment in discard-changes.tsx (Partneri, utovar / istovar…). */
function FormDialog({ onClose, description }: { onClose(): void; description?: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const [name, setName] = React.useState('');
  const close = React.useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);
  const guard = useDiscardGuard({ dirty: name !== '', onClose: close, description });

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : guard.requestClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novi klijent</DialogTitle>
          </DialogHeader>
          <label htmlFor="name">Naziv</label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Odustani</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guard.discardDialog}
    </>
  );
}

/** A page form whose Odustani leaves the page (Nalog form). */
function PageForm({ onLeave }: { onLeave(): void }) {
  const [price, setPrice] = React.useState('');
  const guard = useDiscardGuard({ dirty: price !== '', onClose: onLeave });
  return (
    <>
      <label htmlFor="price">Cijena</label>
      <Input id="price" value={price} onChange={(event) => setPrice(event.target.value)} />
      <Button variant="ghost" onClick={guard.requestClose}>
        Odustani
      </Button>
      {guard.discardDialog}
    </>
  );
}

describe('useDiscardGuard in a dialog (desktop)', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  const formDialog = () => page.getByRole('dialog', { name: 'Novi klijent' });

  it('nothing typed: Esc closes at once, without asking', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await expect.element(formDialog()).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect.element(formDialog()).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
    await expect.element(question()).not.toBeInTheDocument();
  });

  it('nothing typed: Odustani closes at once', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await formDialog().getByRole('button', { name: 'Odustani' }).click();
    await expect.element(formDialog()).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
    await expect.element(question()).not.toBeInTheDocument();
  });

  it('nothing typed: × closes at once', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await formDialog().getByRole('button', { name: 'Zatvori' }).click();
    await expect.element(formDialog()).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('typed: closing asks „Odbaciti promjene?” and keeps the dialog', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await userEvent.fill(page.getByLabelText('Naziv'), 'Transporti d.o.o.');

    await formDialog().getByRole('button', { name: 'Odustani' }).click();
    await expect.element(question()).toBeVisible();
    await expect.element(question().getByText('Upisani podaci neće se spremiti.')).toBeVisible();
    await expect.element(keepEditing()).toBeVisible();
    await expect.element(discard()).toBeVisible();
    // The form stays open underneath (hidden from screen readers while the question is up).
    await expect.element(page.getByText('Novi klijent')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('„Nastavi uređivanje” goes back to the form with the typed values', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await userEvent.fill(page.getByLabelText('Naziv'), 'Transporti d.o.o.');
    await userEvent.keyboard('{Escape}');
    await expect.element(question()).toBeVisible();

    await keepEditing().click();
    await expect.element(question()).not.toBeInTheDocument();
    await expect.element(formDialog()).toBeVisible();
    await expect.element(page.getByLabelText('Naziv')).toHaveValue('Transporti d.o.o.');
    expect(onClose).not.toHaveBeenCalled();

    // It asks again on the next try.
    await formDialog().getByRole('button', { name: 'Odustani' }).click();
    await expect.element(question()).toBeVisible();
  });

  it('Esc on the question only closes the question', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await userEvent.fill(page.getByLabelText('Naziv'), 'Transporti d.o.o.');
    await formDialog().getByRole('button', { name: 'Zatvori' }).click();
    await expect.element(question()).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect.element(question()).not.toBeInTheDocument();
    await expect.element(formDialog()).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('„Odbaci” closes the question and the dialog', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await userEvent.fill(page.getByLabelText('Naziv'), 'Transporti d.o.o.');
    await userEvent.keyboard('{Escape}');

    await discard().click();
    await expect.element(question()).not.toBeInTheDocument();
    await expect.element(formDialog()).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('cleared back to empty: closes without asking again', async () => {
    const onClose = vi.fn();
    await render(<FormDialog onClose={onClose} />);
    await userEvent.fill(page.getByLabelText('Naziv'), 'Transporti d.o.o.');
    await userEvent.clear(page.getByLabelText('Naziv'));

    await userEvent.keyboard('{Escape}');
    await expect.element(formDialog()).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
    await expect.element(question()).not.toBeInTheDocument();
  });

  it('a custom description replaces the default one', async () => {
    await render(<FormDialog description="Utovar se neće spremiti." onClose={() => undefined} />);
    await userEvent.fill(page.getByLabelText('Naziv'), 'Transporti d.o.o.');
    await userEvent.keyboard('{Escape}');

    await expect.element(question().getByText('Utovar se neće spremiti.')).toBeVisible();
    await expect.element(question().getByText('Upisani podaci neće se spremiti.')).not.toBeInTheDocument();
  });
});

describe('useDiscardGuard on a page (phone: the question is a bottom sheet)', () => {
  beforeEach(async () => {
    await page.viewport(414, 896);
  });

  it('nothing typed: Odustani leaves at once', async () => {
    const onLeave = vi.fn();
    const screen = await render(<PageForm onLeave={onLeave} />);
    await screen.getByRole('button', { name: 'Odustani' }).click();
    expect(onLeave).toHaveBeenCalledOnce();
    await expect.element(question()).not.toBeInTheDocument();
  });

  it('typed: asks first; „Nastavi uređivanje” stays, „Odbaci” leaves', async () => {
    const onLeave = vi.fn();
    const screen = await render(<PageForm onLeave={onLeave} />);
    await userEvent.fill(screen.getByLabelText('Cijena'), '1200');

    await screen.getByRole('button', { name: 'Odustani' }).click();
    await expect.element(question()).toBeVisible();
    await expect.element(question().getByText('Upisani podaci neće se spremiti.')).toBeVisible();

    await keepEditing().click();
    await expect.element(question()).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText('Cijena')).toHaveValue('1200');
    expect(onLeave).not.toHaveBeenCalled();

    await screen.getByRole('button', { name: 'Odustani' }).click();
    await discard().click();
    expect(onLeave).toHaveBeenCalledOnce();
    await expect.element(question()).not.toBeInTheDocument();
  });
});
