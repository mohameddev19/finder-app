'use client';

import { useEffect } from 'react';
import { TextInput, PasswordInput, Button, Group, Stack, Title, Text, Anchor, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AppLayout } from '@/components/AppShell';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Login() {
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password should be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await login(values.email, values.password);
  };

  return (
    <AppLayout>
      <Stack maw={400} mx="auto" mt={50}>
        <Title order={2} ta="center">Welcome back</Title>
        <Text c="dimmed" size="sm" ta="center">
          Don't have an account yet?{' '}
          <Anchor size="sm" component="button" onClick={() => router.push('/register')}>
            Create account
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
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />

            <Button type="submit" loading={isLoading} fullWidth mt="xl">
              Sign in
            </Button>
          </Stack>
        </form>
      </Stack>
    </AppLayout>
  );
} 