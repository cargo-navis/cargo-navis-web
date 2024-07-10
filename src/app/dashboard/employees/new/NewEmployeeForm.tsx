'use client';

import { Box } from '@/ui';
import { useState } from 'react';
import { TextInputWithLabels } from '@/ui/hocs';

export const NewEmployeeForm = () => {
  const [name, setName] = useState('');
  const [lName, setLname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Box className="flex flex-col gap-10">
      <Box className="flex flex-col gap-4 w-[500px]">
        <Box className="flex gap-4">
          <Box className="flex-grow">
            <TextInputWithLabels label="First Name" value={name} onChange={setName} />
          </Box>
          <Box className="flex-grow">
            <TextInputWithLabels label="Last Name" value={lName} onChange={setLname} />
          </Box>
        </Box>
        <Box>
          <TextInputWithLabels label="Phone number" type="tel" value={phone} onChange={setPhone} />
        </Box>
        <Box>
          <TextInputWithLabels label="Email" type="email" value={email} onChange={setEmail} />
        </Box>
      </Box>
    </Box>
  );
}