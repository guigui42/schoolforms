import React from 'react';
import { Select, Button, Group, Card, Text, Stack, Badge } from '@mantine/core';
import { IconDownload, IconFileText } from '@tabler/icons-react';
import { getAllTemplates, getTemplate, generateAndDownloadPDF } from '../../utils/pdf';
import { notifications } from '@mantine/notifications';
import type { Family } from '../../types/forms';

interface TemplateSelectProps {
  family: Family;
  onPDFGenerated?: (templateId: string) => void;
}

export const TemplateSelect: React.FC<TemplateSelectProps> = ({ family, onPDFGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  
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
      
      await generateAndDownloadPDF(template, family);
      
      notifications.show({
        title: 'PDF généré',
        message: 'Le formulaire a été généré et téléchargé avec succès',
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
        
        <Button
          onClick={handleGeneratePDF}
          disabled={!selectedTemplate}
          loading={isGenerating}
          leftSection={<IconDownload size={16} />}
          size="md"
        >
          Générer et télécharger le PDF
        </Button>
      </Stack>
    </Card>
  );
};
