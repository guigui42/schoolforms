import { Group, Title, Burger, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSchool } from '@tabler/icons-react';

export function AppHeader() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group gap="xs">
          <IconSchool style={{ width: rem(30), height: rem(30) }} color="blue" />
          <Title order={3}>SchoolForms</Title>
        </Group>
      </Group>
    </Group>
  );
}
