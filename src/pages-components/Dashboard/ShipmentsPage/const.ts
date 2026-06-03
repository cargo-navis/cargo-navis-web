import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import type { IconType } from '@/ui';

export const loadStatusConfig = {
  [LoadStatus.NotYetLoaded]: {
    label: 'Nije utovareno',
    variant: 'danger' as const,
    icon: 'IconPackage' as IconType,
  },
  [LoadStatus.Loaded]: {
    label: 'Utovareno',
    variant: 'info' as const,
    icon: 'IconPackageImport' as IconType,
  },
  [LoadStatus.Unloaded]: {
    label: 'Istovareno',
    variant: 'success' as const,
    icon: 'IconPackageExport' as IconType,
  },
} as const;

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
