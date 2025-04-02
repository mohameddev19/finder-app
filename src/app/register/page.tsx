'use client';

import { useEffect } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text, Anchor, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Register() {
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
      userType: 'family' as const,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password should be at least 6 characters'),
      phone: (value) => (!value || /^[0-9+\s-]{8,15}$/.test(value) ? null : 'Invalid phone number'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await register(values);
  };

  return (
    <Stack maw={400} mx="auto" mt={50}>
      <Title order={2} ta="center">Create a family account</Title>
      <Text c="dimmed" size="sm" ta="center">
          Already have an account?{' '}
          <Anchor size="sm" component="button" onClick={() => router.push('/login')}>
            Sign in
          </Anchor>
        </Text>
      
      <Text c="dimmed" size="sm" ta="center">
        Are you an authority?{' '}
        <Anchor size="sm" component="button" onClick={() => router.push('/authority-register')}>
          Register as authority
        </Anchor>
      </Text>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Your name"
            {...form.getInputProps('name')}
          />

          <TextInput
            withAsterisk
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Phone Number"
            placeholder="+1 123 456 7890"
            {...form.getInputProps('phone')}
          />

          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
          />

          <Button type="submit" loading={isLoading} fullWidth mt="xl">
            Create account
          </Button>
        </Stack>
      </form>
    </Stack>
  );
} 