import { type CompanyFormInitialValues, ViesLookupFlow } from '@/components/vies';
import type { Client } from '@/lib/api';
import { NewClientForm } from '@/pages-components/Dashboard/ClientsPage/NewClientPage/NewClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon, Text } from '@/ui';

interface NewClientModalProps {
  isOpen: boolean;
  /**
   * Skips the VIES search and opens the form on these values, e.g. the client
   * the AI extraction suggested. Without it the user searches VIES first.
   */
  initialValues?: CompanyFormInitialValues;
  onClose(): void;
  onCreated(client: Client): void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, initialValues, onClose, onCreated }) => {
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
        {isOpen &&
          (initialValues ? (
            <FlexLayout className="flex-col gap-4">
              {!!initialValues.taxId && (
                <Text color="text-color-3" variant="text-xs">
                  Podaci dohvaćeni iz VIES-a za {initialValues.taxId}
                </Text>
              )}
              <NewClientForm initialValues={initialValues} onCreated={onCreated} />
            </FlexLayout>
          ) : (
            <ViesLookupFlow
              isFormOpenInitially
              renderForm={(viesValues) => <NewClientForm initialValues={viesValues} onCreated={onCreated} />}
              searchTitle="Pretraži klijenta u VIES tražilici"
            />
          ))}
      </DialogContent>
    </Dialog>
  );
};
