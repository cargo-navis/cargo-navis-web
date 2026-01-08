import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteTenantLogo, getCurrentTenant, updateTenant, uploadTenantLogo } from '@/lib/api';
import type { UpdateTenantParams } from '@/lib/api/tenant.d';

export function useCurrentTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: getCurrentTenant,
  });
}

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantParams) => updateTenant(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
};

type UploadTenantLogoParams = {
  file: File;
  fileName: string;
};

export const useUploadTenantLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadTenantLogoParams) => uploadTenantLogo(params.file, params.fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
};

export const useDeleteTenantLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTenantLogo(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
};
