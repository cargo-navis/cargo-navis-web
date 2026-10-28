import { useState } from 'react';

import { useGenerateDriverPortalToken } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils/toast';
import { Button } from '@/ui';

import { DriverPortalLinkDialog } from './DriverPortalLinkDialog';

export const DriverPortalLinkButton: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const { mutateAsync, isPending } = useGenerateDriverPortalToken(id);
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  async function handleGenerate() {
    try {
      const { token } = await mutateAsync();
      // Built here rather than by the backend, so the link matches the app it was generated in (preview, ngrok).
      setUrl(`${window.location.origin}/driver/${token}`);
      setIsOpen(true);
    } catch {
      showErrorToast({ title: 'Greška s generiranjem linka.' });
    }
  }

  return (
    <>
      <Button
        iconLeft="IconLink"
        isLoading={isPending}
        text="Link za portal"
        variant="secondary"
        onClick={handleGenerate}
      />
      <DriverPortalLinkDialog isOpen={isOpen} name={name} url={url} onClose={() => setIsOpen(false)} />
    </>
  );
};
