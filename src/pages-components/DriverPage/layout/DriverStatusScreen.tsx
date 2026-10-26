import { Button, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

const NEW_LINK_TEXT = 'Za pristup ti je potreban novi link. Zatraži ga od nadređenog.';

interface DriverStatusScreenProps {
  variant: 'loading' | 'expired' | 'signed-out' | 'error';
  /** Set inside the app added to the home screen; changes the signed-out copy. */
  installedOn?: 'ios' | 'android' | null;
  onRetry?(): void;
}

function getSignedOutCopy(installedOn: DriverStatusScreenProps['installedOn']) {
  if (installedOn === 'ios') {
    // The installed iOS app only gets Safari's cookies when it is added, so a new link alone does not sign it in.
    return {
      title: 'Sesija je istekla',
      text: 'Za pristup ti je potreban novi link. Zatraži ga od nadređenog i otvori ga u Safariju, zatim obriši aplikaciju s početnog zaslona i dodaj je ponovno.',
    };
  }
  if (installedOn === 'android') {
    return { title: 'Sesija je istekla', text: NEW_LINK_TEXT };
  }
  return { title: 'Prijava putem linka', text: 'Za pristup nalozima potreban ti je link. Zatraži ga od nadređenog.' };
}

export const DriverStatusScreen: React.FC<DriverStatusScreenProps> = ({ variant, installedOn, onRetry }) => {
  if (variant === 'loading') {
    return (
      <FlexLayout className="grow items-center justify-center">
        <LoadingSpinner color="text-teal-700 dark:text-teal-300" size="l" />
      </FlexLayout>
    );
  }

  if (variant === 'signed-out') {
    const { title, text } = getSignedOutCopy(installedOn);
    return (
      <FlexLayout className="grow flex-col items-center justify-center gap-3 px-8 text-center">
        <Icon color="text-dark-500 dark:text-light-300" icon="IconLink" size="xxxl" />
        <Text color="text-color-1" variant="text-m-medium">
          {title}
        </Text>
        <Text color="text-color-3" variant="text-xs">
          {text}
        </Text>
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
          {NEW_LINK_TEXT}
        </Text>
      ) : (
        <Button iconLeft="IconReload" size="l" text="Pokušaj ponovno" variant="secondary" onClick={onRetry} />
      )}
    </FlexLayout>
  );
};
