'use client';

import { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Text, Avatar, Button } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    userType: 'family' | 'authority';
  } | null;
};

export function AppLayout({ children, user }: AppShellProps) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const familyLinks = [
    { label: 'Home', href: '/' },
    { label: 'Search for Missing Person', href: '/search' },
    { label: 'Add Missing Person', href: '/add-missing' },
    { label: 'My Searches', href: '/my-searches' },
    { label: 'Notifications', href: '/notifications' },
  ];

  const authorityLinks = [
    { label: 'Home', href: '/' },
    { label: 'Manage Prisoners', href: '/manage-prisoners' },
    { label: 'Add Released Prisoner', href: '/add-released' },
    { label: 'Statistics', href: '/statistics' },
  ];

  const links = user?.userType === 'authority' ? authorityLinks : familyLinks;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            <Text size="xl" fw={700}>Finder</Text>
            {user ? (
              <Group>
                <Text>{user.name}</Text>
                <Avatar radius="xl" />
                <Button variant="subtle" onClick={() => router.push('/logout')}>Logout</Button>
              </Group>
            ) : (
              <Group>
                <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
                <Button onClick={() => router.push('/register')}>Register</Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Navbar p="md">
        {links.map((link) => (
          <NavLink
            key={link.href}
            component={Link}
            href={link.href}
            label={link.label}
            active={pathname === link.href}
            my={5}
          />
        ))}
      </AppShell.Navbar>
      
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
} 