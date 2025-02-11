import { Button, FlexLayout } from '@/ui';
import { useRouter } from 'next/router';

export const ClientActions: React.FC<{ id: string }> = ({ id }) => {
  const { push } = useRouter();
  // const { mutateAsync, isPending } = useDeleteClient(id);
  //
  async function handleDelete() {
    const answer = confirm('Jeste li sigurni da želite izbrisati ovog zaposlenika?');
    if (!answer) return;

    try {
      // await mutateAsync();
      alert('Zaposlenik izbrisan');

      push('/dashboard/clients');
    } catch (error) {
      alert('Greška s brisanjem klijenta');
    }
  }

  return (
    <FlexLayout className="gap-5">
      <Button
        as="a"
        // isDisabled={isPending}
        href={`/dashboard/client/${id}/edit`}
        iconLeft="PencilIcon"
        text="Uredi"
        variant="secondary"
      />
      <Button
        // isLoading={isPending}
        iconLeft="TrashIcon"
        text="Izbriši"
        onClick={handleDelete}
      />
    </FlexLayout>
  );
};
