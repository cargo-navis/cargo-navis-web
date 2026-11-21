import dayjs from 'dayjs';
import { Fragment } from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import type { StopKind } from '@/components/shared/stop-kind';
import { Card } from '@/components/ui/card';
import type { DriverStop, DriverStopCargo } from '@/lib/api/driver';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { cardHeadingClass, COMPLETED_CARD, COMPLETED_TEXT, KIND_STYLES } from '../ui';
import { formatCargoTotals, getStopClientsByKind, getStopWhen } from '../utils';

/**
 * How a stop card reads in the route: `next` is the stop to drive to (petrol, white text), `completed` is history
 * (faded, barely green), `default` is a stop ahead.
 */
export type StopTone = 'default' | 'next' | 'completed';

const CARD_TONES: Record<StopTone, string> = {
  default: 'bg-card',
  next: 'bg-primary text-primary-foreground shadow-md ring-primary',
  completed: COMPLETED_CARD,
};

/** Marks a stop or an order that has documents (📎). */
export const DocumentsIcon: React.FC<{ isOnPrimary?: boolean }> = ({ isOnPrimary }) => (
  <Icon
    aria-label="Ima dokumente"
    className={isOnPrimary ? 'text-primary-foreground' : 'text-muted-foreground'}
    icon="IconPaperclip"
    size="s"
  />
);

/** Coloured small caps saying what happens at the stop: `UTOVAR`, `ISTOVAR` or both. */
const KindLine: React.FC<{ kinds: StopKind[]; isOnPrimary: boolean }> = ({ kinds, isOnPrimary }) => (
  <>
    {kinds.map((kind, index) => (
      <Fragment key={kind}>
        {index > 0 && <span className={isOnPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'}>·</span>}
        <span className={isOnPrimary ? KIND_STYLES[kind].onPrimary : KIND_STYLES[kind].text}>
          {KIND_STYLES[kind].label}
        </span>
      </Fragment>
    ))}
  </>
);

/**
 * A card's clients of one kind, cut short to fit, with their cargo totals (`14 palete · 9.300 kg`) below; the icon
 * only when the stop both loads and unloads.
 */
const KindClientsLine: React.FC<{
  kind: StopKind;
  names: string[];
  cargos: DriverStopCargo[];
  isOnPrimary: boolean;
  showIcon: boolean;
}> = ({ kind, names, cargos, isOnPrimary, showIcon }) => {
  const totals = formatCargoTotals(cargos);
  const style = KIND_STYLES[kind];

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-2">
        {showIcon && (
          <Icon
            aria-label={style.label}
            className={cn('shrink-0', isOnPrimary ? style.onPrimary : style.text)}
            icon={style.icon}
            size="s"
          />
        )}
        <span
          className={cn('min-w-0 truncate font-medium', isOnPrimary ? 'text-primary-foreground' : 'text-foreground/80')}
        >
          {names.join(', ')}
        </span>
      </div>
      {totals && (
        <span
          className={cn(
            'text-sm',
            showIcon && 'pl-6',
            isOnPrimary ? 'text-primary-foreground/85' : 'text-muted-foreground'
          )}
        >
          {totals}
        </span>
      )}
    </div>
  );
};

interface StopCardProps {
  stop: DriverStop;
  tone: StopTone;
  isHighlighted: boolean;
  onOpen(): void;
}

/**
 * A stop in the route: what happens there, the city with its clients below and when (the day of the confirmation or
 * of a stop ahead). Clients get a line per kind, without order numbers (`Nalog #…` names an order without a client);
 * the drawer has the numbers. A completed stop gets a light green background and a check before its day.
 */
export const StopCard: React.FC<StopCardProps> = ({ stop, tone, isHighlighted, onOpen }) => {
  const isOnPrimary = tone === 'next';
  const isCompleted = tone === 'completed';
  const clientsByKind = getStopClientsByKind(stop);
  const kinds = clientsByKind.map(({ kind }) => kind);
  const when = getStopWhen(stop, dayjs());
  const placeName = stop.address?.placeName ?? 'Bez adrese';

  return (
    <Card className={cn('p-0', CARD_TONES[tone], isHighlighted && 'card-highlight-fade')}>
      <button
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 p-4 text-left"
        type="button"
        onClick={onOpen}
      >
        <div className={cn('flex min-w-0 grow items-center gap-3', isCompleted && 'opacity-60')}>
          <div className="flex min-w-0 grow flex-col">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <KindLine isOnPrimary={isOnPrimary} kinds={kinds} />
              {stop.documents.length > 0 && <DocumentsIcon isOnPrimary={isOnPrimary} />}
            </div>
            <div className="flex items-center gap-2">
              {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xs" />}
              <span className={cn('min-w-0 truncate text-2xl', cardHeadingClass(placeName))}>{placeName}</span>
            </div>
            {clientsByKind.map(({ kind, names, cargos }) => (
              <KindClientsLine
                cargos={cargos}
                isOnPrimary={isOnPrimary}
                key={kind}
                kind={kind}
                names={names}
                showIcon={clientsByKind.length > 1}
              />
            ))}
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <div
              className={cn(
                'flex items-center gap-1 font-bold',
                isCompleted && COMPLETED_TEXT,
                !isCompleted && !isOnPrimary && when.isLate && 'text-destructive'
              )}
            >
              {isCompleted && <Icon aria-label="Potvrđeno" icon="IconCircleCheck" size="s" />}
              {when.primary}
            </div>
            {when.secondary && (
              <span
                className={cn(
                  'text-[13px]',
                  isCompleted ? COMPLETED_TEXT : isOnPrimary ? 'text-primary-foreground/85' : 'text-muted-foreground'
                )}
              >
                {when.secondary}
              </span>
            )}
          </div>
        </div>
      </button>
    </Card>
  );
};
