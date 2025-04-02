'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Grid, Card, Text, RingProgress, Group, Stack, SimpleGrid, Center, Loader } from '@mantine/core';

type StatsData = {
  totalMissing: number;
  totalFound: number;
  byRegion: {
    name: string;
    count: number;
    percentage: number;
  }[];
  byMonth: {
    month: string;
    missing: number;
    found: number;
  }[];
};

export default function Statistics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch stats - replace with actual API call
    setTimeout(() => {
      const mockStats: StatsData = {
        totalMissing: 347,
        totalFound: 129,
        byRegion: [
          { name: 'Northern Region', count: 78, percentage: 16.4 },
          { name: 'Eastern Region', count: 112, percentage: 23.5 },
          { name: 'Western Region', count: 142, percentage: 29.8 },
          { name: 'Southern Region', count: 144, percentage: 30.3 },
        ],
        byMonth: [
          { month: 'Jan', missing: 32, found: 12 },
          { month: 'Feb', missing: 28, found: 15 },
          { month: 'Mar', missing: 41, found: 18 },
          { month: 'Apr', missing: 36, found: 14 },
          { month: 'May', missing: 29, found: 11 },
          { month: 'Jun', missing: 31, found: 13 },
        ]
      };
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Container>
      <Center h={400}>
        <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Title order={2} mb="xl">Statistics</Title>
        <Text>No statistical data available.</Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Title order={2} mb="xl">Missing Persons Statistics</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
        <Card withBorder shadow="sm" p="lg">
          <Group justify="space-between">
            <div>
              <Text fw={500} size="lg">Total Missing</Text>
              <Text size="xs" c="dimmed">Currently being searched for</Text>
            </div>
            <Text size="xl" fw={700} c="red">{stats.totalMissing}</Text>
          </Group>
        </Card>

        <Card withBorder shadow="sm" p="lg">
          <Group justify="space-between">
            <div>
              <Text fw={500} size="lg">Total Found</Text>
              <Text size="xs" c="dimmed">Successfully located</Text>
            </div>
            <Text size="xl" fw={700} c="teal">{stats.totalFound}</Text>
          </Group>
        </Card>
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" p="lg" h="100%">
            <Title order={3} mb="md">Missing Persons by Region</Title>
            <Stack gap="xs">
              {stats.byRegion.map((region) => (
                <Group key={region.name} justify="space-between" mb="xs">
                  <Text size="sm">{region.name}</Text>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>{region.count}</Text>
                    <Text size="xs" c="dimmed">({region.percentage}%)</Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" p="lg" h="100%">
            <Title order={3} mb="lg">Recovery Rate</Title>
            <Center>
              <RingProgress
                size={180}
                thickness={20}
                roundCaps
                sections={[
                  { value: (stats.totalFound / (stats.totalMissing + stats.totalFound)) * 100, color: 'teal' },
                ]}
                label={
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={700} size="xl">
                      {Math.round((stats.totalFound / (stats.totalMissing + stats.totalFound)) * 100)}%
                    </Text>
                    <Text size="xs" c="dimmed">Recovery rate</Text>
                  </div>
                }
              />
            </Center>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 