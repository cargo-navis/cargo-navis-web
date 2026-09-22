import type { SuggestedNewClient } from '@/lib/api/shipment-drafts.d';
import { Alert, Button, Text, TextButton } from '@/ui';

interface SuggestedClientBannerProps {
  suggestedClient: SuggestedNewClient;
  /** Opens the prefilled create form, where the values can still be changed. */
  onConfirm(): void;
  onDismiss(): void;
}

export const SuggestedClientBanner: React.FC<SuggestedClientBannerProps> = ({
  suggestedClient,
  onConfirm,
  onDismiss,
}) => {
  // VIES confirms some tax ids without revealing the company name
  const clientLabel = suggestedClient.name || suggestedClient.vatId;

  return (
    <Alert
      actions={
        <>
          <Button size="s" text="Potvrdi" type="button" variant="primary" onClick={onConfirm} />
          <TextButton size="s" text="Odbaci" type="button" variant="secondary" onClick={onDismiss} />
        </>
      }
      icon="IconUserPlus"
      text={
        <>
          Pronašli smo novog klijenta:{' '}
          <Text className="text-inherit" variant="text-s-medium">
            {clientLabel}
          </Text>
          . Želiš li ga dodati u bazu?
        </>
      }
      variant="info"
    />
  );
};
