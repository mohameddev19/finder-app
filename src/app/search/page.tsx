'use client';

import { useState } from 'react';
import { Container, Title, TextInput, Button, Group, Stack, Text, Card, Badge, Grid, Loader, Center, Checkbox } from '@mantine/core';
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
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
    },
  });

  const handleSubscribe = async (prisonerId: number) => {
    try {
      const response = await fetch(`/api/subscriptions/${prisonerId}`, {
        method: subscribed[prisonerId] ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

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
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update subscription',
        color: 'red',
      });
    }
  };

  const handleSearch = async (values: typeof form.values) => {
    if (values.name.trim().length < 2) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search?name=${encodeURIComponent(values.name.trim())}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        notifications.show({
          title: 'No results found',
          message: 'Try a different name',
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
    <Container size="lg">
      <Title order={1} ta="center" mt="xl" mb="md">
        Search for Missing Persons
      </Title>
      <Text c="dimmed" ta="center" mb="xl">
        Search for missing relatives or activate notifications for specific cases.
      </Text>

      <Card shadow="md" radius="md" p="xl" withBorder mb="xl">
        <form onSubmit={form.onSubmit(handleSearch)}>
          <TextInput
            label="Name"
            placeholder="Enter full or partial name"
            {...form.getInputProps('name')}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loading}>
              Search
            </Button>
          </Group>
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
                      {prisoner.releasedDate && <Text><strong>Released Date:</strong> {prisoner.status === 'found' ? new Date(prisoner.releasedDate).toLocaleDateString() : 'Not released'}</Text>}
                      {prisoner.releasedLocation && <Text><strong>Released Location:</strong> {prisoner.status === 'found' ? prisoner.releasedLocation : 'Not released'}</Text>}
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
            <Text ta="center" fz="lg" c="dimmed">No results found. Try a different name.</Text>
          )}
        </>
      )}
    </Container>
  );
} 