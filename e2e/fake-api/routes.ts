import { analitikaRoutes } from './areas/analitika';
import { korisnikRoutes } from './areas/korisnik';
import { naloziRoutes } from './areas/nalozi';
import { ostaloRoutes } from './areas/ostalo';
import { partneriRoutes, viesRoutes } from './areas/partneri';
import { pretragaRoutes } from './areas/pretraga';
import { prijevoziRoutes } from './areas/prijevozi';
import { tvrtkaRoutes } from './areas/tvrtka';
import { vozacRoutes } from './areas/vozac';
import { vozilaRoutes } from './areas/vozila';
import { zaposleniciRoutes } from './areas/zaposlenici';
import type { RouteDef } from './http';

/** Every endpoint the fake API knows, by area. First match wins, so specific paths come before `:id` ones. */
export const routes: RouteDef[] = [
  ...korisnikRoutes,
  ...tvrtkaRoutes,
  ...partneriRoutes,
  ...viesRoutes,
  ...zaposleniciRoutes,
  ...vozilaRoutes,
  ...vozacRoutes,
  ...prijevoziRoutes,
  ...naloziRoutes,
  ...ostaloRoutes,
  ...analitikaRoutes,
  ...pretragaRoutes,
];
