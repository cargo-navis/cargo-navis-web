import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/ui';

import { DriverEmpty } from '../ui';

const NEW_LINK_TEXT = 'Za pristup ti je potreban novi link. Zatraži ga od nadređenog.';

interface DriverStatusScreenProps {
  variant: 'loading' | 'expired' | 'signed-out' | 'error';
  /** Set inside the app added to the home screen; changes the signed-out copy. */
  installedOn?: 'ios' | 'android' | null;
  onRetry?(): void;
}

// Route-shaped placeholders (kind line, place, client, totals; day on the right), slightly different widths.
const STOP_SKELETONS = [
  { place: 'w-40', client: 'w-48', totals: 'w-28' },
  { place: 'w-32', client: 'w-40', totals: 'w-32' },
  { place: 'w-44', client: 'w-36', totals: 'w-24' },
  { place: 'w-36', client: 'w-44', totals: 'w-28' },
];

/** First load of the route: stop cards instead of a spinner (DECISIONS §2 Loading). */
const RouteSkeleton = () => (
  <div aria-busy className="flex flex-col gap-2 px-4 pt-1 pb-4">
    {STOP_SKELETONS.map((widths, index) => (
      <div className="flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10" key={index}>
        <div className="flex min-w-0 grow flex-col gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className={`h-7 ${widths.place}`} />
          <Skeleton className={`h-4 ${widths.client}`} />
          <Skeleton className={`h-3.5 ${widths.totals}`} />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
    ))}
  </div>
);

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
    return <RouteSkeleton />;
  }

  if (variant === 'signed-out') {
    const { title, text } = getSignedOutCopy(installedOn);
    return <DriverEmpty className="grow" description={text} icon="IconLink" title={title} />;
  }

  if (variant === 'expired') {
    return <DriverEmpty className="grow" description={NEW_LINK_TEXT} icon="IconLinkOff" title="Link je istekao" />;
  }

  return (
    <DriverEmpty
      action={
        <Button size="xl" variant="outline" onClick={onRetry}>
          <Icon data-icon="inline-start" icon="IconReload" size="m" />
          Pokušaj ponovno
        </Button>
      }
      className="grow"
      icon="IconAlertTriangle"
      title="Došlo je do greške"
      variant="danger"
    />
  );
};
