import Link from 'next/link';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { useSolos, useTrailers, useTrucks, useVans, useVehicles } from '@/lib/hooks';
import { Box, Divider, FlexLayout, Heading, Icon, Text } from '@/ui';

export const FleetPage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Vozni park" />
      <Box>
        <Heading as="h1" variant="text-xl">
          Pregled Flote
        </Heading>
      </Box>
      <FlexLayout className="gap-5 py-5">
        <FleetSummary />
      </FlexLayout>
    </DashboardLayout>
  );
};

const FleetSummary = () => {
  const { data: vehicles } = useVehicles();

  const { trucks } = useTrucks();
  const { trailers } = useTrailers();
  const { solos } = useSolos();
  const { vans } = useVans();

  if (!vehicles) return 'Loading...';

  return (
    <FlexLayout className="flex-col gap-2">
      <FlexLayout className="flex-col gap-4 w-[360px]">
        <Text color="text-color-2" variant="text-l-medium">
          Rezime
        </Text>
        <Divider />
        <FlexLayout className="flex-col gap-3">
          <OverviewItem href="/dashboard/fleet/trucks" label="Tegljači" value={trucks?.length} />
          <OverviewItem href="/dashboard/fleet/trailers" label="Poluprikolice" value={trailers?.length} />
          <OverviewItem href="/dashboard/fleet/solo-trucks" label="Solo Kamioni" value={solos?.length} />
          <OverviewItem href="/dashboard/fleet/vans" label="Kombiji" value={vans?.length} />
        </FlexLayout>
        <Divider />
        <FlexLayout className="justify-between items-baseline uppercase text-color-2">
          <Text variant="text-m-medium">FLOTA UKUPNO</Text>
          <Text variant="text-m-medium">{vehicles.length}</Text>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

interface InfoItemProps {
  label: string;
  value?: string | number;
  href: string;
}

export const OverviewItem: React.FC<InfoItemProps> = ({ label, value, href }) => {
  if (!value) return;

  return (
    <Link href={href}>
      <FlexLayout className="group/overview-item relative justify-between items-center uppercase text-color-2 hover:text-teal-500">
        <Icon
          className="absolute opacity-0 left-[-22px] translate-x-[-4px] group-hover/overview-item:opacity-100 group-hover/overview-item:translate-x-0 w-5 transition-transform ease"
          icon="IconChevronRight"
        />
        <Text variant="text-s-medium">{label}:</Text>
        <Text variant="text-m-medium">{value}</Text>
      </FlexLayout>
    </Link>
  );
};
