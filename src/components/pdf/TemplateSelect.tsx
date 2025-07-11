import React from 'react';
import { Select, Button, Group, Card, Text, Stack, Badge, Alert } from '@mantine/core';
import { IconDownload, IconFileText, IconEye, IconInfoCircle, IconCheck, IconX } from '@tabler/icons-react';
import { 
  generateAndDownloadPDF,
  previewPDF,
  TEMPLATE_MAPPINGS,
  testTemplateAccessibility
} from '../../utils/pdf';
import { notifications } from '@mantine/notifications';
import type { Family } from '../../types/forms';

interface TemplateSelectProps {
  family: Family;
  onPDFGenerated?: (templateId: string) => void;
}

// Global cache to prevent multiple accessibility checks across components
let globalTemplateStatus: Record<string, {
  accessible: boolean;
  isPDF: boolean;
  size?: number;
  error?: string;
}> | null = null;
let isGloballyChecking = false;

// Utility function to reset cache (useful for development)
export const resetTemplateCache = () => {
  globalTemplateStatus = null;
  isGloballyChecking = false;
  console.log('Template cache reset');
};

export const TemplateSelect: React.FC<TemplateSelectProps> = ({ family, onPDFGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [templateStatus, setTemplateStatus] = React.useState<Record<string, {
    accessible: boolean;
    isPDF: boolean;
    size?: number;
    error?: string;
  }>>({});
  
  // Memoize template IDs to prevent infinite re-renders
  const templateIds = React.useMemo(() => Object.keys(TEMPLATE_MAPPINGS), []);
  
  // Check which templates are available and accessible - only run once globally
  React.useEffect(() => {
    // Use cached results if available
    if (globalTemplateStatus) {
      setTemplateStatus(globalTemplateStatus);
      return;
    }
    
    // Prevent multiple simultaneous global checks
    if (isGloballyChecking) {
      // If another component is already checking, wait for it to complete
      const waitForCheck = () => {
        if (globalTemplateStatus) {
          setTemplateStatus(globalTemplateStatus);
        } else if (isGloballyChecking) {
          setTimeout(waitForCheck, 100); // Check again in 100ms
        }
      };
      waitForCheck();
      return;
    }
    
    const checkTemplates = async () => {
      isGloballyChecking = true;
      console.log('Checking template accessibility (one time for entire app)...');
      
      const status: Record<string, {
        accessible: boolean;
        isPDF: boolean;
        size?: number;
        error?: string;
      }> = {};
      
      for (const templateId of templateIds) {
        try {
          const result = await testTemplateAccessibility(templateId);
          status[templateId] = {
            accessible: result.accessible,
            isPDF: result.isPDF === true,
            size: result.size,
            error: result.error
          };
        } catch (error) {
          status[templateId] = {
            accessible: false,
            isPDF: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
      
      // Cache globally and set local state
      globalTemplateStatus = status;
      setTemplateStatus(status);
      isGloballyChecking = false;
      console.log('Template accessibility check complete - cached for future use');
    };
    
    checkTemplates();
  }, [templateIds]);
  
  // Available template options (only accessible ones)
  const templateOptions = React.useMemo(() => {
    return templateIds
      .filter(id => templateStatus[id]?.accessible && templateStatus[id]?.isPDF)
      .map(id => {
        const config = TEMPLATE_MAPPINGS[id];
        return {
          value: id,
          label: config.name,
          description: config.description,
        };
      });
  }, [templateStatus, templateIds]);

  const handleGeneratePDF = async () => {
    if (!selectedTemplate) {
      notifications.show({
        title: 'Erreur',
        message: 'Veuillez sélectionner un modèle de formulaire',
        color: 'red',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const config = TEMPLATE_MAPPINGS[selectedTemplate];
      if (!config) {
        throw new Error('Template configuration not found');
      }
      
      await generateAndDownloadPDF(
        selectedTemplate, 
        family,
        `${config.name}_${new Date().toISOString().split('T')[0]}.pdf`
      );
      
      notifications.show({
        title: 'PDF généré',
        message: `Le formulaire "${config.name}" a été généré et téléchargé avec succès`,
        color: 'green',
        icon: <IconDownload size={16} />,
      });
      
      onPDFGenerated?.(selectedTemplate);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de générer le PDF. Veuillez réessayer.',
        color: 'red',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!selectedTemplate) {
      notifications.show({
        title: 'Erreur',
        message: 'Veuillez sélectionner un modèle de formulaire',
        color: 'red',
      });
      return;
    }

    setIsPreviewing(true);
    
    try {
      await previewPDF(selectedTemplate, family);
      
      notifications.show({
        title: 'Aperçu ouvert',
        message: 'L\'aperçu du PDF a été ouvert dans un nouvel onglet',
        color: 'blue',
        icon: <IconEye size={16} />,
      });
      
    } catch (error) {
      console.error('Error previewing PDF:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible d\'ouvrir l\'aperçu. Veuillez réessayer.',
        color: 'red',
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const selectedTemplateConfig = selectedTemplate ? TEMPLATE_MAPPINGS[selectedTemplate] : null;
  const selectedTemplateStatus = selectedTemplate ? templateStatus[selectedTemplate] : null;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>
          Générer un formulaire PDF
        </Text>
        
        <Alert icon={<IconInfoCircle size={16} />} title="Système de génération PDF" color="green">
          <Text size="sm">
            Utilise les templates PDF officiels avec leurs champs de formulaire existants pour préserver l'apparence exacte des documents originaux.
          </Text>
        </Alert>
        
        <Select
          label="Modèle de formulaire"
          placeholder="Sélectionnez un modèle"
          data={templateOptions}
          value={selectedTemplate}
          onChange={(value) => setSelectedTemplate(value || '')}
          leftSection={<IconFileText size={16} />}
          disabled={templateOptions.length === 0}
        />
        
        {templateOptions.length === 0 && (
          <Alert icon={<IconX size={16} />} title="Aucun template disponible" color="red">
            <Text size="sm">
              Aucun template PDF n'est actuellement accessible. Vérifiez que les fichiers sont présents dans le dossier `/public/templates/`.
            </Text>
          </Alert>
        )}
        
        {selectedTemplateConfig && selectedTemplateStatus && (
          <Card withBorder padding="sm" bg="green.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={500}>{selectedTemplateConfig.name}</Text>
                <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
                  Disponible
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {selectedTemplateConfig.description}
              </Text>
              <Group gap="md">
                <Text size="xs" c="green.7">
                  ✓ {selectedTemplateConfig.fields.length} champs mappés
                </Text>
                {selectedTemplateStatus.size && (
                  <Text size="xs" c="dimmed">
                    Taille: {Math.round(selectedTemplateStatus.size / 1024)} KB
                  </Text>
                )}
              </Group>
            </Stack>
          </Card>
        )}

        {/* Debug info for templates */}
        {Object.keys(templateStatus).length > 0 && (
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: '#666' }}>
              Debug: État des templates ({templateIds.length} total)
            </summary>
            <Stack gap="xs" mt="xs">
              {templateIds.map(id => {
                const status = templateStatus[id];
                const config = TEMPLATE_MAPPINGS[id];
                if (!status) return null;
                
                return (
                  <Group key={id} justify="space-between" wrap="nowrap">
                    <Text size="xs" truncate>{config.name}</Text>
                    <Group gap="xs">
                      {status.accessible ? (
                        <Badge size="xs" color="green">✓</Badge>
                      ) : (
                        <Badge size="xs" color="red">✗</Badge>
                      )}
                      {status.isPDF ? (
                        <Badge size="xs" color="blue">PDF</Badge>
                      ) : (
                        <Badge size="xs" color="orange">!PDF</Badge>
                      )}
                    </Group>
                  </Group>
                );
              })}
            </Stack>
          </details>
        )}
        
        <Group grow>
          <Button
            onClick={handlePreviewPDF}
            disabled={!selectedTemplate || !selectedTemplateStatus?.accessible}
            loading={isPreviewing}
            leftSection={<IconEye size={16} />}
            variant="light"
          >
            Aperçu
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={!selectedTemplate || !selectedTemplateStatus?.accessible}
            loading={isGenerating}
            leftSection={<IconDownload size={16} />}
          >
            Télécharger
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
