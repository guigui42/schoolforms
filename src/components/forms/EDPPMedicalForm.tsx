import React from 'react';
import {
  Stack,
  Title,
  Text,
  Group,
  Checkbox,
  TextInput,
  Textarea,
  Card,
  SimpleGrid,
  Alert,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconMedicalCross, IconAlertCircle } from '@tabler/icons-react';
import type { EDPPMedicalInfo } from '../../schemas/edpp';

interface EDPPMedicalFormProps {
  form: UseFormReturnType<EDPPMedicalInfo>;
  title?: string;
  description?: string;
}

export const EDPPMedicalForm: React.FC<EDPPMedicalFormProps> = ({
  form,
  title = "Informations médicales",
  description = "Renseignements médicaux pour l'inscription EDPP"
}) => {
  const addMedication = () => {
    const currentMeds = form.values.medications || [];
    form.setFieldValue('medications', [
      ...currentMeds,
      {
        name: '',
        dosage: '',
        frequency: '',
        instructions: ''
      }
    ]);
  };

  const removeMedication = (index: number) => {
    const currentMeds = form.values.medications || [];
    form.setFieldValue('medications', currentMeds.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    const currentAllergies = form.values.allergies || [];
    form.setFieldValue('allergies', [...currentAllergies, '']);
  };

  const removeAllergy = (index: number) => {
    const currentAllergies = form.values.allergies || [];
    form.setFieldValue('allergies', currentAllergies.filter((_, i) => i !== index));
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={3} mb="xs">
          <Group gap="sm">
            <IconMedicalCross size={24} />
            {title}
          </Group>
        </Title>
        {description && (
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        )}
      </div>

      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Information importante"
        color="blue"
        variant="light"
      >
        Ces informations sont confidentielles et utilisées uniquement pour assurer la sécurité et le bien-être de votre enfant.
      </Alert>

      {/* Basic Medical Information */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Médecin traitant</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Nom du médecin"
            placeholder="Dr. Martin Dupont"
            {...form.getInputProps('doctorName')}
          />
          <TextInput
            label="Téléphone du médecin"
            placeholder="01 23 45 67 89"
            {...form.getInputProps('doctorPhone')}
          />
        </SimpleGrid>

        <TextInput
          label="Numéro de sécurité sociale"
          placeholder="1 23 45 67 890 123 45"
          mt="md"
          {...form.getInputProps('insuranceNumber')}
        />

        <Group mt="md">
          <Checkbox
            label="Vaccinations à jour"
            {...form.getInputProps('vaccinationUpToDate', { type: 'checkbox' })}
          />
        </Group>
      </Card>

      {/* Allergies */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Allergies</Title>
          <Text
            component="button"
            type="button"
            c="blue"
            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
            onClick={addAllergy}
          >
            + Ajouter une allergie
          </Text>
        </Group>

        {form.values.allergies?.map((allergy, index) => (
          <Group key={index} mb="xs">
            <TextInput
              placeholder="Type d'allergie"
              value={allergy}
              onChange={(event) => {
                const currentAllergies = form.values.allergies || [];
                const newAllergies = [...currentAllergies];
                newAllergies[index] = event.currentTarget.value;
                form.setFieldValue('allergies', newAllergies);
              }}
              style={{ flex: 1 }}
            />
            <Text
              component="button"
              type="button"
              c="red"
              style={{ cursor: 'pointer', background: 'none', border: 'none' }}
              onClick={() => removeAllergy(index)}
            >
              Supprimer
            </Text>
          </Group>
        ))}

        {(!form.values.allergies || form.values.allergies.length === 0) && (
          <Text c="dimmed" size="sm">
            Aucune allergie renseignée. Cliquez sur "Ajouter une allergie" pour en ajouter une.
          </Text>
        )}
      </Card>

      {/* Medications */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Médicaments</Title>
          <Text
            component="button"
            type="button"
            c="blue"
            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
            onClick={addMedication}
          >
            + Ajouter un médicament
          </Text>
        </Group>

        {form.values.medications?.map((medication, index) => (
          <Card key={index} withBorder p="sm" mb="md">
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>Médicament {index + 1}</Text>
              <Text
                component="button"
                type="button"
                c="red"
                size="sm"
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => removeMedication(index)}
              >
                Supprimer
              </Text>
            </Group>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="Nom du médicament"
                placeholder="Doliprane"
                value={medication.name}
                onChange={(event) => {
                  const currentMeds = form.values.medications || [];
                  const newMeds = [...currentMeds];
                  newMeds[index] = { ...newMeds[index], name: event.currentTarget.value };
                  form.setFieldValue('medications', newMeds);
                }}
              />
              <TextInput
                label="Dosage"
                placeholder="500mg"
                value={medication.dosage}
                onChange={(event) => {
                  const currentMeds = form.values.medications || [];
                  const newMeds = [...currentMeds];
                  newMeds[index] = { ...newMeds[index], dosage: event.currentTarget.value };
                  form.setFieldValue('medications', newMeds);
                }}
              />
            </SimpleGrid>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
              <TextInput
                label="Fréquence"
                placeholder="2 fois par jour"
                value={medication.frequency}
                onChange={(event) => {
                  const currentMeds = form.values.medications || [];
                  const newMeds = [...currentMeds];
                  newMeds[index] = { ...newMeds[index], frequency: event.currentTarget.value };
                  form.setFieldValue('medications', newMeds);
                }}
              />
              <TextInput
                label="Instructions"
                placeholder="À prendre avant les repas"
                value={medication.instructions}
                onChange={(event) => {
                  const currentMeds = form.values.medications || [];
                  const newMeds = [...currentMeds];
                  newMeds[index] = { ...newMeds[index], instructions: event.currentTarget.value };
                  form.setFieldValue('medications', newMeds);
                }}
              />
            </SimpleGrid>
          </Card>
        ))}

        {(!form.values.medications || form.values.medications.length === 0) && (
          <Text c="dimmed" size="sm">
            Aucun médicament renseigné. Cliquez sur "Ajouter un médicament" pour en ajouter un.
          </Text>
        )}
      </Card>

      {/* Special Diet */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Régime alimentaire</Title>
        
        <Checkbox
          label="Régime alimentaire spécial"
          {...form.getInputProps('specialDiet', { type: 'checkbox' })}
          mb="md"
        />

        {form.values.specialDiet && (
          <Textarea
            label="Détails du régime alimentaire"
            placeholder="Décrivez les spécificités du régime alimentaire..."
            rows={3}
            {...form.getInputProps('specialDietDetails')}
          />
        )}
      </Card>

      {/* PAI */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Projet d'Accueil Individualisé (PAI)</Title>
        
        <Checkbox
          label="L'enfant bénéficie d'un PAI"
          {...form.getInputProps('pai', { type: 'checkbox' })}
          mb="md"
        />

        {form.values.pai && (
          <Textarea
            label="Détails du PAI"
            placeholder="Décrivez les aménagements prévus dans le PAI..."
            rows={4}
            {...form.getInputProps('paiDetails')}
          />
        )}
      </Card>

      {/* Additional Medical Notes */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Observations médicales</Title>
        <Textarea
          label="Notes complémentaires"
          placeholder="Toute information médicale importante que nous devrions connaître..."
          rows={4}
          {...form.getInputProps('notes')}
        />
      </Card>
    </Stack>
  );
};
