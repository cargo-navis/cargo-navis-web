import * as Yup from 'yup';

import type { VehicleStop } from '@/lib/api/vehicleStops';

export const vehicleStopSchema = Yup.object().shape({
  address: Yup.object().shape({
    streetName: Yup.string().required('Ulica je obavezna'),
    countryCode: Yup.string().required('Država je obavezna'),
    addressPostalCode: Yup.object()
      .shape({
        label: Yup.string().required(),
        value: Yup.string().required(),
      })
      .required('Poštanski broj je obavezan'),
  }),
  date: Yup.string().nullable().optional(),
  driverId: Yup.string().nullable().optional(),
  trailerId: Yup.string().nullable().optional(),
  disponentId: Yup.string().nullable().optional(),
});

export interface VehicleStopFormValues {
  address: {
    streetName: string;
    countryCode: string;
    addressPostalCode: { value?: string; label?: string };
  };
  date?: string | null;
  driverId?: string | null;
  trailerId?: string | null;
  disponentId?: string | null;
}

export const vehicleStopDefaultValues: VehicleStopFormValues = {
  address: {
    streetName: '',
    countryCode: '',
    addressPostalCode: {},
  },
  date: null,
  driverId: null,
  trailerId: null,
  disponentId: null,
};

export function getVehicleStopFormDefaults(stop: VehicleStop): VehicleStopFormValues {
  const { address } = stop;
  const postalCodeLabelParts = [address?.postalCode, address?.placeName].filter(Boolean);
  return {
    address: {
      streetName: address?.streetName ?? '',
      countryCode: address?.countryCode ?? '',
      addressPostalCode: address ? { value: address.id, label: postalCodeLabelParts.join(', ') } : {},
    },
    date: stop.date ?? null,
    driverId: stop.driverId ?? null,
    trailerId: stop.trailerId ?? null,
    disponentId: stop.disponentId ?? null,
  };
}
