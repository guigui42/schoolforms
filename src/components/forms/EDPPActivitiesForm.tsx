import React from 'react';
import {
  Stack,
  Title,
  Text,
  Group,
  Checkbox,
  Card,
  SimpleGrid,
  Badge,
  NumberInput,
  Textarea,
  Alert,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconActivity, IconClock, IconStar } from '@tabler/icons-react';
import type { EDPPActivity } from '../../schemas/edpp';

interface EDPPActivitiesFormProps {
  form: UseFormReturnType<{ activities: EDPPActivity[] }>;
  title?: string;
  description?: string;
}

// Predefined activities for EDPP
const PREDEFINED_ACTIVITIES: Omit<EDPPActivity, 'id' | 'selected' | 'priority'>[] = [
  {
    name: 'Football',
    category: 'sport',
    description: 'Initiation et perfectionnement au football',
    ageGroup: '6-12 ans',
    schedule: 'Mercredi 14h-16h',
    location: 'Terrain municipal',
  },
  {
    name: 'Basket-ball',
    category: 'sport',
    description: 'Apprentissage des techniques de base du basket',
    ageGroup: '8-14 ans',
    schedule: 'Mercredi 15h-17h',
    location: 'Gymnase',
  },
  {
    name: 'Arts plastiques',
    category: 'art',
    description: 'Peinture, dessin, sculpture et arts créatifs',
    ageGroup: '5-12 ans',
    schedule: 'Mercredi 9h-11h',
    location: 'Salle d\'arts',
  },
  {
    name: 'Théâtre',
    category: 'art',
    description: 'Expression corporelle et jeu théâtral',
    ageGroup: '7-14 ans',
    schedule: 'Mercredi 14h-16h',
    location: 'Salle polyvalente',
  },
  {
    name: 'Musique',
    category: 'art',
    description: 'Chant et découverte d\'instruments',
    ageGroup: '6-12 ans',
    schedule: 'Mercredi 10h-12h',
    location: 'Salle de musique',
  },
  {
    name: 'Informatique',
    category: 'science',
    description: 'Initiation à l\'informatique et programmation',
    ageGroup: '8-14 ans',
    schedule: 'Mercredi 13h30-15h30',
    location: 'Salle informatique',
  },
  {
    name: 'Sciences et nature',
    category: 'science',
    description: 'Expériences scientifiques et découverte de la nature',
    ageGroup: '6-12 ans',
    schedule: 'Mercredi 9h30-11h30',
    location: 'Laboratoire/Extérieur',
  },
  {
    name: 'Jardinage',
    category: 'nature',
    description: 'Apprentissage du jardinage et de l\'écologie',
    ageGroup: '5-12 ans',
    schedule: 'Mercredi 10h-12h',
    location: 'Jardin pédagogique',
  },
  {
    name: 'Jeux de société',
    category: 'jeux',
    description: 'Jeux éducatifs et de stratégie',
    ageGroup: '6-14 ans',
    schedule: 'Mercredi 13h-15h',
    location: 'Salle de jeux',
  },
  {
    name: 'Lecture et écriture',
    category: 'culture',
    description: 'Atelier de lecture et d\'écriture créative',
    ageGroup: '7-12 ans',
    schedule: 'Mercredi 14h-16h',
    location: 'Bibliothèque',
  },
];

export const EDPPActivitiesForm: React.FC<EDPPActivitiesFormProps> = ({
  form,
  title = "Choix des activités",
  description = "Sélectionnez les activités qui intéressent votre enfant"
}) => {
  // Initialize activities if empty
  React.useEffect(() => {
    if (!form.values.activities || form.values.activities.length === 0) {
      const initialActivities = PREDEFINED_ACTIVITIES.map((activity, index) => ({
        ...activity,
        id: `activity-${index}`,
        selected: false,
        priority: undefined,
      }));
      form.setFieldValue('activities', initialActivities);
    }
  }, [form]);

  const toggleActivity = (activityId: string) => {
    const currentActivities = form.values.activities || [];
    const updatedActivities = currentActivities.map(activity => 
      activity.id === activityId 
        ? { ...activity, selected: !activity.selected }
        : activity
    );
    form.setFieldValue('activities', updatedActivities);
  };

  const updateActivityPriority = (activityId: string, priority: number | undefined) => {
    const currentActivities = form.values.activities || [];
    const updatedActivities = currentActivities.map(activity => 
      activity.id === activityId 
        ? { ...activity, priority }
        : activity
    );
    form.setFieldValue('activities', updatedActivities);
  };

  const getSelectedActivities = () => {
    return form.values.activities?.filter(activity => activity.selected) || [];
  };

  const getCategoryColor = (category: EDPPActivity['category']) => {
    const colors = {
      sport: 'blue',
      art: 'violet',
      culture: 'green',
      science: 'orange',
      nature: 'teal',
      jeux: 'red',
      autre: 'gray',
    };
    return colors[category];
  };

  const getCategoryLabel = (category: EDPPActivity['category']) => {
    const labels = {
      sport: 'Sport',
      art: 'Art',
      culture: 'Culture',
      science: 'Science',
      nature: 'Nature',
      jeux: 'Jeux',
      autre: 'Autre',
    };
    return labels[category];
  };

  const groupedActivities = React.useMemo(() => {
    const activities = form.values.activities || [];
    return activities.reduce((groups, activity) => {
      const category = activity.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(activity);
      return groups;
    }, {} as Record<string, EDPPActivity[]>);
  }, [form.values.activities]);

  return (
    <Stack gap="md">
      <div>
        <Title order={3} mb="xs">
          <Group gap="sm">
            <IconActivity size={24} />
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
        icon={<IconStar size={16} />}
        title="Comment ça marche ?"
        color="blue"
        variant="light"
      >
        <Text size="sm">
          Sélectionnez les activités qui intéressent votre enfant. Vous pouvez définir des priorités 
          (1 = priorité maximale) pour nous aider à organiser les groupes en cas de forte demande.
        </Text>
      </Alert>

      {/* Selected Activities Summary */}
      {getSelectedActivities().length > 0 && (
        <Card withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
          <Title order={4} mb="md">
            Activités sélectionnées ({getSelectedActivities().length})
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {getSelectedActivities().map(activity => (
              <Group key={activity.id} justify="space-between">
                <div>
                  <Text size="sm" fw={500}>{activity.name}</Text>
                  <Text size="xs" c="dimmed">{activity.schedule}</Text>
                </div>
                {activity.priority && (
                  <Badge color="yellow" size="sm">
                    Priorité {activity.priority}
                  </Badge>
                )}
              </Group>
            ))}
          </SimpleGrid>
        </Card>
      )}

      {/* Activities by Category */}
      {Object.entries(groupedActivities).map(([category, activities]) => (
        <Card key={category} withBorder p="md">
          <Group mb="md">
            <Badge 
              color={getCategoryColor(category as EDPPActivity['category'])} 
              size="lg"
            >
              {getCategoryLabel(category as EDPPActivity['category'])}
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {activities.map(activity => (
              <Card 
                key={activity.id} 
                withBorder 
                p="sm" 
                style={{ 
                  backgroundColor: activity.selected 
                    ? 'var(--mantine-color-blue-0)' 
                    : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => toggleActivity(activity.id)}
              >
                <Group justify="space-between" mb="xs">
                  <Checkbox
                    checked={activity.selected}
                    onChange={() => toggleActivity(activity.id)}
                    label={activity.name}
                    style={{ pointerEvents: 'none' }}
                  />
                  {activity.price && (
                    <Badge color="gray" size="sm">
                      {activity.price}€
                    </Badge>
                  )}
                </Group>

                <Text size="sm" c="dimmed" mb="xs">
                  {activity.description}
                </Text>

                <Group gap="xs" mb="xs">
                  <Group gap={4}>
                    <IconClock size={14} />
                    <Text size="xs" c="dimmed">{activity.schedule}</Text>
                  </Group>
                </Group>

                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    <strong>Âge:</strong> {activity.ageGroup}
                  </Text>
                  <Text size="xs" c="dimmed">
                    <strong>Lieu:</strong> {activity.location}
                  </Text>
                </Group>

                {activity.selected && (
                  <Group mt="sm" gap="xs">
                    <Text size="xs">Priorité:</Text>
                    <NumberInput
                      size="xs"
                      w={80}
                      min={1}
                      max={10}
                      value={activity.priority}
                      onChange={(value) => updateActivityPriority(activity.id, value as number)}
                      placeholder="1-10"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Group>
                )}
              </Card>
            ))}
          </SimpleGrid>
        </Card>
      ))}

      {/* Add Custom Activity */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Activité personnalisée</Title>
        <Text size="sm" c="dimmed" mb="md">
          Si vous souhaitez proposer une activité qui n'est pas dans la liste, 
          décrivez-la ci-dessous :
        </Text>
        <Textarea
          placeholder="Décrivez l'activité souhaitée, l'âge approprié, et vos attentes..."
          rows={3}
          // You can add a custom field to the form for this
        />
      </Card>
    </Stack>
  );
};
