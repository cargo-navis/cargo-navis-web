import type { VehicleStop, VehicleStopGroup } from './vehicleStops.d';

const vehicleIds = [
  '1a033f5d-a884-4d12-8012-831e48959b86',
  '817b7bff-ea91-44e0-b756-ecf8ffba9df7',
  '0929677c-8676-4ecb-8565-b9db9258b411',
  '76dcd97d-4a46-4a6f-87ff-9c24f5cc627a',
  'df3cc9ba-2193-44b7-b104-e43d494cb1d6',
  'e7a2dc86-483a-48d3-8173-ccb8c67db707',
  'f57e7349-f3a3-4518-aeca-cd932e524550',
  'efc49154-69c4-49d1-bb9e-b6b6766ac987',
  '1db584b3-cb1a-4d87-99f7-713b24184476',
  '3ea35754-6b63-4c0b-a5d1-3f3794b97307',
];

const addresses = [
  { streetName: 'Ilica 1', postalCode: '10000', city: 'Zagreb' },
  { streetName: 'Vukovarska 58', postalCode: '10000', city: 'Zagreb' },
  { streetName: 'Slavonska avenija 6', postalCode: '10000', city: 'Zagreb' },
  { streetName: 'Radnička cesta 37b', postalCode: '10000', city: 'Zagreb' },
  { streetName: 'Heinzelova 62', postalCode: '10000', city: 'Zagreb' },
  { streetName: 'Korzo 1', postalCode: '51000', city: 'Rijeka' },
  { streetName: 'Fiumara 13', postalCode: '51000', city: 'Rijeka' },
  { streetName: 'Riva 16', postalCode: '21000', city: 'Split' },
  { streetName: 'Vukovarska 1', postalCode: '21000', city: 'Split' },
  { streetName: 'Kneza Trpimira 2', postalCode: '21000', city: 'Split' },
  { streetName: 'Stradun 1', postalCode: '20000', city: 'Dubrovnik' },
  { streetName: 'Boškovićeva 5', postalCode: '20000', city: 'Dubrovnik' },
  { streetName: 'Europska avenija 4', postalCode: '31000', city: 'Osijek' },
  { streetName: 'Kapucinska 40', postalCode: '31000', city: 'Osijek' },
  { streetName: 'Županijska 6', postalCode: '31000', city: 'Osijek' },
  { streetName: 'Trg Ante Starčevića 8', postalCode: '43000', city: 'Bjelovar' },
  { streetName: 'Masarykova 14', postalCode: '43000', city: 'Bjelovar' },
  { streetName: 'Frankopanska 1', postalCode: '47000', city: 'Karlovac' },
  { streetName: 'Prilaz Vladislava Brajkovića 2', postalCode: '47000', city: 'Karlovac' },
  { streetName: 'Obala kneza Branimira 9', postalCode: '23000', city: 'Zadar' },
  { streetName: 'Široka ulica 3', postalCode: '23000', city: 'Zadar' },
  { streetName: 'Trg Slobode 12', postalCode: '42000', city: 'Varaždin' },
  { streetName: 'Optujska 2', postalCode: '42000', city: 'Varaždin' },
  { streetName: 'Pavelinska 3', postalCode: '48000', city: 'Koprivnica' },
  { streetName: 'Trg bana Jelačića 7', postalCode: '48000', city: 'Koprivnica' },
];

const driverIds = [
  '09662658-3285-4873-b099-c006570259b7', // Josip Grubeša
  '31b7d311-9175-4ce6-aae4-f171d9cfee46', // Ivan Horvat
  '750f6edd-6132-404c-ae26-ff389baf58f2', // Luka Petrović
  '0c8c104f-0bac-4b1d-b533-84a9eda8e684', // Mislav Šturlan
  '3b2bffd3-29a5-480c-8d5c-4e573e20f01c', // Matija Grgić
  '1bbefe42-bcd0-4854-be74-a1ba2dcb7eb9', // Domagoj Lovrić
  '4d1f2d47-e621-4bf2-848a-c17f0363b258', // Kristijan Korać
  'c08db374-e20e-4bfd-a773-29c1b076c529', // Igor Matanović
  '90b464a9-271a-4a36-a28d-f4bc653b39a5', // Muhwar Sinayomi
  '58c04391-a89e-4686-97cf-8356ff798d77', // Marko Hezler
  'b70004f3-0580-4db2-9f75-f7a5acdaa7b6', // Viktor Tadija Hezler
  'ffd2f329-d38e-4965-b5f3-9d21f819d2b7', // Joško Mendelez
];

const disponentIds = [
  '57b27fdc-ba1f-4662-867c-392bd4468f03', // Dario Jukić
  '8e23227a-9b30-48b7-ae5f-5e21a9eed331', // Krešimir Pavlović
  '2e35d96f-4de0-46d8-bbc3-32bc02563cac', // Pristijan Porać
  '09662658-3285-4873-b099-c006570259b7', // Josip Grubeša
  '750f6edd-6132-404c-ae26-ff389baf58f2', // Luka Petrović
  '90b464a9-271a-4a36-a28d-f4bc653b39a5', // Muhwar Sinayomi
  '58c04391-a89e-4686-97cf-8356ff798d77', // Marko Hezler
];

function uuid(seed: number): string {
  const hex = seed.toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(1, 4)}-${hex.padStart(12, '0')}`;
}

function generateStops(vehicleId: string, startIndex: number, count: number) {
  const stops: VehicleStop[] = [];
  let previousStopId: string | null = null;

  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const id = uuid(idx + 1000);
    const day = ((idx * 3) % 28) + 1;
    const month = ((idx % 3) + 4).toString().padStart(2, '0');
    const isUnvisited = i >= count - 2;
    const date = isUnvisited ? undefined : `2026-${month}-${day.toString().padStart(2, '0')}`;
    const fallbackDate = `2026-${month}-${day.toString().padStart(2, '0')}`;
    const createdAt = `${fallbackDate}T${(8 + (idx % 10)).toString().padStart(2, '0')}:${((idx * 7) % 60).toString().padStart(2, '0')}:00Z`;

    const hasLoading = idx % 3 === 0;
    const hasUnloading = idx % 4 === 0;

    stops.push({
      id,
      createdAt,
      vehicleId,
      previousStopId,
      address: addresses[idx % addresses.length],
      date,
      driverId: driverIds[idx % driverIds.length],
      trailerId: idx % 5 === 0 ? `trailer-${uuid(idx + 5000)}` : null,
      disponentId: disponentIds[idx % disponentIds.length],
      loadingCargos: hasLoading
        ? Array.from({ length: (idx % 3) + 1 }, (_, ci) => ({ id: uuid(idx * 100 + ci), type: 'pallet' }))
        : [],
      unloadingCargos: hasUnloading
        ? Array.from({ length: (idx % 2) + 1 }, (_, ci) => ({ id: uuid(idx * 200 + ci), type: 'pallet' }))
        : [],
      documents: [],
      messageSentAt: idx % 6 === 0 ? createdAt : null,
    });

    previousStopId = id;
  }

  return stops;
}

export const mockVehicleStopGroups: VehicleStopGroup[] = vehicleIds.map((vehicleId, vehicleIndex) => {
  const count = 20;
  const startIndex = vehicleIndex * count;
  return {
    vehicleId,
    stops: generateStops(vehicleId, startIndex, count),
  };
});
