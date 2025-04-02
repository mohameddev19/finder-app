'use client';

import { useState } from 'react';
import { Container, Title, Paper, TextInput, Textarea, Button, Group, Select, Stack, Text, Switch } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
// Potentially add import { useAuth } from '@/hooks/useAuth'; if needed for auth context, though API handles token

export default function AddReleasedPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { user } = useAuth(); // Get user if needed for client-side checks

  const form = useForm({
    initialValues: {
      name: '',
      age: '', // Keep as string for input, parse on submit
      gender: '' as 'male' | 'female' | 'other' | '', // Type the gender
      releasedDate: null as Date | null,
      releasedLocation: '',
      releasedNotes: '',
      isRegular: true,
      isCivilian: true,
      status: 'found' as 'found' | 'under_search', // Add status to initial values
    },
    validate: {
      name: (value) => value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      age: (value) => {
        if (!value) return null; // Age is optional in schema
        const ageNum = parseInt(value);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) return 'Please enter a valid age (1-120)';
        return null;
      },
      gender: (value) => !value ? 'Gender is required' : null, // Make gender required? Check requirements
      releasedLocation: (value) => value.trim().length < 2 ? 'Release location is required' : null,
      releasedDate: (value) => !value ? 'Release date is required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      // Prepare data for the API
      const prisonerData = {
        ...values,
        age: values.age ? parseInt(values.age) : undefined, // Parse age string to number or undefined
        // status: 'found' as const, // Remove hardcoded status
        // Ensure date is in a format the backend expects (e.g., ISO string)
        releasedDate: values.releasedDate ? values.releasedDate.toISOString() : null,
        // Map form field name to schema field name if different
        // releasedNotes: values.releasedNotes, // Already matches
      };
      
      // Remove empty gender if it wasn't selected, or handle default in schema/backend
      if (!prisonerData.gender) {
          delete (prisonerData as any).gender;
      }

      const response = await fetch('/api/prisoners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prisonerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add prisoner (status ${response.status})`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      notifications.show({
        title: 'Released Prisoner Added',
        message: `Successfully added ${result.prisoner.name}.`,
        color: 'green',
      });

      form.reset();
    } catch (error) {
      console.error('Error submitting released prisoner:', error);
      notifications.show({
        title: 'Submission Error',
        message: error instanceof Error ? error.message : 'Could not add released prisoner. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md">
      <Title order={1} ta="center" mt="xl" mb="md">
      Add Released Prisoner
      </Title>
      <Text c="dimmed" ta="center" mb="xl">
        Record information about individuals released from detention.
      </Text>

      <Paper shadow="md" radius="md" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Title order={3}>Personal Information</Title>
            <TextInput
              label="Full Name"
              placeholder="Enter the full name of the released individual"
              required
              {...form.getInputProps('name')}
            />

            <Group grow>
              <TextInput
                label="Age at Release"
                placeholder="Age (optional)"
                type="number"
                {...form.getInputProps('age')}
              />

              <Select
                label="Gender"
                placeholder="Select gender"
                required // Make gender required in UI
                data={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                {...form.getInputProps('gender')}
              />
            </Group>

            <Title order={3} mt="lg">Release Details</Title>

            <DatePickerInput
              label="Date of Release"
              placeholder="When was the individual released?"
              valueFormat="YYYY-MM-DD"
              required
              {...form.getInputProps('releasedDate')}
            />

            <TextInput
              label="Location of Release"
              placeholder="Where was the individual released? (e.g., city, checkpoint)"
              required
              {...form.getInputProps('releasedLocation')}
            />

            <Textarea
              label="Additional Notes (Optional)"
              placeholder="Any other relevant details about the release, condition, destination, etc."
              autosize
              minRows={3}
              {...form.getInputProps('releasedNotes')}
            />

            <Title order={3} mt="lg">Classification (Internal Use)</Title>

            <Group>
              <Switch
                label="Regular Case" // Changed label for clarity
                checked={form.values.isRegular}
                onChange={(event) => form.setFieldValue('isRegular', event.currentTarget.checked)}
              />

              <Switch
                label="Civilian" // Standard label
                checked={form.values.isCivilian}
                onChange={(event) => form.setFieldValue('isCivilian', event.currentTarget.checked)}
              />
              <Switch
                label="Found Status"
                checked={form.values.status === 'found'}
                onChange={(event) => form.setFieldValue('status', event.currentTarget.checked ? 'found' : 'under_search')}
              />
            </Group>

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                Clear Form
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Submit Released Prisoner Info
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 