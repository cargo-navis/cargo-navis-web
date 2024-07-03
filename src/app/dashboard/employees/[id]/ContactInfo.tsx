'use client';

import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

import { Box, Text } from '@/ui';
import { copyToClipboard } from '@/lib/utils/clipboard';

const contactIconMap = {
  email: EnvelopeIcon,
  phone: PhoneIcon,
};

interface ContactInfoProps {
  contact: string;
  contactType: 'email' | 'phone';
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contact, contactType }) => {
  const ContactIcon = contactIconMap[contactType];

  async function copyContact() {
    const copiedValue = await copyToClipboard(contact);
    alert(`"${copiedValue}" copied to clipboard`);
  }

  return (
    <Box className="group flex gap-2 text-color-2 cursor-pointer" onClick={copyContact}>
      <ContactIcon className="h-[24px]" />
      <Text variant="text-s">{contact}</Text>
      <DocumentDuplicateIcon className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 w-5 transition-transform ease" />
    </Box>
  )
}