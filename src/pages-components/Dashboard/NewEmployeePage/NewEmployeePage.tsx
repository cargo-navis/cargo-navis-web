import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { PositionEnum } from '@/lib/api/employees';
import { employeeHref } from '@/pages-components/Dashboard/EmployeesPage/employees';
import { PhoneBackLink } from '@/pages-components/Dashboard/Partners/PartnerDetail';

import { EmployeeForm } from './EmployeeForm';

/** ?pozicija=vozac | ured (first use „Dodaj vozača” / „Dodaj nekoga iz ureda”). */
function startPositionsFrom(value: unknown): PositionEnum[] {
  return value === 'ured' ? [PositionEnum.Dispatcher] : [PositionEnum.Driver];
}

/** Novi zaposlenik (lab /employees „Novi”). */
export const NewEmployeePage = () => {
  const router = useRouter();

  return (
    <DashboardLayout>
      <PageTitle title="Novi zaposlenik" />
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <PhoneBackLink href="/dashboard/employees" label="Zaposlenici" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">Novi zaposlenik</h1>
        </header>
        {router.isReady && (
          <EmployeeForm
            startPositions={startPositionsFrom(router.query.pozicija)}
            onCancel={() => void router.push('/dashboard/employees')}
            onSaved={(employee) =>
              void router.replace(employee?.id ? employeeHref(employee.id) : '/dashboard/employees')
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
};
