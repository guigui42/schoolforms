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
  Notification,
  Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconInfoCircle, IconSchool, IconMedicalCross, IconActivity, IconCalendar, IconShield } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Import existing forms
import { AddressForm } from './AddressForm';
import { ParentForm } from './ParentForm';
import { StudentForm } from './StudentForm';
import { EmergencyContactForm } from './EmergencyContactForm';

// Import EDPP-specific forms
import { EDPPMedicalForm } from './EDPPMedicalForm';
import { EDPPActivitiesForm } from './EDPPActivitiesForm';
import { EDPPScheduleForm } from './EDPPScheduleForm';
import { EDPPAuthorizationsForm } from './EDPPAuthorizationsForm';

import { TemplateSelect } from '../pdf/TemplateSelect';
import { useFormStore } from '../../stores/formStore';

import type { AddressFormData, ParentFormData, EmergencyContactFormData } from '../../schemas/parent';
import type { StudentFormData } from '../../schemas/student';
import type { EDPPMedicalInfo, EDPPActivity, EDPPSchedule, EDPPAuthorizations } from '../../schemas/edpp';
import type { Family } from '../../types/forms';

export const EDPPForm: React.FC = () => {
  const [active, setActive] = useState(0);
  
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

  // Initialize student form with additional EDPP fields
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

  // Initialize EDPP-specific forms
  const medicalForm = useForm<EDPPMedicalInfo>({
    initialValues: {
      allergies: [],
      medications: [],
      conditions: [],
      notes: '',
      doctorName: '',
      doctorPhone: '',
      insuranceNumber: '',
      vaccinationUpToDate: false,
      specialDiet: false,
      specialDietDetails: '',
      pai: false,
      paiDetails: '',
    },
  });

  const activitiesForm = useForm<{ activities: EDPPActivity[] }>({
    initialValues: {
      activities: [],
    },
  });

  const scheduleForm = useForm<EDPPSchedule>({
    initialValues: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      autumnHolidays: false,
      winterHolidays: false,
      springHolidays: false,
      summerHolidays: false,
      morning: false,
      lunchTime: false,
      afternoon: false,
      pedagogicalDays: false,
      notes: '',
    },
  });

  const authorizationsForm = useForm<EDPPAuthorizations>({
    initialValues: {
      photoAuthorization: false,
      videoAuthorization: false,
      socialMediaAuthorization: false,
      pressAuthorization: false,
      swimmingAuthorization: false,
      outdoorActivitiesAuthorization: false,
      transportAuthorization: false,
      walkingExcursionAuthorization: false,
      medicationAuthorization: false,
      emergencyMedicalAuthorization: false,
      firstAidAuthorization: false,
      leaveAloneAuthorization: false,
      pickupByOthersAuthorization: false,
      authorizedPickupPersons: [],
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const handleFormChange = () => {
      if (addressForm.isValid() || parentForm.isValid() || studentForm.isValid() || emergencyContactForm.isValid()) {
        saveToStore();
      }
    };

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
      case 0: // Student
        return studentForm.isValid();
      case 1: // Parents
        return parentForm.isValid();
      case 2: // Address
        return addressForm.isValid();
      case 3: // Emergency Contact
        return emergencyContactForm.isValid();
      case 4: // Medical
        return medicalForm.isValid();
      case 5: // Activities
        return activitiesForm.isValid();
      case 6: // Schedule
        return scheduleForm.isValid();
      case 7: // Authorizations
        return authorizationsForm.isValid();
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
        title: 'Inscription EDPP sauvegardée',
        message: 'Votre dossier d\'inscription EDPP a été enregistré avec succès',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      console.log('EDPP form data saved:', {
        address: addressForm.values,
        parent: parentForm.values,
        student: studentForm.values,
        emergencyContact: emergencyContactForm.values,
        medical: medicalForm.values,
        activities: activitiesForm.values,
        schedule: scheduleForm.values,
        authorizations: authorizationsForm.values,
      });
    }
  };

  const handlePDFGenerated = (templateId: string) => {
    console.log(`PDF EDPP generated for template: ${templateId}`);
  };

  const progress = ((active + 1) / 9) * 100;

  const getStepIcon = (stepIndex: number) => {
    if (isStepValid(stepIndex)) return <IconCheck />;
    
    const icons = [
      <IconSchool key="student" />,
      <IconInfoCircle key="parent" />,
      <IconInfoCircle key="address" />,
      <IconInfoCircle key="emergency" />,
      <IconMedicalCross key="medical" />,
      <IconActivity key="activities" />,
      <IconCalendar key="schedule" />,
      <IconShield key="authorizations" />,
    ];
    
    return icons[stepIndex];
  };

  return (
    <Container size="lg">
      <Stack gap="xl">
        <div>
          <Group gap="sm" mb="md">
            <IconSchool size={32} />
            <div>
              <Title order={1}>
                Inscription EDPP 2025-2026
              </Title>
              <Text c="dimmed" size="lg">
                École de Plein Air - Dossier d'inscription complet
              </Text>
            </div>
          </Group>
          <Badge color="blue" size="lg" mb="md">
            Année scolaire 2025-2026
          </Badge>
        </div>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Progress value={progress} mb="xl" />
          
          <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
            <Stepper.Step 
              label="Enfant" 
              description="Identité"
              icon={getStepIcon(0)}
              color={isStepValid(0) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <StudentForm
                  form={studentForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Parents" 
              description="Responsables"
              icon={getStepIcon(1)}
              color={isStepValid(1) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <ParentForm
                  form={parentForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Adresse" 
              description="Domicile principal"
              icon={getStepIcon(2)}
              color={isStepValid(2) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <AddressForm
                  form={addressForm}
                  title="Adresse du domicile"
                  description="Adresse principale de la famille"
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Urgence" 
              description="Contact d'urgence"
              icon={getStepIcon(3)}
              color={isStepValid(3) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <EmergencyContactForm
                  form={emergencyContactForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Médical" 
              description="Santé et besoins"
              icon={getStepIcon(4)}
              color={isStepValid(4) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <EDPPMedicalForm
                  form={medicalForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Activités" 
              description="Sélection EDPP"
              icon={getStepIcon(5)}
              color={isStepValid(5) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <EDPPActivitiesForm
                  form={activitiesForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Horaires" 
              description="Préférences"
              icon={getStepIcon(6)}
              color={isStepValid(6) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <EDPPScheduleForm
                  form={scheduleForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step 
              label="Autorisations" 
              description="Permissions"
              icon={getStepIcon(7)}
              color={isStepValid(7) ? "green" : undefined}
            >
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep} disabled={active === 0}>
                    Précédent
                  </Button>
                  
                  {active < 8 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid(active)}
                    >
                      Suivant
                    </Button>
                  ) : null}
                </Group>
                
                <EDPPAuthorizationsForm
                  form={authorizationsForm}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Completed>
              <Stack gap="md">
                <Group justify="space-between" mb="md">
                  <Button variant="default" onClick={prevStep}>
                    Précédent
                  </Button>
                </Group>
                
                <Notification
                  icon={<IconInfoCircle />}
                  title="Dossier d'inscription EDPP complet"
                  color="green"
                  withCloseButton={false}
                >
                  Félicitations ! Vous avez rempli toutes les sections du dossier d'inscription EDPP. 
                  Vous pouvez maintenant sauvegarder votre dossier et générer le PDF officiel.
                </Notification>
                
                <Button size="lg" onClick={handleSubmit}>
                  Enregistrer le dossier EDPP
                </Button>
                
                {/* Generate PDF for EDPP */}
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
        </Card>
      </Stack>
    </Container>
  );
};
