import React from 'react';
import { Container, Title, Text, Stack, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { EDPPForm } from '../components/forms/EDPPForm';

export const EDPPFormPage: React.FC = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">
            École de Plein Air - EDPP
          </Title>
          <Text size="lg" c="dimmed" mb="lg">
            Formulaire d'inscription complet pour l'École de Plein Air 2025-2026
          </Text>
          
          <Alert icon={<IconInfoCircle />} color="blue" variant="light" mb="xl">
            <strong>Information importante :</strong> Ce formulaire vous permet de compléter votre dossier d'inscription EDPP. 
            Toutes les informations saisies seront utilisées pour générer automatiquement les documents PDF officiels requis.
          </Alert>
        </div>
        
        <EDPPForm />
      </Stack>
    </Container>
  );
};
