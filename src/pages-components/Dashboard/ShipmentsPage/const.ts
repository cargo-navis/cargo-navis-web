import { LoadStatus } from '@/lib/api/shipments';

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
