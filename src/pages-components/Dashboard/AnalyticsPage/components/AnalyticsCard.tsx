import type { ReactNode } from 'react';

import { FlexLayout, Text } from '@/ui';

interface AnalyticsCardProps {
  title: string;
  children: ReactNode;
}

/** White card wrapper shared by every analytics table. */
export const AnalyticsCard = ({ title, children }: AnalyticsCardProps) => (
  <FlexLayout className="flex-1 flex-col gap-4 p-4 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
    <Text color="text-color-1" variant="text-xl-bold">
      {title}
    </Text>
    {children}
  </FlexLayout>
);

interface TableRowProps {
  index: number;
  children: ReactNode;
}

export const TableRow = ({ index, children }: TableRowProps) => (
  <FlexLayout
    className={`w-full py-3 px-4 border-b border-b-black-alpha-10 dark:border-b-white-alpha-25 last:border-b-0 ${
      index % 2 === 0 ? 'bg-transparent' : 'bg-black-alpha-05 dark:bg-white-alpha-05'
    }`}
  >
    {children}
  </FlexLayout>
);

export const TableHeader = ({ children }: { children: ReactNode }) => (
  <FlexLayout className="w-full py-3 px-4 bg-dark-200 dark:bg-white-alpha-10 rounded-t-s">{children}</FlexLayout>
);

export const EmptyTableState = ({ text }: { text: string }) => (
  <FlexLayout className="w-full py-8 items-center justify-center">
    <Text color="text-color-3" variant="text-s">
      {text}
    </Text>
  </FlexLayout>
);
