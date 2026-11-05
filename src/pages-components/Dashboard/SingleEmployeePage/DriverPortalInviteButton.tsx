import { useState } from 'react';

import { useGenerateDriverPortalToken } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils/toast';
import { Box, Button, Text, Tooltip } from '@/ui';

import { DriverPortalInviteDialog } from './DriverPortalInviteDialog';

export const DriverPortalInviteButton: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const { mutateAsync, isPending } = useGenerateDriverPortalToken(id);
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);

  async function handleGenerate() {
    setUrl('');
    setInviteCount((count) => count + 1);
    setIsOpen(true);

    try {
      const { token } = await mutateAsync();
      console.log(token);
      setUrl(`${window.location.origin}/driver/${token}`);
    } catch {
      showErrorToast({ title: 'Greška s generiranjem pozivnice.' });
      setIsOpen(false);
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
            iconLeft="IconDeviceMobileShare"
            isLoading={isPending || isOpen}
            text="Generiraj pozivnicu"
            variant="secondary"
            onClick={handleGenerate}
          />
        </Box>
      </Tooltip>
      {/* Keyed per invite so every one starts with a fresh dialog. */}
      <DriverPortalInviteDialog
        isOpen={isOpen}
        key={inviteCount}
        name={name}
        url={url}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
