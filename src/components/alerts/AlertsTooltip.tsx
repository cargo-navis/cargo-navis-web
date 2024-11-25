import type { Alert } from '@/lib/api';
import { ruleToPropertyMap, ruleToTextMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { Box, FlexLayout, Text, Tooltip, type TooltipProps } from '@/ui';

interface AlertsTooltipProps extends Omit<TooltipProps, 'content'> {
  alerts: Alert[];
  children: React.ReactElement;
}

export const AlertsTooltip: React.FC<AlertsTooltipProps> = ({ alerts, children, ...rest }) => {
  const content = (
    <FlexLayout className="flex-col gap-2 p-2">
      <Text color="text-light-50">Rok istječe za sljedeće podatke:</Text>
      <Box as="ul" className="list-disc pl-4">
        {alerts.map((a) => (
          <TooltipListItem alert={a} key={a.id} />
        ))}
      </Box>
    </FlexLayout>
  );

  return (
    <Tooltip {...rest} content={content}>
      {children}
    </Tooltip>
  );
};

const TooltipListItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  const text = ruleToTextMap[alert.ruleName];

  const property = ruleToPropertyMap[alert.ruleName];
  const expiryDate = alert.alertable[property];
  const expiryDateString = new Date(expiryDate as string);
  const formattedDate = new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short' }).format(expiryDateString);

  return (
    <Box as="li" className="marker:text-light-50">
      <FlexLayout className="items-center justify-between gap-3">
        <Text color="text-light-50" variant="text-s">
          {text}:
        </Text>
        <Text color="text-light-50" variant="text-s-bold">
          {formattedDate}
        </Text>
      </FlexLayout>
    </Box>
  );
};
