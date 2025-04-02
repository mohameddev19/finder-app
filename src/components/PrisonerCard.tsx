import React from 'react';
import { Card, Text, Group, Badge, Button, Stack, Box, Grid } from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';

type PrisonerProps = {
  id: number;
  name: string;
  age?: number | null;
  gender?: string | null;
  reasonForCapture?: string | null;
  locationOfDisappearance?: string | null;
  dateOfDisappearance?: Date | null;
  status: 'under_search' | 'found';
  releasedDate?: Date | null;
  releasedLocation?: string | null;
  onDetailsClick: (id: number) => void;
};

export function PrisonerCard({
  id,
  name,
  age,
  gender,
  reasonForCapture,
  locationOfDisappearance,
  dateOfDisappearance,
  status,
  releasedDate,
  releasedLocation,
  onDetailsClick,
}: PrisonerProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" mb="xs">
          <Text fw={700} size="lg">
            {name}
          </Text>
          <Badge 
            color={status === 'found' ? 'green' : 'red'} 
            variant="light"
          >
            {status === 'found' ? 'Found' : 'Under Search'}
          </Badge>
        </Group>

        <Grid>
          {age && (
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Age:</Text>
              <Text>{age}</Text>
            </Grid.Col>
          )}
          
          {gender && (
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Gender:</Text>
              <Text>{gender}</Text>
            </Grid.Col>
          )}
          
          {locationOfDisappearance && (
            <Grid.Col span={12}>
              <Text size="sm" c="dimmed">Location of Disappearance:</Text>
              <Text>{locationOfDisappearance}</Text>
            </Grid.Col>
          )}
          
          {dateOfDisappearance && (
            <Grid.Col span={12}>
              <Text size="sm" c="dimmed">Date of Disappearance:</Text>
              <Text>
                {new Date(dateOfDisappearance).toLocaleDateString()} 
                ({formatDistanceToNow(new Date(dateOfDisappearance), { addSuffix: true })})
              </Text>
            </Grid.Col>
          )}
        </Grid>

        {status === 'found' && (
          <Box>
            <Text fw={500} mt="sm">Release Information</Text>
            {releasedDate && (
              <Text size="sm">
                Released: {new Date(releasedDate).toLocaleDateString()}
              </Text>
            )}
            {releasedLocation && (
              <Text size="sm">Location: {releasedLocation}</Text>
            )}
          </Box>
        )}
        
        <Button variant="light" color="blue" mt="md" radius="md" onClick={() => onDetailsClick(id)}>
          View Full Details
        </Button>
      </Stack>
    </Card>
  );
} 