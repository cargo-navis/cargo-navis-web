import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Shipment } from '@/lib/api';
import { cn } from '@/lib/utils';
import { fileDisplayName } from '@/lib/utils/file';
import { Icon } from '@/ui';

import {
  cargoContentsLabel,
  cargoDimensions,
  cargoTotals,
  isCustomCargo,
  isOversize,
  palletLabel,
} from '../shared/cargo';
import { formatEuro, formatNumber, getMargin } from '../shared/format';
import { MARGIN_PILL, STATUS_TEXT } from '../shared/tones';

/**
 * „Nalog” (lab /nalog B + /tables): client a bit larger (15px), below it the number, violet „Agencijski” + 💼, 📎 count
 * and 💬 notes. The contractor of agency nalozi is in Vozilo / Vozač.
 */
export function NalogCell({ shipment, clientName }: { shipment: Shipment; clientName?: string }) {
  const documents = shipment.documents?.length ?? 0;
  const hasNotes = !!(shipment.internalNote || shipment.externalNote);
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-[0.9375rem] font-medium">{clientName ?? '—'}</span>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">#{shipment.orderNumber}</span>
        {shipment.isAgency && (
          <Badge size="sm" tone="category">
            <Icon icon="IconBriefcase" size="xs" /> Agencijski
          </Badge>
        )}
        {documents > 0 && (
          <Tooltip>
            <TooltipTrigger render={<span className="flex shrink-0 items-center gap-0.5" />}>
              <Icon className="size-3.5! [&_svg]:size-full!" icon="IconPaperclip" size="xs" />
              <span className="tabular-nums">{documents}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              {/* Names have no spaces to break on: wrap anywhere inside the tooltip. */}
              <ul className="flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]">
                {shipment.documents?.map((document) => (
                  <li key={document.id}>{fileDisplayName(document.name)}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
        {hasNotes && (
          <Tooltip>
            <TooltipTrigger render={<span aria-label="Napomena" className="shrink-0" />}>
              <Icon className="size-3.5! [&_svg]:size-full!" icon="IconMessage" size="xs" />
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              <div className="flex flex-col gap-2">
                {shipment.internalNote && <NoteLine label="Interna" note={shipment.internalNote} />}
                {shipment.externalNote && <NoteLine label="Vanjska" note={shipment.externalNote} />}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function NoteLine({ label, note }: { label: string; note: string }) {
  return (
    <span className="flex flex-col">
      <span className="opacity-70">{label}</span>
      <span className="whitespace-pre-wrap">{note}</span>
    </span>
  );
}

/**
 * „Teret” (lab /tables cargo-cell.tsx, picked B2): LDM on top (EU groupage convention), weight in tonnes + contents
 * below; ⚠ when a piece is oversize; hover lists every cargo.
 */
export function CargoCell({ shipment }: { shipment: Shipment }) {
  const { cargo } = shipment;
  if (!cargo.length) return <span className="text-muted-foreground">—</span>;
  const totals = cargoTotals(cargo);
  const oversize = cargo.some(isOversize);

  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex cursor-default flex-col tabular-nums" />}>
        <span className="flex items-center gap-1.5 font-medium">
          {totals.ldm ? `${formatNumber(totals.ldm)} LDM` : '— LDM'}
          {oversize && (
            <span aria-label="Izvanredne dimenzije" className={STATUS_TEXT.oversize}>
              <Icon className="size-3.5! [&_svg]:size-full!" icon="IconAlertTriangle" size="xs" />
            </span>
          )}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {formatNumber(totals.weightKg / 1000)} t · {cargoContentsLabel(cargo)}
        </span>
      </TooltipTrigger>
      <TooltipContent className="w-72 p-3" side="left">
        <div className="flex flex-col gap-1.5 text-xs tabular-nums">
          <span className="font-medium">
            Teret · {formatNumber(totals.ldm)} LDM · {totals.weightKg.toLocaleString('hr-HR')} kg
          </span>
          {cargo.map((item) =>
            isCustomCargo(item) ? (
              <span className="flex justify-between gap-3" key={item.id}>
                <span className="truncate opacity-80">{item.description || 'Izvanredni teret'}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {isOversize(item) && <Icon className="text-orange-400" icon="IconAlertTriangle" size="xs" />}
                  {cargoDimensions(item) ?? '—'}
                </span>
              </span>
            ) : (
              <span className="flex justify-between gap-3" key={item.id}>
                <span className="opacity-80">Palete ({palletLabel(item)})</span> {item.metadata?.palleteAmount ?? 0}
              </span>
            )
          )}
          {oversize && <span className="mt-1 text-orange-300">Izvanredne dimenzije: potrebna dozvola / pratnja.</span>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * „Cijena”: own = the price; agency = client price on top, our margin as a green / red pill with %, the breakdown in
 * the tooltip (today: price, −contractor price, RUC).
 */
export function PriceCell({ shipment }: { shipment: Shipment }) {
  const { price, isAgency, contractorPrice } = shipment;
  if (!isAgency) return <div className="text-right font-medium tabular-nums">{formatEuro(price ?? 0)}</div>;

  const contractor = contractorPrice ?? 0;
  const { earnings, percent, isLoss } = getMargin(price ?? 0, contractor);
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex cursor-help flex-col items-end gap-1 tabular-nums" />}>
        <span className="font-medium">{formatEuro(price ?? 0)}</span>
        <MarginPill earnings={earnings} isLoss={isLoss} percent={percent} />
      </TooltipTrigger>
      <TooltipContent className="w-60 p-3" side="left">
        <div className="flex flex-col gap-1.5 text-xs tabular-nums">
          <span className="font-medium">Razlika u cijeni (RUC)</span>
          <div className="flex justify-between gap-4">
            <span className="opacity-80">Naplaćeno klijentu</span>
            <span>{formatEuro(price ?? 0)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-80">Plaćeno podvozaru</span>
            <span>−{formatEuro(contractor)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-current/20 pt-1.5 font-medium">
            <span>RUC</span>
            <span>
              {isLoss ? '−' : '+'}
              {formatEuro(Math.abs(earnings))} ({formatNumber(percent)} %)
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/** „+250 € · 18 %” */
export function MarginPill({
  earnings,
  percent,
  isLoss,
  className,
}: {
  earnings: number;
  percent: number;
  isLoss: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        isLoss ? MARGIN_PILL.loss : MARGIN_PILL.gain,
        className
      )}
    >
      <Icon className="size-3.5! [&_svg]:size-full!" icon={isLoss ? 'IconTrendingDown' : 'IconTrendingUp'} size="xs" />
      {isLoss ? '−' : '+'}
      {formatEuro(Math.abs(earnings))}
      <span className="opacity-70">· {formatNumber(percent, 0)} %</span>
    </span>
  );
}
