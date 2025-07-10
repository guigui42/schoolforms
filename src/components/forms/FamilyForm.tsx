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
import { IconCheck, IconInfoCircle, IconDownload } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AddressForm } from './AddressForm';
import { ParentForm } from './ParentForm';
import { useFormStore } from '../../stores/formStore';
import { PDFGenerator, createFieldMappingsFromFamily, createCoordinateMappingsFromFamily } from '../../utils/pdf';

import type { AddressFormData, ParentFormData } from '../../schemas/parent';
import type { Family } from '../../types/forms';

export const FamilyForm: React.FC = () => {
  const [active, setActive] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
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

  // Auto-save on form changes
  useEffect(() => {
    const handleFormChange = () => {
      if (addressForm.isValid() || parentForm.isValid()) {
        setIsAutoSaving(true);
        saveToStore();
        setTimeout(() => setIsAutoSaving(false), 500);
      }
    };

    // Save after a delay to avoid too many saves
    const timeoutId = setTimeout(handleFormChange, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [addressForm.values, parentForm.values]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to store function
  const saveToStore = () => {
    const familyData: Family = {
      id: currentFamily?.id || uuidv4(),
      address: addressForm.values,
      students: currentFamily?.students || [],
      parents: [parentForm.values],
      emergencyContacts: currentFamily?.emergencyContacts || [],
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
    if (addressForm.isValid() && parentForm.isValid()) {
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
        currentFamily: currentFamily
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!addressForm.isValid() || !parentForm.isValid()) {
      notifications.show({
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs requis avant de générer le PDF',
        color: 'red',
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      // Save data first
      saveToStore();
      
      // Create a temporary family object with current data
      const tempFamily = {
        id: currentFamily?.id || uuidv4(),
        address: addressForm.values,
        students: currentFamily?.students || [],
        parents: [parentForm.values],
        emergencyContacts: currentFamily?.emergencyContacts || [],
        preferences: currentFamily?.preferences || {
          notifications: true,
          language: 'fr',
          theme: 'auto',
          autoSave: true,
        },
        createdAt: currentFamily?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      const pdfGenerator = new PDFGenerator();
      
      // Try to load a simpler template first
      const templates = [
        'EDPP Contrat d\'engagement 2025-2026.pdf',
        'Fiche d\'inscription EDPP - Mercredis Vacs sco 25-26.pdf',
        'Dossier d\'inscription ALSH - EDPP 2025-2026.pdf',
        'PERISCOLAIRE – 2025-2026 - Fiche d\'inscription (1).pdf'
      ];
      
      let loadedTemplate = null;
      for (const template of templates) {
        try {
          console.log(`Trying to load template: ${template}`);
          await pdfGenerator.loadTemplate(template);
          loadedTemplate = template;
          console.log(`Successfully loaded template: ${template}`);
          break;
        } catch (error) {
          console.log(`Failed to load template ${template}:`, error);
        }
      }
      
      if (!loadedTemplate) {
        throw new Error('Unable to load any PDF template');
      }
      
      // Get all form fields for debugging
      const formFields = pdfGenerator.getFormFields();
      console.log('Available PDF form fields:', formFields);
      
      // Try to fill form fields first
      const fieldMappings = createFieldMappingsFromFamily(tempFamily);
      pdfGenerator.fillFormFields(fieldMappings);
      
      // Also try coordinate-based mapping
      const coordinateMappings = createCoordinateMappingsFromFamily(tempFamily);
      await pdfGenerator.addTextAtCoordinates(coordinateMappings);
      
      // Generate and download the PDF
      const filename = `formulaire-${tempFamily.address.city}-${new Date().toISOString().split('T')[0]}.pdf`;
      await pdfGenerator.downloadPDF(filename);
      
      notifications.show({
        title: 'PDF généré',
        message: `Le formulaire ${loadedTemplate} a été généré avec succès`,
        color: 'green',
        icon: <IconDownload size={16} />,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de générer le PDF. Veuillez réessayer.',
        color: 'red',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const progress = ((active + 1) / 3) * 100;

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
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleGeneratePDF}
                  loading={isGeneratingPDF}
                  leftSection={<IconDownload size={16} />}
                >
                  Générer PDF avec adresse et parent
                </Button>
              </Stack>
            </Stepper.Completed>
          </Stepper>

          <Group justify="space-between" mt="xl">
            <Button variant="default" onClick={prevStep} disabled={active === 0}>
              Précédent
            </Button>
            
            {active < 2 ? (
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
