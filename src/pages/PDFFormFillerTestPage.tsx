import { Container, Title, Text } from '@mantine/core';
import { PDFFormFillerDemo } from '../components/pdf/PDFFormFillerDemo';

export function PDFFormFillerTestPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Test de Remplissage Automatique des Formulaires PDF
      </Title>
      
      <Text mb="xl" size="lg">
        Cette page teste la nouvelle approche de génération PDF qui utilise les formulaires 
        PDF existants avec des champs prédéfinis (test.name, test.homme, test.femme) 
        au lieu de créer des PDF à partir de zéro.
      </Text>

      <PDFFormFillerDemo />
    </Container>
  );
}
