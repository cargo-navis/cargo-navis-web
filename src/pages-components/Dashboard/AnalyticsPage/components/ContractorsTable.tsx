import { useMemo } from 'react';

import { TransportContractorAnalyticsItem } from '@/lib/api';
import { useContractors } from '@/lib/hooks/api';
import { formatEur, formatMarginShare } from '@/lib/utils/analytics';
import { FlexLayout, Text } from '@/ui';

import { AnalyticsCard, EmptyTableState, TableHeader, TableRow } from './AnalyticsCard';
import { ParticipationHeader } from './ParticipationHeader';

interface ContractorsTableProps {
  data: TransportContractorAnalyticsItem[];
}

export const ContractorsTable = ({ data }: ContractorsTableProps) => {
  const { data: contractors } = useContractors();

  // One lookup for every row, instead of a query per row.
  const namesById = useMemo(
    () => new Map((contractors ?? []).map((contractor) => [contractor.id, contractor.name])),
    [contractors]
  );

  const sortedData = useMemo(() => [...data].sort((a, b) => b.margin - a.margin), [data]);

  return (
    <AnalyticsCard title="Prijevoznici">
      <TableHeader>
        <Text className="flex-1" color="text-color-2" variant="text-s-medium">
          Prijevoznik
        </Text>
        <Text className="basis-[120px] text-right" color="text-color-2" variant="text-s-medium">
          Br. naloga
        </Text>
        <ParticipationHeader
          basis="basis-[160px]"
          label="Prihod"
          tooltip="Ukupno naplaćeno klijentima za naloge koje je odradio ovaj prijevoznik."
        />
        <ParticipationHeader
          basis="basis-[160px]"
          label="Trošak"
          tooltip="Ukupno plaćeno ovom prijevozniku za odrađene naloge."
        />
        <ParticipationHeader basis="basis-[160px]" label="RUC" tooltip="Razlika između naplaćenog prihoda i troška." />
        <Text className="basis-[120px] text-right" color="text-color-2" variant="text-s-medium">
          Marža
        </Text>
      </TableHeader>

      <FlexLayout className="flex-col">
        {sortedData.length === 0 ? (
          <EmptyTableState text="Nema agencijskih naloga u odabranom razdoblju." />
        ) : (
          sortedData.map((contractor, index) => (
            <TableRow index={index} key={contractor.contractorId}>
              <Text className="flex-1" color="text-color-1" variant="text-s-medium">
                {namesById.get(contractor.contractorId) || '—'}
              </Text>
              <Text className="basis-[120px] text-right" color="text-color-1" variant="text-s">
                {contractor.shipmentCount}
              </Text>
              <Text className="basis-[160px] text-right" color="text-color-1" variant="text-s">
                {formatEur(contractor.totalRevenue)}
              </Text>
              <Text className="basis-[160px] text-right" color="text-color-1" variant="text-s">
                {formatEur(contractor.totalCost)}
              </Text>
              <Text
                className={`basis-[160px] text-right ${contractor.margin < 0 ? 'text-red-500' : ''}`}
                color={contractor.margin < 0 ? undefined : 'text-color-1'}
                variant="text-s-medium"
              >
                {formatEur(contractor.margin)}
              </Text>
              <Text className="basis-[120px] text-right" color="text-color-1" variant="text-s">
                {formatMarginShare(contractor.margin, contractor.totalRevenue) ?? '—'}
              </Text>
            </TableRow>
          ))
        )}
      </FlexLayout>
    </AnalyticsCard>
  );
};
