import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';

export const loadStatusConfig = {
  [LoadStatus.NotYetLoaded]: {
    label: 'Nije utovareno',
    variant: 'danger' as const,
  },
  [LoadStatus.Loaded]: {
    label: 'Utovareno',
    variant: 'info' as const,
  },
  [LoadStatus.Unloaded]: {
    label: 'Istovareno',
    variant: 'success' as const,
  },
} as const;

export const activeOptions = [
  { value: 'false', label: 'Odrađeni' },
  { value: 'true', label: 'U obradi' },
];

export const activeLabels: Record<'true' | 'false', string> = {
  true: 'U obradi',
  false: 'Odrađeni',
};

export const invoiceStatusConfig = {
  [InvoiceStatus.NotSent]: {
    label: 'Nefakturiran',
    variant: 'danger' as const,
  },
  [InvoiceStatus.Sent]: {
    label: 'Fakturiran',
    variant: 'info' as const,
  },
  [InvoiceStatus.Paid]: {
    label: 'Plaćen',
    variant: 'success' as const,
  },
} as const;
