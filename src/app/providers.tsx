'use client';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppShell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorSchemeScript />
      <MantineProvider>
        <Notifications position="top-right" />
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </MantineProvider>
    </>
  );
} 