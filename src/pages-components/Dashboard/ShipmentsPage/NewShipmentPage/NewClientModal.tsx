import { ViesLookupFlow } from '@/components/vies';
import type { Client } from '@/lib/api';
import { NewClientForm } from '@/pages-components/Dashboard/ClientsPage/NewClientPage/NewClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Icon, Text } from '@/ui';

interface NewClientModalProps {
  isOpen: boolean;
  onClose(): void;
  onCreated(client: Client): void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onCreated }) => {
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
            <Text variant="text-m-medium">Novi klijent</Text>
          </DialogTitle>
          <Icon className="cursor-pointer" icon="IconX" onClick={onClose} />
        </DialogHeader>
        {isOpen && (
          <ViesLookupFlow
            isFormOpenInitially
            renderForm={(initialValues) => <NewClientForm initialValues={initialValues} onCreated={onCreated} />}
            searchTitle="Pretraži klijenta u VIES tražilici"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
