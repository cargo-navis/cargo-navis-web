import type { Cargo } from '@/lib/api';

import { PalleteType } from '../../NewShipmentPage/utils';

export type CargoMetadata = {
  type: 'standard' | 'nonstandard';
  palleteType?: PalleteType;
  palleteAmount?: number;
  length?: number;
  width?: number;
  height?: number;
};

export type CargoWithMetadata = Omit<Cargo, 'metadata'> & {
  metadata?: CargoMetadata;
};
