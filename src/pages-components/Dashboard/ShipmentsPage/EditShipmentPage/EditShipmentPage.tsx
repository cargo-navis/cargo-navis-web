import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { EntityNotFound, isNotFoundError } from '@/components/shared/not-found';
import { useCurrentTenant, useShipment } from '@/lib/hooks';
import { NalogForm } from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/NalogForm';
import {
  NalogFormHeader,
  NalogFormProblem,
  NalogFormSkeleton,
  useInitialValues,
} from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/NalogFormLayout';
import { fetchPostalCodeData } from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/utils';
import { fromEdit } from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/values';

import { shipmentHref } from '../shared/actions';

/** Uredi nalog: /dashboard/shipments/[id]/edit (lab /nalog-form „Uredi”). */
export const EditShipmentPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const tenantQuery = useCurrentTenant();
  const shipmentQuery = useShipment(id);
  const tenant = tenantQuery.data;
  const shipment = shipmentQuery.data;

  const { values, failed } = useInitialValues(
    tenant && shipment ? () => fromEdit(shipment, tenant, fetchPostalCodeData) : null,
    id ?? ''
  );

  let content: ReactNode;
  if (isNotFoundError(shipmentQuery.error)) {
    content = <EntityNotFound kind="shipment" />;
  } else if (failed || tenantQuery.isError || shipmentQuery.isError) {
    content = (
      <NalogFormProblem
        backHref={id ? shipmentHref(id) : '/dashboard/shipments'}
        backLabel={id ? 'Natrag na nalog' : 'Nalozi'}
        danger
        description="Možda je obrisan, ili je problem kod nas. Pokušaj ponovno."
        icon="IconAlertOctagon"
        title="Nalog se nije učitao"
        onRetry={() => router.reload()}
      />
    );
  } else if (!values || !tenant || !shipment) {
    content = <NalogFormSkeleton />;
  } else {
    content = (
      <div className="flex flex-col gap-6">
        <NalogFormHeader
          backHref={shipmentHref(shipment.id)}
          backLabel={`Nalog #${shipment.orderNumber}`}
          title={`Uredi nalog #${shipment.orderNumber}`}
        />
        <NalogForm
          cancelHref={shipmentHref(shipment.id)}
          initial={values}
          key={shipment.id}
          mode="edit"
          shipment={shipment}
          tenant={tenant}
        />
      </div>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={
        shipment
          ? [CRUMBS.shipments, { label: shipment.orderNumber, href: shipmentHref(shipment.id) }, { label: 'Uredi' }]
          : undefined
      }
    >
      <PageTitle title={shipment?.orderNumber} type="Uredi nalog" />
      {content}
    </DashboardLayout>
  );
};
