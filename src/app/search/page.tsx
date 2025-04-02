'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppShell';
import { Container, Title, TextInput, Button, Group, Select, Stack, Text, Card, Badge, Grid, Loader, Center, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

type PrisonerStatus = 'under_search' | 'found';

interface Prisoner {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  reasonForCapture?: string;
  locationOfDisappearance?: string;
  dateOfDisappearance?: string;
  status: PrisonerStatus;
  releasedDate?: string;
  releasedLocation?: string;
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<Prisoner[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState<Record<number, boolean>>({});

  const form = useForm({
    initialValues: {
      name: '',
      location: '',
      gender: '',
      status: '',
    },
  });

  // Mock data
  const mockPrisoners: Prisoner[] = [
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      gender: 'male',
      reasonForCapture: 'Political activism',
      locationOfDisappearance: 'Damascus',
      dateOfDisappearance: '2022-03-15',
      status: 'under_search',
    },
    {
      id: 2,
      name: 'Sarah Ahmed',
      age: 42,
      gender: 'female',
      reasonForCapture: 'Suspected journalist',
      locationOfDisappearance: 'Aleppo',
      dateOfDisappearance: '2021-11-20',
      status: 'found',
      releasedDate: '2023-05-10',
      releasedLocation: 'Northern border',
    },
    {
      id: 3,
      name: 'Ahmed Mahmoud',
      age: 28,
      gender: 'male',
      locationOfDisappearance: 'Homs',
      dateOfDisappearance: '2023-01-05',
      status: 'under_search',
    }
  ];

  const handleSubscribe = (prisonerId: number) => {
    setSubscribed(prev => ({
      ...prev,
      [prisonerId]: !prev[prisonerId]
    }));

    notifications.show({
      title: subscribed[prisonerId] ? 'Unsubscribed' : 'Subscribed',
      message: subscribed[prisonerId] 
        ? 'You will no longer receive notifications for this person' 
        : 'You will receive notifications if there are updates about this person',
      color: subscribed[prisonerId] ? 'yellow' : 'green',
    });
  };

  const handleSearch = async (values: typeof form.values) => {
    setLoading(true);
    try {
      // In a real application, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on search criteria
      const filteredResults = mockPrisoners.filter(prisoner => {
        if (values.name && !prisoner.name.toLowerCase().includes(values.name.toLowerCase())) {
          return false;
        }
        if (values.location && prisoner.locationOfDisappearance && 
            !prisoner.locationOfDisappearance.toLowerCase().includes(values.location.toLowerCase())) {
          return false;
        }
        if (values.gender && prisoner.gender !== values.gender) {
          return false;
        }
        if (values.status && prisoner.status !== values.status) {
          return false;
        }
        return true;
      });
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        notifications.show({
          title: 'No results found',
          message: 'Try adjusting your search criteria',
          color: 'yellow',
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      notifications.show({
        title: 'Error',
        message: 'There was a problem with your search',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Container size="lg">
        <Title order={1} ta="center" mt="xl" mb="md">
          Search for Missing Persons
        </Title>
        <Text c="dimmed" ta="center" mb="xl">
          Search for missing relatives or activate notifications for specific cases.
        </Text>

        <Card shadow="md" radius="md" p="xl" withBorder mb="xl">
          <form onSubmit={form.onSubmit(handleSearch)}>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Name"
                  placeholder="Enter full or partial name"
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Location"
                  placeholder="Place of disappearance"
                  {...form.getInputProps('location')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  clearable
                  data={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  {...form.getInputProps('gender')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Status"
                  placeholder="Select status"
                  clearable
                  data={[
                    { value: 'under_search', label: 'Under Search' },
                    { value: 'found', label: 'Found' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Group justify="flex-end" mt="md">
                  <Button type="submit" loading={loading}>
                    Search
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </form>
        </Card>

        {loading ? (
          <Center my="xl">
            <Loader size="lg" />
          </Center>
        ) : searchResults !== null && (
          <>
            <Title order={2} mb="md">Search Results ({searchResults.length})</Title>
            {searchResults.length > 0 ? (
              <Stack gap="md">
                {searchResults.map((prisoner) => (
                  <Card key={prisoner.id} shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Title order={3}>{prisoner.name}</Title>
                      <Badge color={prisoner.status === 'under_search' ? 'red' : 'green'}>
                        {prisoner.status === 'under_search' ? 'Under Search' : 'Found'}
                      </Badge>
                    </Group>
                    
                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        {prisoner.age && <Text><strong>Age:</strong> {prisoner.age}</Text>}
                        {prisoner.gender && <Text><strong>Gender:</strong> {prisoner.gender === 'male' ? 'Male' : prisoner.gender === 'female' ? 'Female' : 'Other'}</Text>}
                        {prisoner.locationOfDisappearance && <Text><strong>Location of Disappearance:</strong> {prisoner.locationOfDisappearance}</Text>}
                        {prisoner.dateOfDisappearance && <Text><strong>Date of Disappearance:</strong> {prisoner.dateOfDisappearance}</Text>}
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        {prisoner.reasonForCapture && <Text><strong>Reason for Capture:</strong> {prisoner.reasonForCapture}</Text>}
                        {prisoner.releasedDate && <Text><strong>Released Date:</strong> {prisoner.releasedDate}</Text>}
                        {prisoner.releasedLocation && <Text><strong>Released Location:</strong> {prisoner.releasedLocation}</Text>}
                      </Grid.Col>
                    </Grid>
                    
                    <Group mt="md">
                      <Checkbox
                        label="Notify me about updates"
                        checked={!!subscribed[prisoner.id]}
                        onChange={() => handleSubscribe(prisoner.id)}
                      />
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text ta="center" fz="lg" c="dimmed">No results found. Try different search criteria.</Text>
            )}
          </>
        )}
      </Container>
    </AppLayout>
  );
} 