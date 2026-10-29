import { useState } from 'react';

import { useGenerateDriverPortalToken } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils/toast';
import { Box, Button, Text, Tooltip } from '@/ui';

import { DriverPortalInviteDialog } from './DriverPortalInviteDialog';

export const DriverPortalInviteButton: React.FC<{ id: string; name: string }> = ({ id, name }) => {
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
      showErrorToast({ title: 'Greška s generiranjem pozivnice.' });
    }
  }

  return (
    <>
      <Tooltip
        content={
          <Text as="p" className="px-2 max-w-[260px]" color="text-light-50" variant="text-xxs">
            Pozivnica vozaču otvara vozački portal na mobitelu, bez lozinke. U portalu vidi svoje stanice i naloge te
            potvrđuje obavljene stanice.
          </Text>
        }
      >
        {/* Button doesn't forward refs, so the tooltip anchors to this wrapper. */}
        <Box>
          <Button
            iconLeft="IconSend"
            isLoading={isPending}
            text="Generiraj pozivnicu"
            variant="secondary"
            onClick={handleGenerate}
          />
        </Box>
      </Tooltip>
      <DriverPortalInviteDialog isOpen={isOpen} name={name} url={url} onClose={() => setIsOpen(false)} />
    </>
  );
};
