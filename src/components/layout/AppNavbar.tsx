import { NavLink, Stack, rem } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconHome, 
  IconFileText, 
  IconSettings, 
  IconUser,
  IconPdf,
  IconTestPipe,
  IconEdit
} from '@tabler/icons-react';

export function AppNavbar() {
  const location = useLocation();

  const navItems = [
    { 
      label: 'Tableau de bord', 
      icon: IconHome, 
      path: '/' 
    },
    { 
      label: 'Formulaires', 
      icon: IconFileText, 
      path: '/forms',
      children: [
        { label: 'Périscolaire', path: '/form/periscolaire' },
        { label: 'EDPP', path: '/edpp' },
      ]
    },
    { 
      label: 'Famille', 
      icon: IconUser, 
      path: '/family' 
    },
    { 
      label: 'Éditeur PDF', 
      icon: IconEdit, 
      path: '/pdf-editor' 
    },
    { 
      label: 'Test PDF', 
      icon: IconTestPipe, 
      path: '/pdf-test' 
    },
    { 
      label: 'Paramètres', 
      icon: IconSettings, 
      path: '/settings' 
    },
  ];

  return (
    <Stack gap="xs" p="md">
      {navItems.map((item) => (
        <div key={item.path}>
          <NavLink
            component={Link}
            to={item.path}
            label={item.label}
            leftSection={<item.icon style={{ width: rem(16), height: rem(16) }} />}
            active={location.pathname === item.path}
          />
          {item.children && (
            <Stack gap="xs" ml="md" mt="xs">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  component={Link}
                  to={child.path}
                  label={child.label}
                  leftSection={<IconPdf style={{ width: rem(14), height: rem(14) }} />}
                  active={location.pathname === child.path}
                  variant="light"
                />
              ))}
            </Stack>
          )}
        </div>
      ))}
    </Stack>
  );
}
