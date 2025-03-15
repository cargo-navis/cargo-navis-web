export enum PalleteType {
  Small = 'small',
  Euro = 'euro',
  Ship = 'ship',
  Industry = 'industry',
  Jumbo = 'jumbo',
}

export const palleteNameMap: Record<PalleteType, string> = {
  [PalleteType.Small]: 'Mala Paleta (80x60)',
  [PalleteType.Euro]: 'Euro Paleta (120x80)',
  [PalleteType.Ship]: 'Brodska Paleta (120x100)',
  [PalleteType.Industry]: 'Industrijska Paleta (100x100)',
  [PalleteType.Jumbo]: 'Jumbo Paleta (120x120)',
};

export const palleteOptions = Object.entries(palleteNameMap).map(([key, name]) => ({
  value: key as PalleteType,
  label: name,
}));

export const palleteValues: Record<PalleteType, number> = {
  [PalleteType.Small]: 0.2,
  [PalleteType.Euro]: 0.4,
  [PalleteType.Ship]: 0.5,
  [PalleteType.Industry]: 0.5,
  [PalleteType.Jumbo]: 0.6,
};
