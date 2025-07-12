import React from 'react';
import {
  Stack,
  Title,
  Text,
  Group,
  Checkbox,
  Card,
  SimpleGrid,
  Textarea,
  Alert,
  Divider,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconCalendar, IconClock, IconInfoCircle } from '@tabler/icons-react';
import type { EDPPSchedule } from '../../schemas/edpp';

interface EDPPScheduleFormProps {
  form: UseFormReturnType<EDPPSchedule>;
  title?: string;
  description?: string;
}

export const EDPPScheduleForm: React.FC<EDPPScheduleFormProps> = ({
  form,
  title = "Emploi du temps",
  description = "Indiquez vos préférences d'horaires et de périodes"
}) => {
  const getSelectedDaysCount = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
    return days.filter(day => form.values[day]).length;
  };

  const getSelectedPeriodsCount = () => {
    const periods = ['autumnHolidays', 'winterHolidays', 'springHolidays', 'summerHolidays'] as const;
    return periods.filter(period => form.values[period]).length;
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={3} mb="xs">
          <Group gap="sm">
            <IconCalendar size={24} />
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
        icon={<IconInfoCircle size={16} />}
        title="Information"
        color="blue"
        variant="light"
      >
        <Text size="sm">
          Sélectionnez les jours et créneaux horaires qui conviennent le mieux à votre famille. 
          Plus vous donnez d'options, plus nous pouvons vous proposer d'activités adaptées.
        </Text>
      </Alert>

      {/* Days of the Week */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Jours de la semaine</Title>
          <Text size="sm" c="dimmed">
            {getSelectedDaysCount()} jour{getSelectedDaysCount() > 1 ? 's' : ''} sélectionné{getSelectedDaysCount() > 1 ? 's' : ''}
          </Text>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }}>
          <Checkbox
            label="Lundi"
            {...form.getInputProps('monday', { type: 'checkbox' })}
          />
          <Checkbox
            label="Mardi"
            {...form.getInputProps('tuesday', { type: 'checkbox' })}
          />
          <Checkbox
            label="Mercredi"
            {...form.getInputProps('wednesday', { type: 'checkbox' })}
          />
          <Checkbox
            label="Jeudi"
            {...form.getInputProps('thursday', { type: 'checkbox' })}
          />
          <Checkbox
            label="Vendredi"
            {...form.getInputProps('friday', { type: 'checkbox' })}
          />
        </SimpleGrid>
      </Card>

      {/* Time Slots */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Créneaux horaires</Title>
          <IconClock size={20} />
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Matin</Text>
                <Text size="xs" c="dimmed">8h00 - 12h00</Text>
              </div>
            }
            {...form.getInputProps('morning', { type: 'checkbox' })}
          />
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Pause déjeuner</Text>
                <Text size="xs" c="dimmed">12h00 - 14h00</Text>
              </div>
            }
            {...form.getInputProps('lunchTime', { type: 'checkbox' })}
          />
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Après-midi</Text>
                <Text size="xs" c="dimmed">14h00 - 18h00</Text>
              </div>
            }
            {...form.getInputProps('afternoon', { type: 'checkbox' })}
          />
        </SimpleGrid>
      </Card>

      <Divider />

      {/* Holiday Periods */}
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Périodes de vacances</Title>
          <Text size="sm" c="dimmed">
            {getSelectedPeriodsCount()} période{getSelectedPeriodsCount() > 1 ? 's' : ''} sélectionnée{getSelectedPeriodsCount() > 1 ? 's' : ''}
          </Text>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Vacances d'automne</Text>
                <Text size="xs" c="dimmed">Octobre - Novembre</Text>
              </div>
            }
            {...form.getInputProps('autumnHolidays', { type: 'checkbox' })}
          />
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Vacances d'hiver</Text>
                <Text size="xs" c="dimmed">Décembre - Janvier</Text>
              </div>
            }
            {...form.getInputProps('winterHolidays', { type: 'checkbox' })}
          />
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Vacances de printemps</Text>
                <Text size="xs" c="dimmed">Avril - Mai</Text>
              </div>
            }
            {...form.getInputProps('springHolidays', { type: 'checkbox' })}
          />
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Vacances d'été</Text>
                <Text size="xs" c="dimmed">Juillet - Août</Text>
              </div>
            }
            {...form.getInputProps('summerHolidays', { type: 'checkbox' })}
          />
        </SimpleGrid>
      </Card>

      {/* Special Days */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Jours spéciaux</Title>
        
        <Checkbox
          label={
            <div>
              <Text size="sm" fw={500}>Journées pédagogiques</Text>
              <Text size="xs" c="dimmed">Accueil pendant les journées pédagogiques de l'école</Text>
            </div>
          }
          {...form.getInputProps('pedagogicalDays', { type: 'checkbox' })}
        />
      </Card>

      {/* Additional Notes */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Remarques sur l'emploi du temps</Title>
        <Textarea
          placeholder="Indiquez ici toute contrainte particulière, préférence horaire, ou information utile concernant l'emploi du temps de votre enfant..."
          rows={4}
          {...form.getInputProps('notes')}
        />
        <Text size="xs" c="dimmed" mt="sm">
          Exemple : "Préférence pour les activités en fin d'après-midi", 
          "Disponible uniquement le mercredi matin", etc.
        </Text>
      </Card>

      {/* Schedule Summary */}
      {(getSelectedDaysCount() > 0 || getSelectedPeriodsCount() > 0) && (
        <Card withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
          <Title order={4} mb="md">Résumé de vos préférences</Title>
          
          {getSelectedDaysCount() > 0 && (
            <Group mb="sm">
              <Text size="sm" fw={500}>Jours sélectionnés:</Text>
              <Group gap="xs">
                {form.values.monday && <Text size="sm" c="blue">Lundi</Text>}
                {form.values.tuesday && <Text size="sm" c="blue">Mardi</Text>}
                {form.values.wednesday && <Text size="sm" c="blue">Mercredi</Text>}
                {form.values.thursday && <Text size="sm" c="blue">Jeudi</Text>}
                {form.values.friday && <Text size="sm" c="blue">Vendredi</Text>}
              </Group>
            </Group>
          )}

          {(form.values.morning || form.values.lunchTime || form.values.afternoon) && (
            <Group mb="sm">
              <Text size="sm" fw={500}>Créneaux:</Text>
              <Group gap="xs">
                {form.values.morning && <Text size="sm" c="green">Matin</Text>}
                {form.values.lunchTime && <Text size="sm" c="green">Déjeuner</Text>}
                {form.values.afternoon && <Text size="sm" c="green">Après-midi</Text>}
              </Group>
            </Group>
          )}

          {getSelectedPeriodsCount() > 0 && (
            <Group>
              <Text size="sm" fw={500}>Vacances:</Text>
              <Group gap="xs">
                {form.values.autumnHolidays && <Text size="sm" c="orange">Automne</Text>}
                {form.values.winterHolidays && <Text size="sm" c="orange">Hiver</Text>}
                {form.values.springHolidays && <Text size="sm" c="orange">Printemps</Text>}
                {form.values.summerHolidays && <Text size="sm" c="orange">Été</Text>}
              </Group>
            </Group>
          )}
        </Card>
      )}
    </Stack>
  );
};
