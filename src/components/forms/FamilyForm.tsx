import React from 'react';
import { 
  Container,
  Title,
  Stepper,
  Button,
  Group,
  Stack,
  Card,
  Text,
  Progress,
  Notification
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';

import { AddressForm } from './AddressForm';

import type { AddressFormData } from '../../schemas/parent';

export const FamilyForm: React.FC = () => {
  const [active, setActive] = useState(0);
  
  // Initialize address form
  const addressForm = useForm<AddressFormData>({
    initialValues: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
    validate: {
      street: (value) => value.trim().length < 2 ? 'Adresse requise' : null,
      city: (value) => value.trim().length < 2 ? 'Ville requise' : null,
      postalCode: (value) => {
        const cleaned = value.trim();
        if (cleaned.length === 0) return 'Code postal requis';
        if (!/^\d{5}$/.test(cleaned)) return 'Code postal invalide (5 chiffres)';
        return null;
      },
      country: (value) => value.trim().length < 2 ? 'Pays requis' : null,
    },
  });

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Address
        return addressForm.isValid();
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(active)) {
      setActive(prev => prev + 1);
    }
  };

  const prevStep = () => setActive(prev => prev - 1);

  const handleSubmit = () => {
    const familyData = {
      address: addressForm.values,
    };
    
    console.log('Family data:', familyData);
    // TODO: Save to store
  };

  const progress = ((active + 1) / 2) * 100;

  return (
    <Container size="lg">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Informations familiales
          </Title>
          <Text c="dimmed" size="lg">
            Remplissez les informations de votre famille une seule fois. 
            Elles seront automatiquement utilisées dans tous les formulaires scolaires.
          </Text>
        </div>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Progress value={progress} mb="xl" />
          
          <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
            <Stepper.Step 
              label="Adresse" 
              description="Adresse du domicile"
              icon={isStepValid(0) ? <IconCheck /> : undefined}
              color={isStepValid(0) ? "green" : undefined}
            >
              <AddressForm
                form={addressForm}
                title="Adresse du domicile"
                description="Adresse principale de la famille"
              />
            </Stepper.Step>

            <Stepper.Completed>
              <Stack gap="md">
                <Notification
                  icon={<IconInfoCircle />}
                  title="Informations complètes"
                  color="green"
                  withCloseButton={false}
                >
                  Toutes les informations familiales ont été remplies avec succès. 
                  Vous pouvez maintenant générer vos formulaires scolaires automatiquement.
                </Notification>
                
                <Button size="lg" onClick={handleSubmit}>
                  Enregistrer les informations familiales
                </Button>
              </Stack>
            </Stepper.Completed>
          </Stepper>

          <Group justify="space-between" mt="xl">
            <Button variant="default" onClick={prevStep} disabled={active === 0}>
              Précédent
            </Button>
            
            {active < 1 ? (
              <Button 
                onClick={nextStep}
                disabled={!isStepValid(active)}
              >
                Suivant
              </Button>
            ) : null}
          </Group>
        </Card>
      </Stack>
    </Container>
  );
};
