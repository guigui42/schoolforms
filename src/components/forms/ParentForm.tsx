import React from 'react';
import { 
  TextInput, 
  Select, 
  Card, 
  Title, 
  Stack, 
  Group, 
  Button, 
  Switch,
  ActionIcon,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import type { ParentFormData } from '../../schemas/parent';

interface ParentFormProps {
  form: ReturnType<typeof useForm<ParentFormData>>;
  onRemove?: () => void;
  canRemove?: boolean;
}

export const ParentForm: React.FC<ParentFormProps> = ({ 
  form, 
  onRemove, 
  canRemove = false 
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={4}>Informations du parent/tuteur</Title>
          {canRemove && (
            <ActionIcon 
              color="red" 
              variant="light" 
              onClick={onRemove}
              aria-label="Supprimer ce parent"
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Card.Section>

      <Stack gap="md" mt="md">
        <Select
          label="Type de parent"
          placeholder="Sélectionnez le type"
          required
          data={[
            { value: 'mother', label: 'Mère' },
            { value: 'father', label: 'Père' },
            { value: 'guardian', label: 'Tuteur/Tutrice' },
          ]}
          {...form.getInputProps('type')}
        />

        <Group grow>
          <TextInput
            label="Prénom"
            placeholder="Prénom du parent"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Nom"
            placeholder="Nom du parent"
            required
            {...form.getInputProps('lastName')}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Email"
            placeholder="email@example.com"
            required
            type="email"
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Téléphone"
            placeholder="06 12 34 56 78"
            required
            {...form.getInputProps('phone')}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Profession"
            placeholder="Profession (optionnel)"
            {...form.getInputProps('profession')}
          />
          <TextInput
            label="Téléphone professionnel"
            placeholder="01 23 45 67 89 (optionnel)"
            {...form.getInputProps('workPhone')}
          />
        </Group>

        <Switch
          label="Contact d'urgence"
          description="Cette personne peut être contactée en cas d'urgence"
          {...form.getInputProps('emergencyContact', { type: 'checkbox' })}
        />

        <Title order={5} mt="md">Adresse professionnelle (optionnel)</Title>
        <Group grow>
          <TextInput
            label="Adresse"
            placeholder="123 rue de la Paix"
            {...form.getInputProps('workAddress.street')}
          />
        </Group>
        <Group grow>
          <TextInput
            label="Ville"
            placeholder="Paris"
            {...form.getInputProps('workAddress.city')}
          />
          <TextInput
            label="Code postal"
            placeholder="75001"
            {...form.getInputProps('workAddress.postalCode')}
          />
        </Group>
      </Stack>
    </Card>
  );
};

interface ParentListFormProps {
  parents: ParentFormData[];
  onAddParent: () => void;
  onRemoveParent: (index: number) => void;
  getParentForm: (index: number) => ReturnType<typeof useForm<ParentFormData>>;
}

export const ParentListForm: React.FC<ParentListFormProps> = ({
  parents,
  onAddParent,
  onRemoveParent,
  getParentForm,
}) => {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Parents/Tuteurs</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={onAddParent}
          variant="light"
        >
          Ajouter un parent
        </Button>
      </Group>

      {parents.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Aucun parent ajouté. Cliquez sur "Ajouter un parent" pour commencer.
        </Text>
      )}

      {parents.map((_, index) => (
        <ParentForm
          key={index}
          form={getParentForm(index)}
          onRemove={() => onRemoveParent(index)}
          canRemove={parents.length > 1}
        />
      ))}
    </Stack>
  );
};
