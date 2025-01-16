interface PostalCode {
  postalCode: number;
  city: string;
  region: string;
  country: string;
}

export const postalCodes: PostalCode[] = [
  // Croatia
  { postalCode: 10000, city: 'Zagreb', region: 'City of Zagreb', country: 'Croatia' },
  { postalCode: 21000, city: 'Split', region: 'Split-Dalmatia', country: 'Croatia' },
  { postalCode: 51000, city: 'Rijeka', region: 'Primorje-Gorski Kotar', country: 'Croatia' },
  { postalCode: 23000, city: 'Zadar', region: 'Zadar', country: 'Croatia' },
  { postalCode: 31000, city: 'Osijek', region: 'Osijek-Baranja', country: 'Croatia' },
  { postalCode: 20000, city: 'Dubrovnik', region: 'Dubrovnik-Neretva', country: 'Croatia' },
  { postalCode: 47000, city: 'Karlovac', region: 'Karlovac', country: 'Croatia' },
  { postalCode: 42000, city: 'Varaždin', region: 'Varaždin', country: 'Croatia' },
  { postalCode: 44000, city: 'Sisak', region: 'Sisak-Moslavina', country: 'Croatia' },
  { postalCode: 33000, city: 'Virovitica', region: 'Virovitica-Podravina', country: 'Croatia' },

  // Austria
  { postalCode: 1010, city: 'Vienna', region: 'Vienna', country: 'Austria' },
  { postalCode: 5020, city: 'Salzburg', region: 'Salzburg', country: 'Austria' },
  { postalCode: 6020, city: 'Innsbruck', region: 'Tyrol', country: 'Austria' },
  { postalCode: 8010, city: 'Graz', region: 'Styria', country: 'Austria' },
  { postalCode: 4020, city: 'Linz', region: 'Upper Austria', country: 'Austria' },
  { postalCode: 3100, city: 'Sankt Pölten', region: 'Lower Austria', country: 'Austria' },
  { postalCode: 7000, city: 'Eisenstadt', region: 'Burgenland', country: 'Austria' },
  { postalCode: 9500, city: 'Villach', region: 'Carinthia', country: 'Austria' },
  { postalCode: 6800, city: 'Feldkirch', region: 'Vorarlberg', country: 'Austria' },
  { postalCode: 6700, city: 'Bludenz', region: 'Vorarlberg', country: 'Austria' },

  // Germany
  { postalCode: 10115, city: 'Berlin', region: 'Berlin', country: 'Germany' },
  { postalCode: 80331, city: 'Munich', region: 'Bavaria', country: 'Germany' },
  { postalCode: 60311, city: 'Frankfurt', region: 'Hesse', country: 'Germany' },
  { postalCode: 20095, city: 'Hamburg', region: 'Hamburg', country: 'Germany' },
  { postalCode: 50667, city: 'Cologne', region: 'North Rhine-Westphalia', country: 'Germany' },
  { postalCode: 28195, city: 'Bremen', region: 'Bremen', country: 'Germany' },
  { postalCode: 70173, city: 'Stuttgart', region: 'Baden-Württemberg', country: 'Germany' },
  { postalCode: 90403, city: 'Nuremberg', region: 'Bavaria', country: 'Germany' },
  { postalCode: 1067, city: 'Dresden', region: 'Saxony', country: 'Germany' },
  { postalCode: 99084, city: 'Erfurt', region: 'Thuringia', country: 'Germany' },
];
