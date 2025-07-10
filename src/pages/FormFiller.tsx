import { Container, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function FormFiller() {
  const { formType } = useParams<{ formType: string }>();

  return (
    <Container size="lg">
      <Title order={1} mb="xl">
        Remplir le formulaire: {formType}
      </Title>
      
      <Text>
        Formulaire {formType} en cours de développement...
      </Text>
    </Container>
  );
}
