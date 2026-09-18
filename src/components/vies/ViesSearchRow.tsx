import { CountryFlag } from '@/components/countries';
import { getCountryName } from '@/lib/utils/countries';
import { Box, Button, FlexLayout, Text } from '@/ui';
import { TextInputWithLabels } from '@/ui/hocs';

interface ViesSearchRowProps {
  value: string;
  detectedCountryCode: string;
  canSearch: boolean;
  isSearching: boolean;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export const ViesSearchRow: React.FC<ViesSearchRowProps> = ({
  value,
  detectedCountryCode,
  canSearch,
  isSearching,
  onChange,
  onSearch,
}) => {
  return (
    <FlexLayout className="flex-col gap-1">
      <FlexLayout className="items-end gap-2">
        <Box className="flex-1">
          <TextInputWithLabels
            autoFocus
            isDisabled={isSearching}
            placeholder="Unesi porezni broj (VAT), npr. HR01746086877"
            value={value}
            onChange={onChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canSearch) {
                event.preventDefault();
                onSearch();
              }
            }}
          />
        </Box>
        <Button
          isDisabled={!canSearch}
          isLoading={isSearching}
          size="l"
          text="Pretraži"
          type="button"
          onClick={onSearch}
        />
      </FlexLayout>
      <FlexLayout className="items-center gap-1">
        <Text color="text-color-3" variant="text-xs">
          Detektirana država:
        </Text>
        {detectedCountryCode ? (
          <>
            <CountryFlag code={detectedCountryCode} size="xs" />
            <Text color="text-color-3" variant="text-xs">
              {getCountryName(detectedCountryCode)}
            </Text>
          </>
        ) : (
          <Text color="text-color-3" variant="text-xs">
            –
          </Text>
        )}
      </FlexLayout>
    </FlexLayout>
  );
};
