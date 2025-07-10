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
import { notifications } from '@mantine/notifications';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AddressForm } from './AddressForm';
import { ParentForm } from './ParentForm';
import { StudentForm } from './StudentForm';
import { EmergencyContactForm } from './EmergencyContactForm';
import { TemplateSelect } from '../pdf/TemplateSelect';
import { useFormStore } from '../../stores/formStore';

import type { AddressFormData, ParentFormData, EmergencyContactFormData } from '../../schemas/parent';
import type { StudentFormData } from '../../schemas/student';
import type { Family } from '../../types/forms';

export const FamilyForm: React.FC = () => {
  const [active, setActive] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // Get store functions
  const { 
    currentFamily, 
    addFamily, 
    updateFamily, 
    setCurrentFamily 
  } = useFormStore();
  
  // Initialize address form
  const addressForm = useForm<AddressFormData>({
    initialValues: {
      street: currentFamily?.address?.street || '',
      city: currentFamily?.address?.city || '',
      postalCode: currentFamily?.address?.postalCode || '',
      country: currentFamily?.address?.country || 'France',
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

  // Initialize parent form
  const parentForm = useForm<ParentFormData>({
    initialValues: {
      id: currentFamily?.parents?.[0]?.id || uuidv4(),
      type: currentFamily?.parents?.[0]?.type || 'mother',
      firstName: currentFamily?.parents?.[0]?.firstName || '',
      lastName: currentFamily?.parents?.[0]?.lastName || '',
      email: currentFamily?.parents?.[0]?.email || '',
      phone: currentFamily?.parents?.[0]?.phone || '',
      emergencyContact: currentFamily?.parents?.[0]?.emergencyContact || false,
      profession: currentFamily?.parents?.[0]?.profession || '',
      workAddress: currentFamily?.parents?.[0]?.workAddress || {
        street: '',
        city: '',
        postalCode: '',
        country: 'France',
      },
      workPhone: currentFamily?.parents?.[0]?.workPhone || '',
    },
    validate: {
      firstName: (value) => value.trim().length < 2 ? 'Prénom requis' : null,
      lastName: (value) => value.trim().length < 2 ? 'Nom requis' : null,
      email: (value) => {
        if (!value.trim()) return 'Email requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email invalide';
        return null;
      },
      phone: (value) => {
        if (!value.trim()) return 'Téléphone requis';
        if (!/^[0-9\s\-+()]+$/.test(value)) return 'Téléphone invalide';
        return null;
      },
    },
  });

  // Initialize student form
  const studentForm = useForm<StudentFormData>({
    initialValues: {
      id: currentFamily?.students?.[0]?.id || uuidv4(),
      firstName: currentFamily?.students?.[0]?.firstName || '',
      lastName: currentFamily?.students?.[0]?.lastName || '',
      birthDate: currentFamily?.students?.[0]?.birthDate || new Date(),
      grade: currentFamily?.students?.[0]?.grade || 'CP',
      school: currentFamily?.students?.[0]?.school || '',
      photoAuthorization: currentFamily?.students?.[0]?.photoAuthorization || false,
      transportAuthorization: currentFamily?.students?.[0]?.transportAuthorization || false,
      medicalInfo: currentFamily?.students?.[0]?.medicalInfo || {
        allergies: [],
        medications: [],
        conditions: [],
        notes: '',
      },
      specialNeeds: currentFamily?.students?.[0]?.specialNeeds || '',
    },
    validate: {
      firstName: (value) => value.trim().length < 2 ? 'Prénom requis' : null,
      lastName: (value) => value.trim().length < 2 ? 'Nom requis' : null,
      birthDate: (value) => !value ? 'Date de naissance requise' : null,
      grade: (value) => !value ? 'Classe requise' : null,
      school: (value) => value.trim().length < 2 ? 'École requise' : null,
    },
  });

  // Initialize emergency contact form
  const emergencyContactForm = useForm<EmergencyContactFormData>({
    initialValues: {
      id: currentFamily?.emergencyContacts?.[0]?.id || uuidv4(),
      firstName: currentFamily?.emergencyContacts?.[0]?.firstName || '',
      lastName: currentFamily?.emergencyContacts?.[0]?.lastName || '',
      phone: currentFamily?.emergencyContacts?.[0]?.phone || '',
      relationship: currentFamily?.emergencyContacts?.[0]?.relationship || '',
    },
    validate: {
      firstName: (value) => value.trim().length < 2 ? 'Prénom requis' : null,
      lastName: (value) => value.trim().length < 2 ? 'Nom requis' : null,
      phone: (value) => {
        if (!value.trim()) return 'Téléphone requis';
        if (!/^[0-9\s\-+()]+$/.test(value)) return 'Téléphone invalide';
        return null;
      },
      relationship: (value) => value.trim().length < 2 ? 'Lien requis' : null,
    },
  });

  // Auto-save on form changes
  useEffect(() => {
    const handleFormChange = () => {
      if (addressForm.isValid() || parentForm.isValid() || studentForm.isValid() || emergencyContactForm.isValid()) {
        setIsAutoSaving(true);
        saveToStore();
        setTimeout(() => setIsAutoSaving(false), 500);
      }
    };

    // Save after a delay to avoid too many saves
    const timeoutId = setTimeout(handleFormChange, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [addressForm.values, parentForm.values, studentForm.values, emergencyContactForm.values]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to store function
  const saveToStore = () => {
    const familyData: Family = {
      id: currentFamily?.id || uuidv4(),
      address: addressForm.values,
      students: [studentForm.values],
      parents: [parentForm.values],
      emergencyContacts: [emergencyContactForm.values],
      preferences: currentFamily?.preferences || {
        notifications: true,
        language: 'fr',
        theme: 'auto',
        autoSave: true,
      },
      createdAt: currentFamily?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (currentFamily) {
      updateFamily(currentFamily.id, familyData);
    } else {
      addFamily(familyData);
      setCurrentFamily(familyData);
    }
  };

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Address
        return addressForm.isValid();
      case 1: // Parent
        return parentForm.isValid();
      case 2: // Student
        return studentForm.isValid();
      case 3: // Emergency Contact
        return emergencyContactForm.isValid();
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
    if (addressForm.isValid() && parentForm.isValid() && studentForm.isValid() && emergencyContactForm.isValid()) {
      saveToStore();
      notifications.show({
        title: 'Données sauvegardées',
        message: 'Les informations familiales ont été enregistrées avec succès',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      console.log('Family data saved:', {
        address: addressForm.values,
        parent: parentForm.values,
        student: studentForm.values,
        emergencyContact: emergencyContactForm.values,
        currentFamily: currentFamily
      });
    }
  };

  const handlePDFGenerated = (templateId: string) => {
    console.log(`PDF generated for template: ${templateId}`);
    // Optionally handle post-generation actions
  };

  const progress = ((active + 1) / 5) * 100;

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
          {isAutoSaving && (
            <Text c="blue" size="sm" mt="xs">
              💾 Sauvegarde automatique en cours...
            </Text>
          )}
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

            <Stepper.Step 
              label="Parent" 
              description="Informations du parent/tuteur"
              icon={isStepValid(1) ? <IconCheck /> : undefined}
              color={isStepValid(1) ? "green" : undefined}
            >
              <ParentForm
                form={parentForm}
              />
            </Stepper.Step>

            <Stepper.Step 
              label="Enfant" 
              description="Informations de l'enfant"
              icon={isStepValid(2) ? <IconCheck /> : undefined}
              color={isStepValid(2) ? "green" : undefined}
            >
              <StudentForm
                form={studentForm}
              />
            </Stepper.Step>

            <Stepper.Step 
              label="Contact d'urgence" 
              description="Personne à contacter en cas d'urgence"
              icon={isStepValid(3) ? <IconCheck /> : undefined}
              color={isStepValid(3) ? "green" : undefined}
            >
              <EmergencyContactForm
                form={emergencyContactForm}
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
                
                {/* Create family object for PDF generation */}
                {(() => {
                  const tempFamily = {
                    id: currentFamily?.id || uuidv4(),
                    address: addressForm.values,
                    students: [studentForm.values],
                    parents: [parentForm.values],
                    emergencyContacts: [emergencyContactForm.values],
                    preferences: currentFamily?.preferences || {
                      notifications: true,
                      language: 'fr',
                      theme: 'auto',
                      autoSave: true,
                    },
                    createdAt: currentFamily?.createdAt || new Date(),
                    updatedAt: new Date(),
                  };
                  
                  return (
                    <TemplateSelect 
                      family={tempFamily} 
                      onPDFGenerated={handlePDFGenerated}
                    />
                  );
                })()}
              </Stack>
            </Stepper.Completed>
          </Stepper>

          <Group justify="space-between" mt="xl">
            <Button variant="default" onClick={prevStep} disabled={active === 0}>
              Précédent
            </Button>
            
            {active < 4 ? (
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
