import { palleteNameMap, PalleteType } from './palletes';

interface CargoLikeMetadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
  width: number;
  height: number;
  length: number;
}

interface CargoLike {
  description?: string | null;
  metadata: CargoLikeMetadata;
}

export function getCargoLabel(cargo: CargoLike): string {
  if (cargo.description) return cargo.description;

  const { type, palleteAmount, palleteType, length, width, height } = cargo.metadata;

  if (type === 'standard' && palleteAmount) {
    const palleteName = palleteNameMap[palleteType as PalleteType];
    return palleteName ? `${palleteAmount} x ${palleteName}` : `${palleteAmount} paleta`;
  }

  if (type === 'nonstandard') {
    const dimensions = [length, width, height].filter((d) => d != null);
    if (dimensions.length > 0) return dimensions.map((d) => `${d}m`).join(' x ');
  }

  return '-';
}
