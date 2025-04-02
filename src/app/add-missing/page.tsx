'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppShell';
import { Container, Title, Paper, TextInput, Textarea, Button, Group, Select, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function AddMissingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      age: '',
      gender: '',
      reasonForCapture: '',
      locationOfDisappearance: '',
      dateOfDisappearance: null as Date | null,
      additionalInfo: '',
      contactPerson: '',
      contactPhone: '',
      relationship: '',
    },
    validate: {
      name: (value) => value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      age: (value) => {
        if (!value) return null;
        const age = parseInt(value);
        if (isNaN(age) || age <= 0 || age > 120) return 'Please enter a valid age';
        return null;
      },
      locationOfDisappearance: (value) => value.trim().length < 2 ? 'Location is required' : null,
      contactPerson: (value) => value.trim().length < 2 ? 'Contact person is required' : null,
      contactPhone: (value) => value.trim().length < 6 ? 'Valid contact phone is required' : null,
      relationship: (value) => value.trim().length < 2 ? 'Relationship is required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would submit to your API
      console.log('Submitting:', values);
      
      notifications.show({
        title: 'Missing person added',
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
          Register a Missing Person
        </Title>
        <Text c="dimmed" ta="center" mb="xl">
          Please provide as much information as possible to help in the search process.
        </Text>

        <Paper shadow="md" radius="md" p="xl" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Title order={3}>Personal Information</Title>
              <TextInput
                label="Full Name"
                placeholder="Enter the full name of the missing person"
                required
                {...form.getInputProps('name')}
              />
              
              <Group grow>
                <TextInput
                  label="Age"
                  placeholder="Age"
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
              
              <Title order={3} mt="lg">Disappearance Details</Title>
              
              <TextInput
                label="Location of Disappearance"
                placeholder="Where was the person last seen?"
                required
                {...form.getInputProps('locationOfDisappearance')}
              />
              
              <DatePickerInput
                label="Date of Disappearance"
                placeholder="When did the person disappear?"
                valueFormat="YYYY-MM-DD"
                clearable
                {...form.getInputProps('dateOfDisappearance')}
              />
              
              <Textarea
                label="Reason for Capture (if known)"
                placeholder="If you know why the person was taken, please provide details"
                autosize
                minRows={2}
                {...form.getInputProps('reasonForCapture')}
              />
              
              <Textarea
                label="Additional Information"
                placeholder="Any other details that might help in the search"
                autosize
                minRows={3}
                {...form.getInputProps('additionalInfo')}
              />
              
              <Title order={3} mt="lg">Contact Information</Title>
              
              <TextInput
                label="Main Contact Person"
                placeholder="Who should be contacted regarding this case?"
                required
                {...form.getInputProps('contactPerson')}
              />
              
              <TextInput
                label="Contact Phone Number"
                placeholder="Phone number"
                required
                {...form.getInputProps('contactPhone')}
              />
              
              <TextInput
                label="Relationship to Missing Person"
                placeholder="e.g., Parent, Sibling, Spouse, etc."
                required
                {...form.getInputProps('relationship')}
              />
              
              <Group justify="flex-end" mt="xl">
                <Button variant="outline" onClick={() => form.reset()}>
                  Clear Form
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Submit Information
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </AppLayout>
  );
} 