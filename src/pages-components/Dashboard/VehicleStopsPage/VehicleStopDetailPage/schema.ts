import * as Yup from 'yup';

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
