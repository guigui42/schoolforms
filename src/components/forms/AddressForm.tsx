import React from 'react';
import { 
  TextInput, 
  Card, 
  Title, 
  Stack, 
  Group 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { AddressFormData } from '../../schemas/parent';

interface AddressFormProps {
  form: ReturnType<typeof useForm<AddressFormData>>;
  title?: string;
  description?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({ 
  form, 
  title = "Adresse",
  description 
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Title order={4}>{title}</Title>
        {description && (
          <p style={{ margin: 0, color: 'var(--mantine-color-dimmed)' }}>
            {description}
          </p>
        )}
      </Card.Section>

      <Stack gap="md" mt="md">
        <TextInput
          label="Adresse"
          placeholder="123 rue de la Paix"
          required
          {...form.getInputProps('street')}
        />
        
        <Group grow>
          <TextInput
            label="Ville"
            placeholder="Paris"
            required
            {...form.getInputProps('city')}
          />
          <TextInput
            label="Code postal"
            placeholder="75001"
            required
            {...form.getInputProps('postalCode')}
          />
        </Group>

        <TextInput
          label="Pays"
          placeholder="France"
          {...form.getInputProps('country')}
        />
      </Stack>
    </Card>
  );
};
