import { Container, Title, Text, Divider } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { PDFFormFillerDemo } from '../components/pdf/PDFFormFillerDemo';

export function PDFPreview() {
  const { formType } = useParams<{ formType: string }>();

  return (
    <Container size="lg">
      <Title order={1} mb="xl">
        Aperçu PDF: {formType || 'Tous les formulaires'}
      </Title>
      
      <Text mb="md">
        Cette page contient des outils pour tester la génération de PDF avec les nouveaux formulaires.
      </Text>

      <Divider my="xl" />

      <Title order={2} mb="md">
        Test du Remplissage Automatique des Formulaires PDF
      </Title>
      
      <PDFFormFillerDemo />
    </Container>
  );
}
