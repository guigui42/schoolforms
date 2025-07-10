import { Container, Title, Text, Grid, Card, Button, Badge } from '@mantine/core';
import { IconFileText, IconPlus, IconUser, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  return (
    <Container size="lg">
      <Title order={1} mb="xl">
        Tableau de bord - Formulaires scolaires
      </Title>
      
      <Text size="lg" mb="xl" c="dimmed">
        Bienvenue dans votre espace de gestion des formulaires scolaires. 
        Remplissez vos informations une seule fois et générez tous vos documents.
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>Formulaires disponibles</Title>
            </Card.Section>

            <Text mt="sm" c="dimmed" size="sm">
              Sélectionnez un formulaire à remplir
            </Text>

            <Button
              component={Link}
              to="/form/periscolaire"
              leftSection={<IconFileText size={16} />}
              variant="light"
              fullWidth
              mt="md"
            >
              Formulaire Périscolaire
            </Button>

            <Button
              component={Link}
              to="/form/edpp"
              leftSection={<IconFileText size={16} />}
              variant="light"
              fullWidth
              mt="sm"
            >
              Formulaire EDPP
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>Gestion familiale</Title>
            </Card.Section>

            <Text mt="sm" c="dimmed" size="sm">
              Gérez les informations de votre famille
            </Text>

            <Button
              component={Link}
              to="/family"
              leftSection={<IconUser size={16} />}
              variant="light"
              fullWidth
              mt="md"
            >
              Gérer la famille
            </Button>

            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              fullWidth
              mt="sm"
            >
              Gérer les contacts
            </Button>

            <Button
              component={Link}
              to="/settings"
              leftSection={<IconSettings size={16} />}
              variant="light"
              fullWidth
              mt="sm"
            >
              Paramètres
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Title order={3} mb="md">État des formulaires</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Text size="sm" fw={500}>Périscolaire</Text>
            <Badge color="orange" variant="light">En cours</Badge>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Text size="sm" fw={500}>EDPP</Text>
            <Badge color="gray" variant="light">Non commencé</Badge>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Text size="sm" fw={500}>Contrat d'engagement</Text>
            <Badge color="gray" variant="light">Non commencé</Badge>
          </Grid.Col>
        </Grid>
      </Card>
    </Container>
  );
}
