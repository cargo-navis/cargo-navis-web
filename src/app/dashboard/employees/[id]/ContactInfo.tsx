'use client';

import { Box, Icon, IconType, Text } from '@/ui';
import { copyToClipboard } from '@/lib/utils/clipboard';

const contactIconMap: Record<string, IconType> = {
  email: 'EnvelopeIcon',
  phone: 'PhoneIcon',
  governmentId: 'IdentificationIcon',
};

interface ContactInfoProps {
  contact: string;
  contactType: 'email' | 'phone' | 'governmentId';
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contact, contactType }) => {
  const ContactIcon = contactIconMap[contactType];

  async function copyContact() {
    const copiedValue = await copyToClipboard(contact);
    alert(`"${copiedValue}" copied to clipboard`);
  }

  return (
    <Box className="group flex items-center gap-2 text-color-2 cursor-pointer hover:text-color-1" onClick={copyContact}>
      <Icon icon={ContactIcon} />
      <Text variant="text-s">{contact}</Text>
      <Icon icon="DocumentDuplicateIcon" className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 w-5 transition-transform ease" />
    </Box>
  )
}