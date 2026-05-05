import { copyToClipboard } from '@/lib/utils/clipboard';
import { FlexLayout, Icon2, Icon2Type, Text } from '@/ui';

const contactIconMap: Record<string, Icon2Type> = {
  email: 'IconMail',
  phone: 'IconPhone',
  governmentId: 'IconId',
  dateOfBirth: 'IconBalloon',
  residenceAddress: 'IconHome',
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
      <Icon2 icon={ContactIcon} type="solid" />
      <Text variant="text-s">{contact}</Text>
      <Icon2
        className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 w-5 transition-transform ease"
        icon="IconCopy"
      />
    </FlexLayout>
  );
};
