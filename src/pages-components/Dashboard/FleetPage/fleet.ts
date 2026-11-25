import { EquipmentEnum, type Vehicle, VehicleEnum, VehicleLoadEnum } from '@/lib/api';
import { daysFromToday, type ExpiryState, formatDate, getExpiryState } from '@/lib/utils/date';
import { plural } from '@/lib/utils/plural';

/**
 * Flota (DECISIONS §5 „Flota”, lab /fleet): one page with type tabs (`?vrsta=<slug>`), vehicle page and form. Names,
 * labels and the deadline list every Flota screen shares.
 */

export const FLEET_HREF = '/dashboard/fleet';

export interface VehicleTypeInfo {
  type: VehicleEnum;
  /** `?vrsta=` value. */
  slug: string;
  /** Tab label. */
  plural: string;
  singular: string;
  /** „Dodaj poluprikolicu”. */
  accusative: string;
  /** „Još nema poluprikolica”. */
  genitivePlural: string;
  /** One line of meaning on the Vrsta radio card (which parts of the form appear). */
  description: string;
}

export const TYPES: VehicleTypeInfo[] = [
  {
    type: VehicleEnum.TRUCK,
    slug: 'tegljaci',
    plural: 'Tegljači',
    singular: 'Tegljač',
    accusative: 'tegljač',
    genitivePlural: 'tegljača',
    description: 'Motor, bez utovarnog prostora',
  },
  {
    type: VehicleEnum.TRAILER,
    slug: 'poluprikolice',
    plural: 'Poluprikolice',
    singular: 'Poluprikolica',
    accusative: 'poluprikolicu',
    genitivePlural: 'poluprikolica',
    description: 'Utovarni prostor, bez motora',
  },
  {
    type: VehicleEnum.SOLO_TRUCK,
    slug: 'solo-kamioni',
    plural: 'Solo kamioni',
    singular: 'Solo kamion',
    accusative: 'solo kamion',
    genitivePlural: 'solo kamiona',
    description: 'Motor i utovarni prostor',
  },
  {
    type: VehicleEnum.VAN,
    slug: 'kombiji',
    plural: 'Kombiji',
    singular: 'Kombi',
    accusative: 'kombi',
    genitivePlural: 'kombija',
    description: 'Motor i utovarni prostor',
  },
];

export const TYPE_OF = Object.fromEntries(TYPES.map((info) => [info.type, info])) as Record<
  VehicleEnum,
  VehicleTypeInfo
>;

export function typeFromSlug(slug: unknown): VehicleEnum | undefined {
  return TYPES.find((info) => info.slug === slug)?.type;
}

export const fleetListHref = (type?: VehicleEnum) => (type ? `${FLEET_HREF}?vrsta=${TYPE_OF[type].slug}` : FLEET_HREF);
export const vehicleHref = (id: string) => `${FLEET_HREF}/${id}`;
export const vehicleEditHref = (id: string) => `${FLEET_HREF}/${id}/edit`;
export const newVehicleHref = (type: VehicleEnum) => `${FLEET_HREF}/new?vrsta=${TYPE_OF[type].slug}`;
export const vehicleRouteHref = (id: string) => `/dashboard/vehicle-stops/${id}`;

/**
 * Old list URLs that look like a vehicle id to the browser (/dashboard/fleet/trucks matches /dashboard/fleet/[id] in a
 * client-side navigation, where next.config.mjs redirects don't run): where they belong now.
 */
const OLD_LIST_PATHS: Record<string, string> = {
  overview: FLEET_HREF,
  trucks: fleetListHref(VehicleEnum.TRUCK),
  trailers: fleetListHref(VehicleEnum.TRAILER),
  'solo-trucks': fleetListHref(VehicleEnum.SOLO_TRUCK),
  vans: fleetListHref(VehicleEnum.VAN),
};
export const oldListRedirect = (id: string): string | undefined => OLD_LIST_PATHS[id];

/** Engine fields (Motor, tahograf, vatrogasni aparat, ADR): everything but a poluprikolica. */
export const hasEngine = (type: VehicleEnum) => type !== VehicleEnum.TRAILER;
/** Utovarni prostor (capacity, dimensions, Code XL, rampa, oprema): everything but a tegljač. */
export const hasLoadSpace = (type: VehicleEnum) => type !== VehicleEnum.TRUCK;

/** Croatian names (today's form shows the English ones: Tilt Truck, Cistern, Undercarriage for containers). */
export const LOAD_LABEL: Record<VehicleLoadEnum, string> = {
  [VehicleLoadEnum.TILT_TRUCK]: 'Cerada',
  [VehicleLoadEnum.FURGON]: 'Furgon',
  [VehicleLoadEnum.FRIGO]: 'Hladnjača',
  [VehicleLoadEnum.CISTERN]: 'Cisterna',
  [VehicleLoadEnum.CONTAINER_TRAILER]: 'Kontejnerska šasija',
  [VehicleLoadEnum.KIPER]: 'Kiper',
};

/** Load types a type can have (as today: a solo kamion is never a cisterna or a kontejnerska šasija). */
export function loadTypesFor(type: VehicleEnum): VehicleLoadEnum[] {
  const all = Object.keys(LOAD_LABEL) as VehicleLoadEnum[];
  if (type !== VehicleEnum.SOLO_TRUCK) return all;
  return all.filter((load) => load !== VehicleLoadEnum.CISTERN && load !== VehicleLoadEnum.CONTAINER_TRAILER);
}

export const loadLabel = (load: string | null | undefined) =>
  load ? (LOAD_LABEL[load as VehicleLoadEnum] ?? load) : undefined;

export const EQUIPMENT_LABEL: Record<EquipmentEnum, string> = {
  [EquipmentEnum.EDGE_PROTECTION]: 'Kutnici',
  [EquipmentEnum.LASHING_CHAINS]: 'Lanci',
  [EquipmentEnum.ANTI_SLIP_MATS]: 'Protuklizne podloge',
  [EquipmentEnum.ADR]: 'ADR',
  [EquipmentEnum.LASHING_STRAPS]: 'Zatezni pojasevi',
  [EquipmentEnum.STANCHIONS]: 'Stupovi',
  [EquipmentEnum.CUSTOM_SEAL_STRING]: 'Carinsko uže',
  [EquipmentEnum.PORTABLE_FORKLIFT]: 'Ručni viljuškar',
  [EquipmentEnum.WASTE_CARRIER_LICENCE]: 'Ploče za označavanje otpada',
  [EquipmentEnum.MEAT_HOOK]: 'Kuke za meso',
  [EquipmentEnum.PALLETS]: 'Palete',
};

const TRUCK_BRANDS = [
  'Volvo',
  'Mercedes-Benz',
  'Scania',
  'MAN',
  'DAF',
  'Iveco',
  'Renault Trucks',
  'Kenworth',
  'International',
  'Western Star',
  'Mitsubishi Fuso',
];

/** Today's brand lists per type, offered as suggestions (any other name can be typed and saved). */
export const BRANDS: Record<VehicleEnum, string[]> = {
  [VehicleEnum.TRUCK]: TRUCK_BRANDS,
  [VehicleEnum.SOLO_TRUCK]: TRUCK_BRANDS,
  [VehicleEnum.TRAILER]: [
    'Schmitz Cargobull',
    'Krone',
    'Kögel',
    'Schwarzmüller',
    'Wielton',
    'SDC',
    'Fliegl',
    'LAMBERET',
    'Fruehauf',
    'Van Hool',
    'Benalu',
    'Langendorf',
    'Chereau',
    'Tirsan',
    'Kaessbohrer',
  ],
  [VehicleEnum.VAN]: [
    'Volkswagen',
    'Ford',
    'Renault',
    'Mercedes-Benz',
    'Peugeot',
    'Citroën',
    'Fiat',
    'Opel',
    'Iveco',
    'Nissan',
    'Toyota',
    'Hyundai',
    'MAN',
    'Dacia',
  ],
};

export const EMISSION_STANDARDS = ['EURO1', 'EURO2', 'EURO3', 'EURO4', 'EURO5', 'EURO6', 'EURO7', 'EURO8'];

/** „EURO6” → „Euro 6”. */
export const euroLabel = (value: string | null | undefined) =>
  value ? value.replace(/^EURO\s*/i, 'Euro ') : undefined;

// ---------------------------------------------------------------------------------------------------------------------
// Numbers: 0 / null = not entered (today's form saved 0 for every empty field)
// ---------------------------------------------------------------------------------------------------------------------

export const hasNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value !== 0;

/** „27.000”, „13,6”; undefined when not entered. */
export function formatNumber(value: number | null | undefined) {
  if (!hasNumber(value)) return undefined;
  return value.toLocaleString('hr-HR', { maximumFractionDigits: 2 });
}

/** „13,6 × 2,48 × 2,7” or undefined when no dimension was entered. */
export function formatDimensions(vehicle: Pick<Vehicle, 'dimensions'>) {
  const { length, width, height } = vehicle.dimensions ?? {};
  if (!hasNumber(length) && !hasNumber(width) && !hasNumber(height)) return undefined;
  return [length, width, height].map((value) => formatNumber(value) ?? '–').join(' × ');
}

// ---------------------------------------------------------------------------------------------------------------------
// Rokovi
// ---------------------------------------------------------------------------------------------------------------------

type DeadlineKey =
  | 'registrationExpiryDate'
  | 'mandatoryInsuranceExpiryDate'
  | 'optionalInsuranceExpiryDate'
  | 'leasingExpiryDate'
  | 'technicalInspectionExpiryDate'
  | 'periodicalTechnicalInspectionExpiryDate'
  | 'tachographExpiryDate'
  | 'fireExtinguisherCheckExpiryDate'
  | 'adrExpiryDate'
  | 'codeXlCertificateExpiryDate'
  | 'smallServiceExpiryDate'
  | 'bigServiceExpiryDate'
  | 'tiresReplacementExpiryDate';

/** Every deadline with the types it applies to (as today's form: tahograf, PP aparat, ADR not on poluprikolice; Code XL not on tegljači). */
export const DEADLINES: { key: DeadlineKey; label: string; group: string; appliesTo(type: VehicleEnum): boolean }[] = [
  { key: 'registrationExpiryDate', label: 'Registracija', group: 'Isprave', appliesTo: () => true },
  { key: 'mandatoryInsuranceExpiryDate', label: 'Obvezno osiguranje', group: 'Isprave', appliesTo: () => true },
  { key: 'optionalInsuranceExpiryDate', label: 'Kasko', group: 'Isprave', appliesTo: () => true },
  { key: 'leasingExpiryDate', label: 'Leasing', group: 'Isprave', appliesTo: () => true },
  { key: 'technicalInspectionExpiryDate', label: 'Tehnički pregled', group: 'Pregledi', appliesTo: () => true },
  {
    key: 'periodicalTechnicalInspectionExpiryDate',
    label: 'Periodički tehnički pregled',
    group: 'Pregledi',
    appliesTo: () => true,
  },
  { key: 'tachographExpiryDate', label: 'Tahograf', group: 'Pregledi', appliesTo: hasEngine },
  { key: 'fireExtinguisherCheckExpiryDate', label: 'Vatrogasni aparat', group: 'Pregledi', appliesTo: hasEngine },
  { key: 'adrExpiryDate', label: 'ADR', group: 'Certifikati', appliesTo: hasEngine },
  { key: 'codeXlCertificateExpiryDate', label: 'Code XL certifikat', group: 'Certifikati', appliesTo: hasLoadSpace },
  { key: 'smallServiceExpiryDate', label: 'Mali servis', group: 'Održavanje', appliesTo: () => true },
  { key: 'bigServiceExpiryDate', label: 'Veliki servis', group: 'Održavanje', appliesTo: () => true },
  { key: 'tiresReplacementExpiryDate', label: 'Gume', group: 'Održavanje', appliesTo: () => true },
];

export interface Deadline {
  key: DeadlineKey;
  label: string;
  group: string;
  date: string | undefined;
  state: ExpiryState;
}

export function deadlinesOf(vehicle: Vehicle, now: Date = new Date()): Deadline[] {
  return DEADLINES.filter((deadline) => deadline.appliesTo(vehicle.type)).map(({ key, label, group }) => {
    const date = vehicle[key] || undefined;
    return { key, label, group, date, state: getExpiryState(date, now) };
  });
}

export function problemsOf(vehicle: Vehicle, now: Date = new Date()) {
  const deadlines = deadlinesOf(vehicle, now);
  return {
    expired: deadlines.filter((deadline) => deadline.state === 'expired'),
    soon: deadlines.filter((deadline) => deadline.state === 'soon'),
  };
}

/** Rokovi sort: more expired first, then more expiring soon. */
export function deadlineSeverity(vehicle: Vehicle, now: Date = new Date()) {
  const { expired, soon } = problemsOf(vehicle, now);
  return expired.length * 100 + soon.length;
}

/** Rok is masculine: 1 istekao · 2 istekla · 5 isteklo. */
export const expiredWord = (count: number) => plural(count, ['istekao', 'istekla', 'isteklo']);
/** 1 istječe · 2 istječu · 5 istječe (uskoro). */
export const soonWord = (count: number) => plural(count, ['istječe', 'istječu', 'istječe']);

/** „Registracija: isteklo prije 8 d” / „Tahograf: istječe za 10 d” (Rokovi tooltip). */
export function deadlineSummary(deadline: Deadline, now: Date = new Date()) {
  const days = daysFromToday(deadline.date!, now);
  if (days < 0) return `${deadline.label}: isteklo prije ${-days} d`;
  return `${deadline.label}: ${days === 0 ? 'istječe danas' : `istječe za ${days} d`}`;
}

/** „Registracija (isteklo 2.11.2026.)” / „Tahograf (do 20.11.2026.)” (banner on the vehicle page). */
export function deadlineBannerItem(deadline: Deadline) {
  const date = formatDate(deadline.date!);
  return deadline.state === 'expired' ? `${deadline.label} (isteklo ${date})` : `${deadline.label} (do ${date})`;
}

// ---------------------------------------------------------------------------------------------------------------------
// Search: registration (also without spaces / dashes), brand, VIN
// ---------------------------------------------------------------------------------------------------------------------

const compact = (value: string) => value.replace(/[\s-]/g, '');

export function matchesVehicle(vehicle: Vehicle, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [vehicle.registration, vehicle.brand, vehicle.vehicleIdentificationNumber]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (haystack.includes(needle)) return true;
  const compactNeedle = compact(needle);
  return !!compactNeedle && compact(haystack).includes(compactNeedle);
}

// ---------------------------------------------------------------------------------------------------------------------
// Header specs
// ---------------------------------------------------------------------------------------------------------------------

/** The one or two numbers a dispatcher needs before assigning (chips under the registration). */
export function specsOf(vehicle: Vehicle) {
  const specs: string[] = [];
  const load = loadLabel(vehicle.vehicleLoadType);
  if (hasLoadSpace(vehicle.type)) {
    if (load) specs.push(load);
    if (hasNumber(vehicle.loadCapacity)) specs.push(`${formatNumber(vehicle.loadCapacity)} kg`);
    if (hasNumber(vehicle.dimensions?.length)) specs.push(`${formatNumber(vehicle.dimensions.length)} m`);
    if (vehicle.ramp) specs.push('Rampa');
  }
  if (vehicle.type === VehicleEnum.TRUCK) {
    const euro = euroLabel(vehicle.emissionStandard);
    if (euro) specs.push(euro);
    if (hasNumber(vehicle.enginePower)) specs.push(`${formatNumber(vehicle.enginePower)} kW`);
  }
  return specs;
}

/** ADR chip in the header (a motor vehicle with an ADR date; its state is in Rokovi). */
export const hasAdr = (vehicle: Vehicle) => hasEngine(vehicle.type) && !!vehicle.adrExpiryDate;
