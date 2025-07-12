import React from 'react';
import {
  Stack,
  Title,
  Text,
  Group,
  Checkbox,
  Card,
  SimpleGrid,
  TextInput,
  Alert,
  Divider,
  Badge,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconShield, IconCamera, IconSwimming, IconWalk, IconAlertTriangle } from '@tabler/icons-react';
import type { EDPPAuthorizations } from '../../schemas/edpp';

interface EDPPAuthorizationsFormProps {
  form: UseFormReturnType<EDPPAuthorizations>;
  title?: string;
  description?: string;
}

export const EDPPAuthorizationsForm: React.FC<EDPPAuthorizationsFormProps> = ({
  form,
  title = "Autorisations",
  description = "Définissez les autorisations pour votre enfant"
}) => {
  const addAuthorizedPerson = () => {
    const currentPersons = form.values.authorizedPickupPersons || [];
    form.setFieldValue('authorizedPickupPersons', [
      ...currentPersons,
      { name: '', relationship: '', phone: '' }
    ]);
  };

  const removeAuthorizedPerson = (index: number) => {
    const currentPersons = form.values.authorizedPickupPersons || [];
    form.setFieldValue('authorizedPickupPersons', currentPersons.filter((_, i) => i !== index));
  };

  const updateAuthorizedPerson = (index: number, field: 'name' | 'relationship' | 'phone', value: string) => {
    const currentPersons = form.values.authorizedPickupPersons || [];
    const updatedPersons = [...currentPersons];
    updatedPersons[index] = { ...updatedPersons[index], [field]: value };
    form.setFieldValue('authorizedPickupPersons', updatedPersons);
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={3} mb="xs">
          <Group gap="sm">
            <IconShield size={24} />
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
        icon={<IconAlertTriangle size={16} />}
        title="Important"
        color="yellow"
        variant="light"
      >
        <Text size="sm">
          Ces autorisations sont obligatoires pour assurer la sécurité de votre enfant. 
          Veuillez lire attentivement chaque autorisation avant de cocher.
        </Text>
      </Alert>

      {/* Photo and Media Authorizations */}
      <Card withBorder p="md">
        <Group mb="md">
          <IconCamera size={20} />
          <Title order={4}>Autorisations photo et vidéo</Title>
        </Group>

        <Stack gap="sm">
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Autorisation de prise de photos</Text>
                <Text size="xs" c="dimmed">J'autorise la prise de photos de mon enfant lors des activités</Text>
              </div>
            }
            {...form.getInputProps('photoAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Autorisation de prise de vidéos</Text>
                <Text size="xs" c="dimmed">J'autorise la prise de vidéos de mon enfant lors des activités</Text>
              </div>
            }
            {...form.getInputProps('videoAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Autorisation de diffusion sur les réseaux sociaux</Text>
                <Text size="xs" c="dimmed">J'autorise la diffusion des photos/vidéos sur les réseaux sociaux de l'EDPP</Text>
              </div>
            }
            {...form.getInputProps('socialMediaAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Autorisation de diffusion presse</Text>
                <Text size="xs" c="dimmed">J'autorise la diffusion des photos dans la presse locale</Text>
              </div>
            }
            {...form.getInputProps('pressAuthorization', { type: 'checkbox' })}
          />
        </Stack>
      </Card>

      {/* Activity Authorizations */}
      <Card withBorder p="md">
        <Group mb="md">
          <IconSwimming size={20} />
          <Title order={4}>Autorisations d'activités</Title>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Activités aquatiques</Text>
                <Text size="xs" c="dimmed">Piscine, baignade surveillée</Text>
              </div>
            }
            {...form.getInputProps('swimmingAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Activités de plein air</Text>
                <Text size="xs" c="dimmed">Sports extérieurs, jeux dans la nature</Text>
              </div>
            }
            {...form.getInputProps('outdoorActivitiesAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Transport en bus</Text>
                <Text size="xs" c="dimmed">Déplacements en transport collectif</Text>
              </div>
            }
            {...form.getInputProps('transportAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Sorties pédestres</Text>
                <Text size="xs" c="dimmed">Promenades et excursions à pied</Text>
              </div>
            }
            {...form.getInputProps('walkingExcursionAuthorization', { type: 'checkbox' })}
          />
        </SimpleGrid>
      </Card>

      {/* Medical Authorizations */}
      <Card withBorder p="md">
        <Title order={4} mb="md">Autorisations médicales</Title>

        <Stack gap="sm">
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Administration de médicaments</Text>
                <Text size="xs" c="dimmed">Autorisation de donner les médicaments selon la prescription médicale</Text>
              </div>
            }
            {...form.getInputProps('medicationAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Soins médicaux d'urgence</Text>
                <Text size="xs" c="dimmed">Autorisation de prodiguer des soins d'urgence en cas de besoin</Text>
              </div>
            }
            {...form.getInputProps('emergencyMedicalAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Premiers secours</Text>
                <Text size="xs" c="dimmed">Autorisation d'administrer les premiers secours en cas de blessure légère</Text>
              </div>
            }
            {...form.getInputProps('firstAidAuthorization', { type: 'checkbox' })}
          />
        </Stack>
      </Card>

      <Divider />

      {/* Special Authorizations */}
      <Card withBorder p="md">
        <Group mb="md">
          <IconWalk size={20} />
          <Title order={4}>Autorisations spéciales</Title>
        </Group>

        <Stack gap="md">
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Sortie autonome</Text>
                <Text size="xs" c="dimmed">J'autorise mon enfant à partir seul(e) à la fin des activités</Text>
              </div>
            }
            {...form.getInputProps('leaveAloneAuthorization', { type: 'checkbox' })}
          />
          
          <Checkbox
            label={
              <div>
                <Text size="sm" fw={500}>Récupération par des tiers</Text>
                <Text size="xs" c="dimmed">J'autorise d'autres personnes à récupérer mon enfant (liste ci-dessous)</Text>
              </div>
            }
            {...form.getInputProps('pickupByOthersAuthorization', { type: 'checkbox' })}
          />
        </Stack>

        {/* Authorized Pickup Persons */}
        {form.values.pickupByOthersAuthorization && (
          <Card withBorder p="sm" mt="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Group justify="space-between" mb="md">
              <Title order={5}>Personnes autorisées à récupérer l'enfant</Title>
              <Text
                component="button"
                type="button"
                c="blue"
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={addAuthorizedPerson}
              >
                + Ajouter une personne
              </Text>
            </Group>

            {form.values.authorizedPickupPersons?.map((person, index) => (
              <Card key={index} withBorder p="sm" mb="sm">
                <Group justify="space-between" mb="sm">
                  <Badge color="blue" size="sm">Personne {index + 1}</Badge>
                  <Text
                    component="button"
                    type="button"
                    c="red"
                    size="sm"
                    style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                    onClick={() => removeAuthorizedPerson(index)}
                  >
                    Supprimer
                  </Text>
                </Group>
                
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <TextInput
                    label="Nom complet"
                    placeholder="Jean Dupont"
                    value={person.name}
                    onChange={(event) => updateAuthorizedPerson(index, 'name', event.currentTarget.value)}
                  />
                  <TextInput
                    label="Lien de parenté"
                    placeholder="Grand-père, voisin, ami..."
                    value={person.relationship}
                    onChange={(event) => updateAuthorizedPerson(index, 'relationship', event.currentTarget.value)}
                  />
                  <TextInput
                    label="Téléphone"
                    placeholder="06 12 34 56 78"
                    value={person.phone}
                    onChange={(event) => updateAuthorizedPerson(index, 'phone', event.currentTarget.value)}
                  />
                </SimpleGrid>
              </Card>
            ))}

            {(!form.values.authorizedPickupPersons || form.values.authorizedPickupPersons.length === 0) && (
              <Text c="dimmed" size="sm">
                Aucune personne autorisée. Cliquez sur "Ajouter une personne" pour en ajouter une.
              </Text>
            )}
          </Card>
        )}
      </Card>

      {/* Summary */}
      <Card withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Title order={4} mb="md">Récapitulatif des autorisations</Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <div>
            <Text size="sm" fw={500} mb="xs">Photos et médias:</Text>
            <Stack gap={2}>
              {form.values.photoAuthorization && <Text size="xs" c="green">✓ Photos autorisées</Text>}
              {form.values.videoAuthorization && <Text size="xs" c="green">✓ Vidéos autorisées</Text>}
              {form.values.socialMediaAuthorization && <Text size="xs" c="green">✓ Réseaux sociaux autorisés</Text>}
              {form.values.pressAuthorization && <Text size="xs" c="green">✓ Presse autorisée</Text>}
            </Stack>
          </div>
          
          <div>
            <Text size="sm" fw={500} mb="xs">Activités:</Text>
            <Stack gap={2}>
              {form.values.swimmingAuthorization && <Text size="xs" c="green">✓ Activités aquatiques</Text>}
              {form.values.outdoorActivitiesAuthorization && <Text size="xs" c="green">✓ Activités de plein air</Text>}
              {form.values.transportAuthorization && <Text size="xs" c="green">✓ Transport en bus</Text>}
              {form.values.walkingExcursionAuthorization && <Text size="xs" c="green">✓ Sorties pédestres</Text>}
            </Stack>
          </div>
        </SimpleGrid>
      </Card>
    </Stack>
  );
};
