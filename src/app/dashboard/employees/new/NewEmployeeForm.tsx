'use client';

import 'dayjs/locale/hr';
import { useState } from 'react';
import '@mantine/dates/styles.css';

import { Box, Datepicker } from '@/ui';
import { CheckboxGroupWithLabels, DatepickerWithLabels, RadioGroupWithLabels, TextInputWithLabels } from '@/ui/hocs';

const positionOptions = [
  { label: 'Manager', value: 'manager' },
  { label: 'Disponent', value: 'disponent' },
  { label: 'Driver', value: 'driver' },
];

const adrOptions = [
  { label: 'True', value: 'adr_true' },
  { label: 'False', value: 'adr_false' },
];

const categoryOptions = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'B2', value: 'b2' },
  { label: 'C', value: 'c' },
  { label: 'C2', value: 'c2' },
];

export const NewEmployeeForm = () => {
  const [name, setName] = useState('');
  const [lName, setLname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [govId, setGovId] = useState('');

  const [position, setPosition] = useState('');
  const [adr, setAdr] = useState(adrOptions[0].value);
  const [categories, setCategories] = useState<string[]>([]);

  const [date, setDate] = useState<string | null>(null);

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
        <Box>
          <TextInputWithLabels label="Government ID" value={govId} onChange={setGovId} />
        </Box>
        <RadioGroupWithLabels label="Position" options={positionOptions} value={position} onChange={setPosition} />
        {position === 'driver' && (
          <Box className="flex flex-col gap-4">
            <Box className="flex gap-3">
              <Box className="flex-1">
                <CheckboxGroupWithLabels label="Categories" options={categoryOptions} values={categories} onChange={setCategories} />
              </Box>
              <Box className="flex-1">
                <RadioGroupWithLabels label="ADR" options={adrOptions} value={adr} onChange={setAdr} />
              </Box>
            </Box>
            <DatepickerWithLabels label="Date of Expiry" value={date} onChange={setDate} />
          </Box>
        )}
      </Box>
      <Box as="pre" className="absolute right-[1000px]">
        <Box>Name: {name}</Box>
        <Box>Last Name: {lName}</Box>
        <Box>Phone: {phone}</Box>
        <Box>Email: {email}</Box>
        <Box>Position: {position}</Box>
        <Box>Categories: {categories.map(c => `${c} `)}</Box>
        <Box>ADR: {adr}</Box>
        <Box>Date of expiration: {date}</Box>
      </Box>
    </Box>
  );
}