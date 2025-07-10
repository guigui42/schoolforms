import { Container, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function PDFPreview() {
  const { formType } = useParams<{ formType: string }>();

  return (
    <Container size="lg">
      <Title order={1} mb="xl">
        Aperçu PDF: {formType}
      </Title>
      
      <Text>
        Aperçu PDF pour {formType} en cours de développement...
      </Text>
    </Container>
  );
}
