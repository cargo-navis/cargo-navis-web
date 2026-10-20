import { Button, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

interface DriverStatusScreenProps {
  variant: 'loading' | 'expired' | 'error';
  onRetry?(): void;
}

export const DriverStatusScreen: React.FC<DriverStatusScreenProps> = ({ variant, onRetry }) => {
  if (variant === 'loading') {
    return (
      <FlexLayout className="grow items-center justify-center">
        <LoadingSpinner color="text-teal-700 dark:text-teal-300" size="l" />
      </FlexLayout>
    );
  }

  const isExpired = variant === 'expired';

  return (
    <FlexLayout className="grow flex-col items-center justify-center gap-3 px-8 text-center">
      <Icon
        color={isExpired ? 'text-dark-500 dark:text-light-300' : 'text-red-500 dark:text-red-300'}
        icon={isExpired ? 'IconLinkOff' : 'IconAlertTriangle'}
        size="xxxl"
      />
      <Text color="text-color-1" variant="text-m-medium">
        {isExpired ? 'Link je istekao' : 'Došlo je do greške'}
      </Text>
      {isExpired ? (
        <Text color="text-color-3" variant="text-xs">
          Otvori najnoviju poruku iz WhatsAppa.
        </Text>
      ) : (
        <Button iconLeft="IconReload" size="l" text="Pokušaj ponovno" variant="secondary" onClick={onRetry} />
      )}
    </FlexLayout>
  );
};
