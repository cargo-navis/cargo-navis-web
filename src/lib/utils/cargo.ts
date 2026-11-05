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

export function getCargoLabelParts(cargo: CargoLike): { primary: string; secondary?: string } {
  const { type, palleteAmount, palleteType, length, width, height } = cargo.metadata;
  const secondary = cargo.description || undefined;

  if (type === 'standard' && palleteAmount) {
    const palleteName = palleteNameMap[palleteType as PalleteType];
    const primary = palleteName ? `${palleteAmount} x ${palleteName}` : `${palleteAmount} paleta`;
    return { primary, secondary };
  }

  if (type === 'nonstandard') {
    const dimensions = [length, width, height].filter((d) => d != null);
    if (dimensions.length > 0) return { primary: dimensions.map((d) => `${d}m`).join(' x '), secondary };
  }

  if (cargo.description) return { primary: cargo.description };

  return { primary: '-' };
}

export function getCargoLabel(cargo: CargoLike): string {
  const { primary, secondary } = getCargoLabelParts(cargo);
  return secondary ? `${primary} (${secondary})` : primary;
}

// 1, 21… paleta; 2–4, 22–24… palete; everything else paleta
export function getPalletsNoun(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? 'palete' : 'paleta';
}
