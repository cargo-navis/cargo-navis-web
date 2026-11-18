import { Badge } from '@/components/ui/badge';
import { type DateInput, daysFromToday, getExpiryState } from '@/lib/utils/date';

/**
 * Validity of a document / deadline / insurance (labs /employees „Valjana”, /fleet „U roku”, /settings osiguranje):
 * „Isteklo prije 8 d” red, „Istječe za 18 d” amber from 30 days ahead, otherwise a green dot with `okLabel`;
 * „Datum nije upisan” when there's no date.
 */
export function ExpiryBadge({
  date,
  okLabel = 'U roku',
  size,
  className,
}: {
  date: DateInput | null | undefined;
  /** „U roku” (deadlines, insurance) or „Valjana” (isprave). */
  okLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const state = getExpiryState(date);
  if (state === 'missing') return <span className="text-xs text-muted-foreground">Datum nije upisan</span>;
  const days = daysFromToday(date!);
  if (state === 'expired')
    return (
      <Badge className={className} size={size} tone="danger">
        Isteklo prije {-days} d
      </Badge>
    );
  if (state === 'soon')
    return (
      <Badge className={className} size={size} tone="warning">
        {days === 0 ? 'Istječe danas' : `Istječe za ${days} d`}
      </Badge>
    );
  return (
    <Badge className={className} look="dot" size={size} tone="success">
      {okLabel}
    </Badge>
  );
}
