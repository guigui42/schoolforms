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
  Textarea,
  ActionIcon,
  Text
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { GRADES } from '../../utils/constants';
import type { StudentFormData } from '../../schemas/student';

interface StudentFormProps {
  form: ReturnType<typeof useForm<StudentFormData>>;
  onRemove?: () => void;
  canRemove?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({ 
  form, 
  onRemove, 
  canRemove = false 
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={4}>Informations de l'enfant</Title>
          {canRemove && (
            <ActionIcon 
              color="red" 
              variant="light" 
              onClick={onRemove}
              aria-label="Supprimer cet enfant"
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
            placeholder="Prénom de l'enfant"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Nom"
            placeholder="Nom de l'enfant"
            required
            {...form.getInputProps('lastName')}
          />
        </Group>

        <Group grow>
          <DateInput
            label="Date de naissance"
            placeholder="Sélectionnez une date"
            required
            locale="fr"
            {...form.getInputProps('birthDate')}
          />
          <Select
            label="Classe"
            placeholder="Sélectionnez une classe"
            required
            data={GRADES.map(grade => ({ value: grade, label: grade }))}
            {...form.getInputProps('grade')}
          />
        </Group>

        <TextInput
          label="École"
          placeholder="Nom de l'école"
          required
          {...form.getInputProps('school')}
        />

        <Group grow>
          <Switch
            label="Autorisation de photographier"
            description="J'autorise l'utilisation de photos de mon enfant"
            {...form.getInputProps('photoAuthorization', { type: 'checkbox' })}
          />
          <Switch
            label="Autorisation de transport"
            description="J'autorise le transport de mon enfant"
            {...form.getInputProps('transportAuthorization', { type: 'checkbox' })}
          />
        </Group>

        <Textarea
          label="Besoins particuliers"
          description="Informations médicales, allergies, ou autres besoins spéciaux"
          placeholder="Décrivez les besoins particuliers de votre enfant..."
          minRows={3}
          {...form.getInputProps('specialNeeds')}
        />
      </Stack>
    </Card>
  );
};

interface StudentListFormProps {
  students: StudentFormData[];
  onAddStudent: () => void;
  onRemoveStudent: (index: number) => void;
  getStudentForm: (index: number) => ReturnType<typeof useForm<StudentFormData>>;
}

export const StudentListForm: React.FC<StudentListFormProps> = ({
  students,
  onAddStudent,
  onRemoveStudent,
  getStudentForm,
}) => {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Enfants</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={onAddStudent}
          variant="light"
        >
          Ajouter un enfant
        </Button>
      </Group>

      {students.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Aucun enfant ajouté. Cliquez sur "Ajouter un enfant" pour commencer.
        </Text>
      )}

      {students.map((_, index) => (
        <StudentForm
          key={index}
          form={getStudentForm(index)}
          onRemove={() => onRemoveStudent(index)}
          canRemove={students.length > 1}
        />
      ))}
    </Stack>
  );
};
