'use client';

import { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Text, Avatar, Button } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type AppShellProps = {
  children: React.ReactNode;
};

const AUTH_PAGES = ['/login', '/register', '/verification-pending', '/authority-verification', '/authority-register'];

export function AppLayout({ children }: AppShellProps) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isAuthPage = AUTH_PAGES.includes(pathname);

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
    { label: 'Verification Requests', href: '/authority-verification' },
  ];

  const links = user?.userType === 'authority' ? authorityLinks : familyLinks;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: isAuthPage ? 0 : 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: 0, sm: 'sm', md: 'md' }}
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
                <Button variant="subtle" onClick={logout}>Logout</Button>
              </Group>
            ) : (
              !isAuthPage && (
                <Group>
                  <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
                  <Button onClick={() => router.push('/register')}>Register</Button>
                </Group>
              )
            )}
          </Group>
        </Group>
      </AppShell.Header>
      
      {!isAuthPage && (
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
      )}
      
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
} 