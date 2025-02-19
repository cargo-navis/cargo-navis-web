import { copyToClipboard } from '@/lib/utils/clipboard';
import { FlexLayout, Icon, type IconType, Text } from '@/ui';

const contactIconMap: Record<string, IconType> = {
  email: 'EnvelopeIcon',
  phone: 'PhoneIcon',
  governmentId: 'IdentificationIcon',
  dateOfBirth: 'CakeIcon',
  residenceAddress: 'HomeIcon',
};

interface ContactInfoProps {
  contact: string;
  contactType: 'email' | 'phone' | 'governmentId' | 'dateOfBirth' | 'residenceAddress';
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contact, contactType }) => {
  const ContactIcon = contactIconMap[contactType];

  return (
    <FlexLayout
      className="group items-center gap-2 text-color-2 cursor-pointer hover:text-color-1"
      onClick={() => copyToClipboard(contact)}
    >
      <Icon icon={ContactIcon} type="solid" />
      <Text variant="text-s">{contact}</Text>
      <Icon
        className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 w-5 transition-transform ease"
        icon="DocumentDuplicateIcon"
      />
    </FlexLayout>
  );
};
