import { useRouter } from 'next/router';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployee } from '@/lib/hooks';
import { employeeHref, fullName } from '@/pages-components/Dashboard/EmployeesPage/employees';
import { EmployeeForm } from '@/pages-components/Dashboard/NewEmployeePage/EmployeeForm';
import { PhoneBackLink } from '@/pages-components/Dashboard/Partners/PartnerDetail';
import { Icon } from '@/ui';

/** Uredi zaposlenika (lab /employees „Uredi”). */
export const EditEmployeePage = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const { data: employee, isLoading, isError, refetch } = useEmployee(id ?? '');

  return (
    <DashboardLayout
      breadcrumbs={
        employee
          ? [CRUMBS.employees, { label: fullName(employee), href: employeeHref(employee.id) }, { label: 'Uredi' }]
          : undefined
      }
    >
      <PageTitle title={employee ? fullName(employee) : undefined} type="Uredi zaposlenika" />
      {employee ? (
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <PhoneBackLink href={employeeHref(employee.id)} label={fullName(employee)} />
            <h1 className="font-heading text-3xl font-bold tracking-tight">Uredi: {fullName(employee)}</h1>
          </header>
          <EmployeeForm
            employee={employee}
            key={employee.id}
            onCancel={() => void router.push(employeeHref(employee.id))}
            onSaved={() => void router.replace(employeeHref(employee.id))}
          />
        </div>
      ) : isLoading || !id ? (
        <div aria-busy className="flex max-w-3xl flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          {Array.from({ length: 6 }, (_, index) => (
            <div className="flex flex-col gap-2" key={index}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant={isError ? 'danger' : 'icon'}>
                <Icon icon={isError ? 'IconAlertTriangle' : 'IconUsers'} size="m" />
              </EmptyMedia>
              <EmptyTitle>{isError ? 'Podaci se nisu učitali' : 'Zaposlenik nije pronađen'}</EmptyTitle>
              <EmptyDescription>
                {isError ? 'Provjeri vezu i pokušaj ponovno.' : 'Možda je poveznica pogrešna.'}
              </EmptyDescription>
            </EmptyHeader>
            {isError && (
              <Button variant="outline" onClick={() => void refetch()}>
                <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
              </Button>
            )}
          </Empty>
        </div>
      )}
    </DashboardLayout>
  );
};
