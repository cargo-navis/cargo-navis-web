import { DisplayIf, FlexLayout, Icon, Text, TextButton } from '@/ui';

interface FilterHeaderProps {
  isExpanded: boolean;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onToggleExpanded: () => void;
  onClearAll: () => void;
}

export const FilterHeader = ({
  isExpanded,
  hasActiveFilters,
  activeFiltersCount,
  onToggleExpanded,
  onClearAll,
}: FilterHeaderProps) => {
  return (
    <FlexLayout className="items-center justify-between p-4 cursor-pointer" onClick={onToggleExpanded}>
      <FlexLayout className="items-center gap-2">
        <Icon
          className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          icon="IconChevronRight"
        />
        <Text variant="text-s-medium">Filteri {hasActiveFilters && `(${activeFiltersCount} aktivni)`}</Text>
      </FlexLayout>
      <DisplayIf condition={hasActiveFilters}>
        <TextButton
          iconLeft="IconTrash"
          text="Očisti filtere"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onClearAll();
          }}
        />
      </DisplayIf>
    </FlexLayout>
  );
};
