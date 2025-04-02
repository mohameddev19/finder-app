'use client';

import { useEffect } from 'react';
import { Container, Title, Text, Alert, Button, Center, Stack, Paper } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IconAlertCircle, IconClock } from '@tabler/icons-react';

export default function VerificationPending() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or if user is already verified or is a family member
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!user || user.userType !== 'authority') {
        router.push('/');
      } else if (user.isVerified) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Container size="md" py={40}>
      <Stack>
        <Title order={2} ta="center">Account Verification Pending</Title>
        
        <Paper withBorder p="xl" radius="md" mt="xl">
          <Center mb="md">
            <IconClock size={80} color="#228be6" stroke={1.5} />
          </Center>
          
          <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Verification in Progress">
            Your authority account is currently awaiting verification from our administrative team.
          </Alert>
          
          <Text mt="lg" ta="center">
            Thank you for registering as an authority. We need to verify your credentials before granting full access to the system.
          </Text>
          
          <Text mt="lg" ta="center">
            One of our existing verified authorities will review your information and approve your account. You will receive an email notification once your account has been verified.
          </Text>
          
          <Text mt="lg" c="dimmed" ta="center">
            This process typically takes 1-2 business days.
          </Text>
          
          <Stack mt="xl" align="center">
            <Button 
              onClick={handleLogout} 
              variant="outline"
              color="gray"
            >
              Sign Out
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 