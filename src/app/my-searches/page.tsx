'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Card, Text, Badge, Button, Group, Loader, Center, Tabs } from '@mantine/core';
import { AppLayout } from '@/components/AppShell';
import { useRouter } from 'next/navigation';

type SearchEntry = {
  id: number;
  prisonerId: number;
  prisonerName: string;
  status: 'under_search' | 'found';
  lastUpdated: string;
  isSubscribed: boolean;
};

export default function MySearches() {
  const [searches, setSearches] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock fetch searches - replace with actual API call
    setTimeout(() => {
      const mockSearches: SearchEntry[] = [
        {
          id: 1,
          prisonerId: 101,
          prisonerName: 'Ahmed Hassan',
          status: 'under_search',
          lastUpdated: new Date(Date.now() - 3600000).toISOString(),
          isSubscribed: true,
        },
        {
          id: 2,
          prisonerId: 102,
          prisonerName: 'Sara Ali',
          status: 'found',
          lastUpdated: new Date(Date.now() - 86400000).toISOString(),
          isSubscribed: true,
        },
        {
          id: 3,
          prisonerId: 103,
          prisonerName: 'Mohammed Ibrahim',
          status: 'under_search',
          lastUpdated: new Date(Date.now() - 172800000).toISOString(),
          isSubscribed: false,
        }
      ];
      setSearches(mockSearches);
      setLoading(false);
    }, 1000);
  }, []);

  const removeSearch = (id: number) => {
    setSearches(prev => prev.filter(search => search.id !== id));
  };

  const toggleSubscription = (id: number) => {
    setSearches(prev => 
      prev.map(search => 
        search.id === id ? { ...search, isSubscribed: !search.isSubscribed } : search
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <AppLayout>
        <Container>
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="md">
        <Title order={2} mb="xl">My Searches</Title>

        {searches.length === 0 ? (
          <Card withBorder p="xl" ta="center">
            <Text c="dimmed" mb="lg">You have no saved searches.</Text>
            <Button onClick={() => router.push('/search')}>
              Search for Missing Persons
            </Button>
          </Card>
        ) : (
          <Stack gap="md">
            {searches.map((search) => (
              <Card key={search.id} withBorder shadow="sm" p="md">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Text fw={500}>{search.prisonerName}</Text>
                    <Badge color={search.status === 'found' ? 'teal' : 'red'}>
                      {search.status === 'found' ? 'Found' : 'Missing'}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed">Last updated: {formatDate(search.lastUpdated)}</Text>
                </Group>
                
                <Group justify="space-between" mt="md">
                  <Button 
                    variant={search.isSubscribed ? "filled" : "outline"}
                    size="xs"
                    onClick={() => toggleSubscription(search.id)}
                  >
                    {search.isSubscribed ? 'Subscribed to Updates' : 'Subscribe to Updates'}
                  </Button>
                  
                  <Group gap="xs">
                    <Button 
                      variant="subtle" 
                      color="blue"
                      size="xs"
                      onClick={() => router.push(`/search/${search.prisonerId}`)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="subtle" 
                      color="red"
                      size="xs"
                      onClick={() => removeSearch(search.id)}
                    >
                      Remove
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
} 