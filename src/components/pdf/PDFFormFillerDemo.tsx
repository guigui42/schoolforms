/**
 * PDF Form Filler Demo Component
 * 
 * Demo component to test the new PDF form filling approach
 * using actual PDF templates with form fields.
 */

import React, { useState } from 'react';
import { Button, Group, Paper, Text, Stack, Alert, Loader } from '@mantine/core';
import { IconDownload, IconEye, IconInfoCircle } from '@tabler/icons-react';
import { 
  generateAndDownloadPDF, 
  previewPDF, 
  analyzePDFTemplate,
  testTemplateAccessibility,
  TEMPLATE_MAPPINGS 
} from '../../utils/pdf';
import { debugPDFAccess } from '../../utils/pdf/debugPDFAccess';
import type { Family } from '../../types/forms';

// Sample family data for testing
const sampleFamily: Family = {
  id: 'family-1',
  students: [
    {
      id: 'student-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      birthDate: new Date('2015-03-15'),
      grade: 'CE2',
      school: 'École Primaire Victor Hugo'
    }
  ],
  parents: [
    {
      id: 'parent-1',
      type: 'father',
      firstName: 'Pierre',
      lastName: 'Dupont',
      email: 'pierre.dupont@email.com',
      phone: '0123456789',
      profession: 'Ingénieur'
    },
    {
      id: 'parent-2',
      type: 'mother',
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@email.com',
      phone: '0123456788',
      profession: 'Professeure'
    }
  ],
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France'
  },
  emergencyContacts: [
    {
      id: 'emergency-1',
      firstName: 'Grand-mère',
      lastName: 'Dupont',
      phone: '0123456777',
      relationship: 'Grand-mère'
    }
  ],
  preferences: {
    language: 'fr',
    notifications: true,
    autoSave: true,
    theme: 'light'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const PDFFormFillerDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<string, string[]>>({});
  const [accessibilityResults, setAccessibilityResults] = useState<Record<string, {
    accessible: boolean;
    status?: number;
    contentType?: string;
    size?: number;
    error?: string;
    isPDF?: boolean;
  }>>({});

  const handleGeneratePDF = async (templateName: string, action: 'download' | 'preview') => {
    setLoading(true);
    try {
      if (action === 'download') {
        await generateAndDownloadPDF(templateName, sampleFamily);
      } else {
        await previewPDF(templateName, sampleFamily);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTemplate = async (templateName: string) => {
    setLoading(true);
    try {
      const fields = await analyzePDFTemplate(templateName);
      setAnalysisResults(prev => ({
        ...prev,
        [templateName]: fields
      }));
    } catch (error) {
      console.error('Error analyzing template:', error);
      alert(`Error analyzing template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccessibility = async (templateName: string) => {
    setLoading(true);
    try {
      const result = await testTemplateAccessibility(templateName);
      setAccessibilityResults(prev => ({
        ...prev,
        [templateName]: result
      }));
    } catch (error) {
      console.error('Error testing accessibility:', error);
      alert(`Error testing accessibility: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugAccess = async () => {
    setLoading(true);
    try {
      await debugPDFAccess();
    } catch (error) {
      console.error('Debug failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={16} />} color="blue">
        This demo uses the new PDF form filling approach. It loads existing PDF templates 
        with pre-defined form fields and fills them with data from our application.
        <br />
        <strong>Test fields:</strong> test.name, test.homme, test.femme
      </Alert>

      <Paper p="md" withBorder bg="yellow.0">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>Debug Tools</Text>
          <Button
            variant="outline"
            color="orange"
            onClick={handleDebugAccess}
            loading={loading}
            size="sm"
          >
            Debug PDF Access (Check Console)
          </Button>
        </Group>
      </Paper>

      {Object.keys(TEMPLATE_MAPPINGS).map(templateName => (
        <Paper key={templateName} p="md" withBorder>
          <Stack gap="sm">
            <Text size="lg" fw={600}>{templateName.toUpperCase()} Template</Text>
            
            <Text size="sm" c="dimmed">
              Template: {TEMPLATE_MAPPINGS[templateName].templatePath}
            </Text>
            
            <Text size="sm">
              Mapped fields: {Object.entries(TEMPLATE_MAPPINGS[templateName].fields).map(
                ([appField, pdfField]) => `${appField} → ${pdfField}`
              ).join(', ')}
            </Text>

            <Group>
              <Button
                variant="filled"
                leftSection={<IconDownload size={16} />}
                onClick={() => handleGeneratePDF(templateName, 'download')}
                loading={loading}
              >
                Download Filled PDF
              </Button>

              <Button
                variant="light"
                leftSection={<IconEye size={16} />}
                onClick={() => handleGeneratePDF(templateName, 'preview')}
                loading={loading}
              >
                Preview PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => handleAnalyzeTemplate(templateName)}
                loading={loading}
              >
                Analyze Form Fields
              </Button>

              <Button
                variant="outline"
                color="orange"
                onClick={() => handleTestAccessibility(templateName)}
                loading={loading}
              >
                Test Template Access
              </Button>
            </Group>

            {analysisResults[templateName] && (
              <Paper p="sm" bg="gray.0">
                <Text size="sm" fw={600} mb="xs">
                  Found {analysisResults[templateName].length} form fields:
                </Text>
                <Stack gap={2}>
                  {analysisResults[templateName].map((field, index) => (
                    <Text key={index} size="xs" ff="monospace">
                      {field}
                    </Text>
                  ))}
                </Stack>
              </Paper>
            )}

            {accessibilityResults[templateName] && (
              <Paper p="sm" bg={accessibilityResults[templateName].accessible ? "green.0" : "red.0"}>
                <Text size="sm" fw={600} mb="xs">
                  Template Accessibility Test:
                </Text>
                <Stack gap={2}>
                  <Text size="xs">
                    <strong>Accessible:</strong> {accessibilityResults[templateName].accessible ? 'Yes' : 'No'}
                  </Text>
                  {accessibilityResults[templateName].status && (
                    <Text size="xs">
                      <strong>HTTP Status:</strong> {accessibilityResults[templateName].status}
                    </Text>
                  )}
                  {accessibilityResults[templateName].contentType && (
                    <Text size="xs">
                      <strong>Content Type:</strong> {accessibilityResults[templateName].contentType}
                    </Text>
                  )}
                  {accessibilityResults[templateName].size && (
                    <Text size="xs">
                      <strong>File Size:</strong> {accessibilityResults[templateName].size} bytes
                    </Text>
                  )}
                  {accessibilityResults[templateName].isPDF !== undefined && (
                    <Text size="xs">
                      <strong>Valid PDF:</strong> {accessibilityResults[templateName].isPDF ? 'Yes' : 'No'}
                    </Text>
                  )}
                  {accessibilityResults[templateName].error && (
                    <Text size="xs" c="red">
                      <strong>Error:</strong> {accessibilityResults[templateName].error}
                    </Text>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Paper>
      ))}

      {loading && (
        <Group justify="center">
          <Loader size="sm" />
          <Text size="sm">Processing PDF...</Text>
        </Group>
      )}

      <Paper p="md" bg="yellow.0" withBorder>
        <Text size="sm" fw={600} mb="xs">Sample Data Being Used:</Text>
        <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(sampleFamily, null, 2)}
        </Text>
      </Paper>
    </Stack>
  );
};
