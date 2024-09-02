import { useQuery } from '@tanstack/react-query';
import { Employee } from '@/lib/employees';
import { getEmployees } from '@/lib/api';

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await getEmployees();
      const { data } = await res.json();

      return data;
    }
  });
}