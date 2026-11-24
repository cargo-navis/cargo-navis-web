import { seedKorisnik } from './areas/korisnik';
import { seedNalozi } from './areas/nalozi';
import { seedOstalo } from './areas/ostalo';
import { seedPartneri } from './areas/partneri';
import { seedPrijevozi } from './areas/prijevozi';
import { seedTvrtka } from './areas/tvrtka';
import { seedVozila } from './areas/vozila';
import { seedZaposlenici } from './areas/zaposlenici';

/** All fake backend data of one test. Each area seeds its part; handlers and tests read and change it. */
export function createDb() {
  return {
    korisnik: seedKorisnik(),
    tvrtka: seedTvrtka(),
    partneri: seedPartneri(),
    zaposlenici: seedZaposlenici(),
    vozila: seedVozila(),
    nalozi: seedNalozi(),
    prijevozi: seedPrijevozi(),
    ostalo: seedOstalo(),
  };
}

export type Db = ReturnType<typeof createDb>;
