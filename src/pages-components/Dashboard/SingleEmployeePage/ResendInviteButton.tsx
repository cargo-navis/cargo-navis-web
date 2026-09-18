import { useResendEmployeeInvite } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { TextButton } from '@/ui';

export const ResendInviteButton: React.FC<{ id: string; email: string }> = ({ id, email }) => {
  const { mutateAsync, isPending } = useResendEmployeeInvite(id);

  async function handleResend() {
    try {
      await mutateAsync();
      showSuccessToast({ title: 'Pozivnica ponovno poslana.', description: `Poslano na ${email}.` });
    } catch {
      showErrorToast({ title: 'Greška sa slanjem pozivnice.' });
    }
  }

  return (
    <TextButton
      iconLeft="IconMailForward"
      isDisabled={isPending}
      size="s"
      text="Ponovno pošalji pozivnicu"
      variant="secondary"
      onClick={handleResend}
    />
  );
};
