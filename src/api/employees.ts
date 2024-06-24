import sortBy from 'lodash/sortBy';

import { employees } from '@/lib/mocks/employees';
import { sleep } from '@/lib/utils/async';

export async function getEmployees() {
  // await sleep();
  return sortBy(employees, (e) => e.position);
}