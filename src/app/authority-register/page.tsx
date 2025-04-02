'use client';

import { useEffect } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text, Anchor, Alert, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AppLayout } from '@/components/AppShell';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IconAlertCircle } from '@tabler/icons-react';

export default function AuthorityRegister() {
  const { register, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      userType: 'authority' as const,
      organization: '',
      position: '',
      details: ''
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password should be at least 6 characters'),
      phone: (value) => (!value || /^[0-9+\s-]{8,15}$/.test(value) ? null : 'Invalid phone number'),
      organization: (value) => (value.trim().length > 0 ? null : 'Organization is required'),
      position: (value) => (value.trim().length > 0 ? null : 'Position is required'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await register(values);
  };

  return (
    <AppLayout>
      <Stack maw={500} mx="auto" mt={50}>
        <Title order={2} ta="center">Register as an Authority</Title>
        <Text c="dimmed" size="sm" ta="center">
          Already have an account?{' '}
          <Anchor size="sm" component="button" onClick={() => router.push('/login')}>
            Sign in
          </Anchor>
        </Text>
        
        <Text c="dimmed" size="sm" ta="center">
          Are you a family member?{' '}
          <Anchor size="sm" component="button" onClick={() => router.push('/register')}>
            Register as family member
          </Anchor>
        </Text>

        <Alert color="blue" title="Account Verification Required">
          Authority accounts require verification before full access is granted. You will be notified once your account has been verified by an administrator.
        </Alert>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              withAsterisk
              label="Full Name"
              placeholder="Your full name"
              {...form.getInputProps('name')}
            />

            <TextInput
              withAsterisk
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps('email')}
            />

            <TextInput
              withAsterisk
              label="Phone Number"
              placeholder="+1 123 456 7890"
              {...form.getInputProps('phone')}
            />

            <TextInput
              withAsterisk
              label="Organization"
              placeholder="Your organization name"
              {...form.getInputProps('organization')}
            />

            <TextInput
              withAsterisk
              label="Position"
              placeholder="Your position or role"
              {...form.getInputProps('position')}
            />

            <Textarea
              label="Additional Details"
              placeholder="Please provide any additional information that may help us verify your authority status"
              minRows={3}
              {...form.getInputProps('details')}
            />

            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />

            <Button type="submit" loading={isLoading} fullWidth mt="xl">
              Register as Authority
            </Button>
          </Stack>
        </form>
      </Stack>
    </AppLayout>
  );
} 