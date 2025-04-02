'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  TextInput, 
  Select, 
  Grid, 
  Button, 
  Group, 
  Stack,
  SimpleGrid,
  Text,
  Center,
  Loader
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { AppLayout } from '@/components/AppShell';
import { PrisonerCard } from '@/components/PrisonerCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type Prisoner = {
  id: number;
  name: string;
  age: number | null;
  gender: string | null;
  reasonForCapture: string | null;
  locationOfDisappearance: string | null;
  dateOfDisappearance: Date | null;
  status: 'under_search' | 'found';
  releasedDate: Date | null;
  releasedLocation: string | null;
};

export default function PrisonersPage() {
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Search filters
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrisoners();
    }
  }, [isAuthenticated]);

  const fetchPrisoners = async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (nameFilter) params.append('name', nameFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (locationFilter) params.append('location', locationFilter);

      const response = await fetch(`/api/prisoners?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prisoners');
      }

      const data = await response.json();
      setPrisoners(data.prisoners);

    } catch (err) {
      console.error('Error fetching prisoners:', err);
      setError('Failed to load prisoners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrisoners({ name: nameFilter, status: statusFilter, location: locationFilter });
  };

  const handleViewDetails = (id: number) => {
    router.push(`/prisoners/${id}`);
  };

  if (loading && prisoners.length === 0) {
    return (
      <AppLayout>
        <Container>
          <Center style={{ height: 'calc(100vh - 200px)' }}>
            <Loader size="xl" />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="lg">
        <Stack gap="lg">
          <Title order={1}>Prisoners Database</Title>
          
          <form onSubmit={handleSearch}>
            <Grid align="flex-end">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="Search by Name"
                  placeholder="Enter prisoner name"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Status"
                  placeholder="Select status"
                  data={[
                    { value: 'under_search', label: 'Under Search' },
                    { value: 'found', label: 'Found' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  clearable
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="Location"
                  placeholder="Search by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 12 }}>
                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    onClick={() => {
                      setNameFilter('');
                      setStatusFilter(null);
                      setLocationFilter('');
                    }}
                  >
                    Clear
                  </Button>
                  <Button type="submit" leftSection={<IconSearch size={16} />}>
                    Search
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </form>

          {error && (
            <Text c="red" ta="center">{error}</Text>
          )}
          
          {prisoners.length === 0 && !loading ? (
            <Text size="lg" ta="center" mt="xl">
              No prisoners found matching your criteria
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {prisoners.map(prisoner => (
                <PrisonerCard
                  key={prisoner.id}
                  {...prisoner}
                  onDetailsClick={handleViewDetails}
                />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </AppLayout>
  );
} 