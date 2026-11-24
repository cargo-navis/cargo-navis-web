import type { Employee } from '@/lib/api/employees.d';

import { day } from '../../support/time';
import { noContent, notFound, ok, route } from '../http';
import { newId, uuid } from '../ids';
import { seedKorisnik } from './korisnik';

/** Zaposlenici: the signed-in dispatcher (korisnik) plus drivers. */
export const VOZAC = {
  ivan: uuid(311),
  petra: uuid(312),
};

function driver(id: string, firstName: string, lastName: string, phoneNumber: string): Employee {
  return {
    id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    phoneNumber,
    email: `${firstName.toLowerCase()}@e2e.cargo-navis.test`,
    gender: 'M' as Employee['gender'],
    positions: ['driver'] as Employee['positions'],
    governmentId: '98765432109',
    governmentIdExpiryDate: day(900),
    nationality: 'HR',
    driverLicenceCategories: ['B', 'C', 'CE'] as Employee['driverLicenceCategories'],
    driverLicenceExpiryDate: day(700),
    professionalDriverLicenceExpiryDate: day(500),
    medicalExaminationExpiryDate: day(300),
    driverTachographCardId: `HR-TAH-${id.slice(-3)}`,
    driverTachographCardExpiryDate: day(400),
    messageChannel: 'whatsapp' as Employee['messageChannel'],
    hasSetPassword: false,
    deleted: false,
  };
}

export function seedZaposlenici(): Employee[] {
  return [
    seedKorisnik().user,
    driver(VOZAC.ivan, 'Ivan', 'Horvat', '+385981112222'),
    { ...driver(VOZAC.petra, 'Petra', 'Babić', '+385983334444'), gender: 'F' as Employee['gender'] },
  ];
}

export const zaposleniciRoutes = [
  // Deleted ones too, flagged: the app filters them out itself (useEmployees).
  route('GET', '/api/employees', (_, db) => ok(db.zaposlenici)),
  route('GET', '/api/employees/:id', ({ params }, db) => {
    const employee = db.zaposlenici.find((entry) => entry.id === params.id);
    return employee ? ok(employee) : notFound('Employee');
  }),
  route('POST', '/api/employees', ({ body }, db) => {
    const employee: Employee = {
      id: newId(),
      hasSetPassword: false,
      deleted: false,
      ...body,
      fullName: `${body.firstName} ${body.lastName}`,
    };
    db.zaposlenici.push(employee);
    return ok(employee, 201);
  }),
  route('PATCH', '/api/employees/:id', ({ params, body }, db) => {
    const employee = db.zaposlenici.find((entry) => entry.id === params.id);
    if (!employee) return notFound('Employee');
    Object.assign(employee, body);
    employee.fullName = `${employee.firstName} ${employee.lastName}`;
    return ok(employee);
  }),
  route('DELETE', '/api/employees/:id', ({ params }, db) => {
    const employee = db.zaposlenici.find((entry) => entry.id === params.id);
    if (!employee) return notFound('Employee');
    employee.deleted = true;
    return noContent();
  }),
  route('POST', '/api/employees/:id/resend-invite', () => noContent()),
];
