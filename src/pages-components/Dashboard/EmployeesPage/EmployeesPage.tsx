import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Employee } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useEmployees, useScrollRestoration } from '@/lib/hooks/';
import { Box, Button, DisplayIf, FlexLayout, Heading, TextInput } from '@/ui';

import { EmployeesTable } from './EmployeesTable';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Employee>>[1] = {
  keys: ['fullName', 'firstName', 'lastName', 'email', 'phoneNumber'],
  threshold: 0.35,
};

export const EmployeesPage = () => {
  const { data, isLoading } = useEmployees();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent employees={data || []} />}</DashboardLayout>;
};

const MainContent = ({ employees }: { employees: Employee[] }) => {
  const isEmpty = employees.length === 0;
  useScrollRestoration('employees', { isReady: !isEmpty });
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(employees, FUSE_OPTIONS), [employees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim();
    if (!query) return employees;

    return fuse.search(query).map((result) => result.item);
  }, [employees, search, fuse]);

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Zaposlenici
        </Heading>
        <DisplayIf condition={!isEmpty}>
          <Button href="/dashboard/employees/new" iconLeft="PlusIcon" text="Dodaj Zaposlenika" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/employees/new"
            buttonText="Dodaj Zaposlenika"
            description="Kada dodate zaposlenike, oni će se prikazati ovdje."
            title="👥 Još nema zapisa o zaposlenicima"
          />
        ) : (
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                autoFocus
                iconLeft="MagnifyingGlassIcon"
                iconRight={search ? 'XMarkIcon' : undefined}
                placeholder="Pretraži zaposlenike..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <EmployeesTable employees={filteredEmployees} />
          </>
        )}
      </Box>
    </Box>
  );
};
