'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Card, Text, Badge, Button, Group, Loader, Center, Alert } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSearches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/subscriptions');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch searches (status ${response.status})`);
        }
        const data = await response.json();
        setSearches(data.searches || []);
      } catch (err) {
        console.error("Fetch searches error:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setSearches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearches();
  }, []);

  const removeSearch = async (subscriptionId: number) => {
    setSearches(prev => prev.filter(search => search.id !== subscriptionId));

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove subscription');
      }

      notifications.show({
        title: 'Subscription Removed',
        message: 'Successfully removed the search subscription.',
        color: 'green',
      });

    } catch (err) {
      console.error("Remove search error:", err);
      notifications.show({
        title: 'Error Removing Subscription',
        message: err instanceof Error ? err.message : 'Could not remove subscription.',
        color: 'red',
      });
    }
  };

  const toggleSubscription = async (subscriptionId: number) => {
    const originalSearches = [...searches];
    let newStatus = false;

    setSearches(prev =>
      prev.map(search => {
        if (search.id === subscriptionId) {
          newStatus = !search.isSubscribed;
          return { ...search, isSubscribed: newStatus };
        }
        return search;
      })
    );

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSearches(originalSearches);
        throw new Error(errorData.error || 'Failed to update subscription status');
      }

      const result = await response.json();
      
      if (result.isActive !== newStatus) {
        console.warn("Optimistic update mismatch, correcting UI.");
        setSearches(prev => prev.map(s => s.id === subscriptionId ? { ...s, isSubscribed: result.isActive } : s));
      }

      notifications.show({
        title: 'Subscription Updated',
        message: `Successfully ${newStatus ? 'subscribed to' : 'unsubscribed from'} updates.`,
        color: 'blue',
      });

    } catch (err) {
      console.error("Toggle subscription error:", err);
      setSearches(originalSearches);
      notifications.show({
        title: 'Error Updating Subscription',
        message: err instanceof Error ? err.message : 'Could not update subscription status.',
        color: 'red',
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Container>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Title order={2} mb="xl" mt="lg">My Search Subscriptions</Title>

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)} mb="lg">
          {error}
        </Alert>
      )}

      {searches.length === 0 && !error ? (
        <Card withBorder p="xl" ta="center">
          <Text c="dimmed" mb="lg">You are not subscribed to updates for any missing persons.</Text>
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
                  color={search.isSubscribed ? "blue" : "gray"}
                >
                  {search.isSubscribed ? 'Subscribed' : 'Unsubscribed'} (Toggle)
                </Button>
                
                <Group gap="xs">
                  <Button 
                    variant="subtle" 
                    color="red"
                    size="xs"
                    onClick={() => removeSearch(search.id)}
                  >
                    Remove Subscription
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
} 