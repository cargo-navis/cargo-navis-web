import { ViesLookupFlow } from '@/components/vies';
import type { Contractor } from '@/lib/api';
import { NewContractorForm } from '@/pages-components/Dashboard/ContractorsPage/NewContractorPage/NewContractorForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Icon, Text } from '@/ui';

interface NewContractorModalProps {
  isOpen: boolean;
  onClose(): void;
  onCreated(contractor: Contractor): void;
}

export const NewContractorModal: React.FC<NewContractorModalProps> = ({ isOpen, onClose, onCreated }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[720px]"
        onEscapeKeyDown={onClose}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle>
            <Text variant="text-m-medium">Novi prijevoznik</Text>
          </DialogTitle>
          <Icon className="cursor-pointer" icon="IconX" onClick={onClose} />
        </DialogHeader>
        {isOpen && (
          <ViesLookupFlow
            isFormOpenInitially
            renderForm={(initialValues) => <NewContractorForm initialValues={initialValues} onCreated={onCreated} />}
            searchTitle="Pretraži prijevoznika u VIES tražilici"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
