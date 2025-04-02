'use client';

import { Container, Title, Text, Button, Group, SimpleGrid, Card, rem, Stack } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: 'Search for Missing Persons',
      description: 'Search through our database to find information about missing persons.',
      action: () => router.push('/search'),
    },
    {
      title: 'Report a Missing Person',
      description: 'Register a missing person and provide details to help with the search.',
      action: () => router.push('/add-missing'),
    },
    {
      title: 'Get Notified',
      description: 'Set up notifications to be alerted when there is new information about a missing person.',
      action: () => router.push('/notifications'),
    },
    {
      title: 'View Statistics',
      description: 'Access statistics about missing and found persons.',
      action: () => router.push('/statistics'),
    },
  ];

  return (
    <Container size="lg">
      <Stack gap="xl" py={rem(50)}>
        <div style={{ textAlign: 'center', marginBottom: rem(40) }}>
          <Title order={1} size="h1" style={{ marginBottom: rem(16) }}>
            Help Find Missing Persons
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            A community platform to help reunite families with their missing loved ones who have been abducted and released.
          </Text>
          <Group justify="center" mt="xl">
            <Button size="lg" onClick={() => router.push('/search')}>
              Search Missing Persons
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/add-missing')}>
              Report Missing Person
            </Button>
          </Group>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          {features.map((feature, index) => (
            <Card key={index} shadow="md" padding="lg" radius="md" withBorder>
              <Title order={3} fw={700} mb="xs">
                {feature.title}
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                {feature.description}
              </Text>
              <Button variant="light" onClick={feature.action}>
                Learn More
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
