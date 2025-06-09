import { Button, FlexLayout, Text } from '@/ui';

export const EmptyTableState = ({
  title,
  description,
  buttonText,
  buttonHref,
}: {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}) => {
  return (
    <FlexLayout className="flex-col gap-4 items-center justify-center h-full my-10">
      <Text color="text-color-2" variant="text-l-medium">
        {title}
      </Text>
      <Text color="text-color-3" variant="text-s-medium">
        {description}
      </Text>
      <Button href={buttonHref} iconLeft="PlusIcon" text={buttonText} />
    </FlexLayout>
  );
};
