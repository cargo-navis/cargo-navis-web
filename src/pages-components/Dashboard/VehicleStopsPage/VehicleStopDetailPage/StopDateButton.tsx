import dayjs from 'dayjs';
import * as React from 'react';
import { hr } from 'react-day-picker/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useUpdateVehicleStop } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { showErrorToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { toApiDate, toUpdatePayload } from '../stops';

/** The card's date; a click opens the calendar and saves right away (quick inline edit, lab /transports). */
export function StopDateButton({ stop }: { stop: VehicleStop }) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync: updateStop, isPending } = useUpdateVehicleStop();
  const value = stop.date ? dayjs(stop.date).toDate() : undefined;

  async function save(date: string | null) {
    setOpen(false);
    if (date === stop.date) return;
    try {
      await updateStop({ id: stop.id, data: toUpdatePayload(stop, { date }) });
    } catch {
      showErrorToast({ title: 'Datum nije promijenjen', description: 'Pokušaj ponovno.' });
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={stop.date ? `Datum ${formatDateShort(stop.date)} · promijeni` : 'Bez datuma · dodaj datum'}
        className={cn(
          'flex items-center gap-1 rounded-md px-1 py-0.5 text-sm tabular-nums hover:bg-muted',
          !stop.date && 'font-medium text-destructive'
        )}
        disabled={isPending}
      >
        {stop.date ? formatDateShort(stop.date) : 'Bez datuma'}
        {isPending ? (
          <Spinner className="size-3.5" />
        ) : (
          <Icon
            className="size-3.5! opacity-0 group-hover/stop:opacity-60 pointer-coarse:opacity-60 [&_svg]:size-full!"
            icon="IconCalendar"
            size="xs"
          />
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          captionLayout="dropdown"
          defaultMonth={value}
          locale={hr}
          mode="single"
          selected={value}
          // A click on the selected day deselects it (undefined): keep the date; clearing is „Ukloni datum”.
          onSelect={(date) => (date ? void save(toApiDate(date)) : setOpen(false))}
        />
        {stop.date && (
          <div className="border-t p-2">
            <Button className="w-full" size="sm" variant="ghost" onClick={() => void save(null)}>
              <Icon data-icon="inline-start" icon="IconX" size="s" />
              Ukloni datum
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
