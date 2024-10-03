import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSolos, useTrailers, useTrucks, useVans, useVehicles } from '@/lib/hooks';
import { Box, Divider, FlexLayout, Heading, Icon, Text } from '@/ui';
import Link from 'next/link';

export const FleetPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Fleet - Overview
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
        <Text variant="text-l-medium" color="text-color-2">
          Summary
        </Text>
        <Divider />
        <FlexLayout className="flex-col gap-3">
          <OverviewItem label="Trucks" href="/dashboard/fleet/trucks" value={trucks?.length} />
          <OverviewItem label="Trailers" href="/dashboard/fleet/trailers" value={trailers?.length} />
          <OverviewItem label="Solo Trucks" href="/dashboard/fleet/solo-trucks" value={solos?.length} />
          <OverviewItem label="Vans" href="/dashboard/fleet/vans" value={vans?.length} />
        </FlexLayout>
        <Divider />
        <FlexLayout className="justify-between items-baseline uppercase text-color-2">
          <Text variant="text-m-medium">FLEET TOTAL</Text>
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
          icon="ChevronRightIcon"
          className="absolute opacity-0 left-[-22px] translate-x-[-4px] group-hover/overview-item:opacity-100 group-hover/overview-item:translate-x-0 w-5 transition-transform ease"
        />
        <Text variant="text-s-medium">{label}:</Text>
        <Text variant="text-m-medium">{value}</Text>
      </FlexLayout>
    </Link>
  );
};