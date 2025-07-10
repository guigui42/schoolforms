import React from 'react';
import { 
  TextInput, 
  Card, 
  Title, 
  Stack, 
  Group, 
  Button, 
  ActionIcon,
  Text,
  Collapse
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconTrash, IconPlus, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import type { EmergencyContactFormData } from '../../schemas/parent';

interface EmergencyContactFormProps {
  form: UseFormReturnType<EmergencyContactFormData>;
  onRemove?: () => void;
  canRemove?: boolean;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({ 
  form, 
  onRemove, 
  canRemove = false 
}) => {
  const [addressOpened, { toggle }] = useDisclosure(false);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={4}>Contact d'urgence</Title>
          {canRemove && (
            <ActionIcon 
              color="red" 
              variant="light" 
              onClick={onRemove}
              aria-label="Supprimer ce contact"
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Card.Section>

      <Stack gap="md" mt="md">
        <Group grow>
          <TextInput
            label="Prénom"
            placeholder="Prénom du contact"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Nom"
            placeholder="Nom du contact"
            required
            {...form.getInputProps('lastName')}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Lien de parenté"
            placeholder="Grand-mère, oncle, ami..."
            required
            {...form.getInputProps('relationship')}
          />
          <TextInput
            label="Téléphone"
            placeholder="06 12 34 56 78"
            required
            {...form.getInputProps('phone')}
          />
        </Group>

        <TextInput
          label="Email"
          placeholder="email@example.com (optionnel)"
          type="email"
          {...form.getInputProps('email')}
        />

        <Button
          variant="light"
          leftSection={addressOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          onClick={toggle}
          fullWidth
        >
          {addressOpened ? 'Masquer l\'adresse' : 'Ajouter une adresse (optionnel)'}
        </Button>

        <Collapse in={addressOpened}>
          <Stack gap="md">
            <Title order={5}>Adresse du contact</Title>
            <TextInput
              label="Adresse"
              placeholder="123 rue de la Paix"
              {...form.getInputProps('address.street')}
            />
            <Group grow>
              <TextInput
                label="Ville"
                placeholder="Paris"
                {...form.getInputProps('address.city')}
              />
              <TextInput
                label="Code postal"
                placeholder="75001"
                {...form.getInputProps('address.postalCode')}
              />
            </Group>
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
};

interface EmergencyContactListFormProps {
  contacts: EmergencyContactFormData[];
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
  getContactForm: (index: number) => UseFormReturnType<EmergencyContactFormData>;
}

export const EmergencyContactListForm: React.FC<EmergencyContactListFormProps> = ({
  contacts,
  onAddContact,
  onRemoveContact,
  getContactForm,
}) => {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Contacts d'urgence</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={onAddContact}
          variant="light"
        >
          Ajouter un contact
        </Button>
      </Group>

      {contacts.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Aucun contact d'urgence ajouté. Cliquez sur "Ajouter un contact" pour commencer.
        </Text>
      )}

      {contacts.map((_, index) => (
        <EmergencyContactForm
          key={index}
          form={getContactForm(index)}
          onRemove={() => onRemoveContact(index)}
          canRemove={contacts.length > 1}
        />
      ))}
    </Stack>
  );
};
