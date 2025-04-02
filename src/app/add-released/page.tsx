'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppShell';
import { Container, Title, Paper, TextInput, Textarea, Button, Group, Select, Stack, Text, Switch } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function AddReleasedPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      age: '',
      gender: '',
      releasedDate: null as Date | null,
      releasedLocation: '',
      releasedNotes: '',
      isRegular: true,
      isCivilian: true,
    },
    validate: {
      name: (value) => value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      age: (value) => {
        if (!value) return null;
        const age = parseInt(value);
        if (isNaN(age) || age <= 0 || age > 120) return 'Please enter a valid age';
        return null;
      },
      releasedLocation: (value) => value.trim().length < 2 ? 'Release location is required' : null,
      releasedDate: (value) => !value ? 'Release date is required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would submit to your API
      console.log('Submitting released prisoner:', values);
      
      notifications.show({
        title: 'Released prisoner added',
        message: 'The information has been submitted successfully',
        color: 'green',
      });
      
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      notifications.show({
        title: 'Error',
        message: 'There was a problem submitting the information',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Container size="md">
        <Title order={1} ta="center" mt="xl" mb="md">
          Add Released Prisoner
        </Title>
        <Text c="dimmed" ta="center" mb="xl">
          Add information about released prisoners to help families find their missing relatives.
        </Text>

        <Paper shadow="md" radius="md" p="xl" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Title order={3}>Personal Information</Title>
              <TextInput
                label="Full Name"
                placeholder="Enter the full name of the released prisoner"
                required
                {...form.getInputProps('name')}
              />
              
              <Group grow>
                <TextInput
                  label="Age"
                  placeholder="Age (if known)"
                  type="number"
                  {...form.getInputProps('age')}
                />
                
                <Select
                  label="Gender"
                  placeholder="Select gender"
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
                placeholder="When was the prisoner released?"
                valueFormat="YYYY-MM-DD"
                required
                {...form.getInputProps('releasedDate')}
              />
              
              <TextInput
                label="Location of Release"
                placeholder="Where was the prisoner released?"
                required
                {...form.getInputProps('releasedLocation')}
              />
              
              <Textarea
                label="Additional Notes"
                placeholder="Any other details about the release or the prisoner's condition"
                autosize
                minRows={3}
                {...form.getInputProps('releasedNotes')}
              />
              
              <Title order={3} mt="lg">Classification</Title>
              
              <Group>
                <Switch
                  label="Regular Prisoner"
                  checked={form.values.isRegular}
                  onChange={(event) => form.setFieldValue('isRegular', event.currentTarget.checked)}
                />
                
                <Switch
                  label="Civilian"
                  checked={form.values.isCivilian}
                  onChange={(event) => form.setFieldValue('isCivilian', event.currentTarget.checked)}
                />
              </Group>
              
              <Group justify="flex-end" mt="xl">
                <Button variant="outline" onClick={() => form.reset()}>
                  Clear Form
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Add Released Prisoner
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </AppLayout>
  );
} 