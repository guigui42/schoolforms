import React from 'react';
import { Select, Button, Group, Card, Text, Stack, Badge, Switch } from '@mantine/core';
import { IconDownload, IconFileText, IconEdit, IconEye } from '@tabler/icons-react';
import { getAllTemplates, getTemplate, generateAndDownloadPDF, previewPDF } from '../../utils/pdf';
import { notifications } from '@mantine/notifications';
import type { Family } from '../../types/forms';

interface TemplateSelectProps {
  family: Family;
  onPDFGenerated?: (templateId: string) => void;
}

export const TemplateSelect: React.FC<TemplateSelectProps> = ({ family, onPDFGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [isEditable, setIsEditable] = React.useState(true);
  
  const templates = getAllTemplates();
  
  const templateOptions = templates.map(template => ({
    value: template.id,
    label: template.name,
    description: template.description,
  }));

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
      const template = getTemplate(selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }
      
      await generateAndDownloadPDF(template, family, { 
        editable: isEditable,
        filename: `${template.name}_${new Date().toISOString().split('T')[0]}.pdf`
      });
      
      notifications.show({
        title: 'PDF généré',
        message: `Le formulaire ${isEditable ? 'éditable' : 'statique'} a été généré et téléchargé avec succès`,
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
      const template = getTemplate(selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }
      
      await previewPDF(template, family, { 
        editable: isEditable 
      });
      
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

  const selectedTemplateInfo = templates.find(t => t.id === selectedTemplate);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>
          Générer un formulaire PDF
        </Text>
        
        <Select
          label="Modèle de formulaire"
          placeholder="Sélectionnez un modèle"
          data={templateOptions}
          value={selectedTemplate}
          onChange={(value) => setSelectedTemplate(value || '')}
          leftSection={<IconFileText size={16} />}
        />
        
        {selectedTemplateInfo && (
          <Card withBorder padding="sm" bg="gray.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={500}>{selectedTemplateInfo.name}</Text>
                <Badge color="blue" variant="light">
                  {selectedTemplateInfo.id}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {selectedTemplateInfo.description}
              </Text>
              <Text size="xs" c="dimmed">
                Sections: {selectedTemplateInfo.sections.length} sections
              </Text>
            </Stack>
          </Card>
        )}

        <Card withBorder padding="sm" bg="blue.0">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={500}>Options de génération</Text>
              <IconEdit size={16} />
            </Group>
            <Switch
              label="Formulaire éditable"
              description="Les champs peuvent être modifiés après génération"
              checked={isEditable}
              onChange={(event) => setIsEditable(event.currentTarget.checked)}
            />
            {isEditable && (
              <Text size="xs" c="green.7">
                📝 Le PDF généré contiendra des champs modifiables
              </Text>
            )}
          </Stack>
        </Card>
        
        <Group grow>
          <Button
            onClick={handlePreviewPDF}
            disabled={!selectedTemplate}
            loading={isPreviewing}
            leftSection={<IconEye size={16} />}
            variant="light"
          >
            Aperçu
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={!selectedTemplate}
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
