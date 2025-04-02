'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppShell';
import { 
  Container, Title, Text, Card, Badge, Group, Table, Button, 
  Select, TextInput, Box, Modal, Stack, ActionIcon, Menu, Tooltip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

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
  isRegular: boolean;
  isCivilian: boolean;
  releasedDate?: string;
  releasedLocation?: string;
}

export default function ManagePrisonersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

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
      isRegular: true,
      isCivilian: true,
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
      isRegular: false,
      isCivilian: true,
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
      isRegular: true,
      isCivilian: false,
    },
    {
      id: 4,
      name: 'Fatima Khalil',
      age: 31,
      gender: 'female',
      reasonForCapture: 'Unknown',
      locationOfDisappearance: 'Damascus',
      dateOfDisappearance: '2022-07-22',
      status: 'found',
      isRegular: true,
      isCivilian: true,
      releasedDate: '2023-08-15',
      releasedLocation: 'Damascus checkpoint',
    }
  ];

  const handleViewDetails = (prisoner: Prisoner) => {
    setSelectedPrisoner(prisoner);
    open();
  };

  const handleMarkAsFound = (id: number) => {
    // In a real application, this would update via an API call
    notifications.show({
      title: 'Status Updated',
      message: 'Prisoner marked as found',
      color: 'green',
    });
  };

  const filteredPrisoners = mockPrisoners.filter(prisoner => {
    // Filter by search term
    if (searchTerm && !prisoner.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter && prisoner.status !== statusFilter) {
      return false;
    }
    
    // Filter by type
    if (typeFilter === 'regular' && !prisoner.isRegular) {
      return false;
    }
    if (typeFilter === 'special' && prisoner.isRegular) {
      return false;
    }
    if (typeFilter === 'civilian' && !prisoner.isCivilian) {
      return false;
    }
    if (typeFilter === 'non-civilian' && prisoner.isCivilian) {
      return false;
    }
    
    return true;
  });

  return (
    <AppLayout>
      <Container size="lg">
        <Title order={1} ta="center" mt="xl" mb="md">
          Manage Prisoners
        </Title>
        <Text c="dimmed" ta="center" mb="xl">
          View, update, and manage prisoner records.
        </Text>

        <Card shadow="md" radius="md" p="xl" withBorder mb="xl">
          <Group justify="space-between" mb="md">
            <TextInput
              placeholder="Search by name"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              data={[
                { value: 'under_search', label: 'Under Search' },
                { value: 'found', label: 'Found' },
              ]}
              style={{ minWidth: 150 }}
            />
            <Select
              placeholder="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              clearable
              data={[
                { value: 'regular', label: 'Regular' },
                { value: 'special', label: 'Special' },
                { value: 'civilian', label: 'Civilian' },
                { value: 'non-civilian', label: 'Non-Civilian' },
              ]}
              style={{ minWidth: 150 }}
            />
            <Button component="a" href="/add-released">
              Add Released Prisoner
            </Button>
          </Group>

          <Box>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPrisoners.map((prisoner) => (
                  <Table.Tr key={prisoner.id}>
                    <Table.Td>{prisoner.name}</Table.Td>
                    <Table.Td>{prisoner.locationOfDisappearance}</Table.Td>
                    <Table.Td>{prisoner.dateOfDisappearance}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge color={prisoner.isRegular ? 'blue' : 'grape'} size="sm">
                          {prisoner.isRegular ? 'Regular' : 'Special'}
                        </Badge>
                        <Badge color={prisoner.isCivilian ? 'teal' : 'orange'} size="sm">
                          {prisoner.isCivilian ? 'Civilian' : 'Non-Civilian'}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={prisoner.status === 'under_search' ? 'red' : 'green'}>
                        {prisoner.status === 'under_search' ? 'Under Search' : 'Found'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button size="xs" variant="light" onClick={() => handleViewDetails(prisoner)}>
                          View
                        </Button>
                        {prisoner.status === 'under_search' && (
                          <Button size="xs" variant="outline" color="green" onClick={() => handleMarkAsFound(prisoner.id)}>
                            Mark as Found
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {filteredPrisoners.length === 0 && (
              <Text ta="center" fz="lg" c="dimmed" py="xl">
                No prisoners match the current filters.
              </Text>
            )}
          </Box>
        </Card>

        {/* Details Modal */}
        <Modal opened={opened} onClose={close} title={selectedPrisoner?.name} size="lg">
          {selectedPrisoner && (
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm">Status</Text>
                  <Badge size="lg" color={selectedPrisoner.status === 'under_search' ? 'red' : 'green'}>
                    {selectedPrisoner.status === 'under_search' ? 'Under Search' : 'Found'}
                  </Badge>
                </div>
                <div>
                  <Text c="dimmed" size="sm">Type</Text>
                  <Group gap="xs">
                    <Badge color={selectedPrisoner.isRegular ? 'blue' : 'grape'} size="md">
                      {selectedPrisoner.isRegular ? 'Regular' : 'Special'}
                    </Badge>
                    <Badge color={selectedPrisoner.isCivilian ? 'teal' : 'orange'} size="md">
                      {selectedPrisoner.isCivilian ? 'Civilian' : 'Non-Civilian'}
                    </Badge>
                  </Group>
                </div>
              </Group>

              <div>
                <Text c="dimmed" size="sm">Personal Information</Text>
                <Card withBorder>
                  <Group>
                    {selectedPrisoner.age && <Text><strong>Age:</strong> {selectedPrisoner.age}</Text>}
                    {selectedPrisoner.gender && <Text><strong>Gender:</strong> {selectedPrisoner.gender === 'male' ? 'Male' : selectedPrisoner.gender === 'female' ? 'Female' : 'Other'}</Text>}
                  </Group>
                </Card>
              </div>

              <div>
                <Text c="dimmed" size="sm">Disappearance Details</Text>
                <Card withBorder>
                  {selectedPrisoner.locationOfDisappearance && (
                    <Text><strong>Location:</strong> {selectedPrisoner.locationOfDisappearance}</Text>
                  )}
                  {selectedPrisoner.dateOfDisappearance && (
                    <Text><strong>Date:</strong> {selectedPrisoner.dateOfDisappearance}</Text>
                  )}
                  {selectedPrisoner.reasonForCapture && (
                    <Text><strong>Reason:</strong> {selectedPrisoner.reasonForCapture}</Text>
                  )}
                </Card>
              </div>

              {selectedPrisoner.status === 'found' && (
                <div>
                  <Text c="dimmed" size="sm">Release Information</Text>
                  <Card withBorder>
                    {selectedPrisoner.releasedDate && (
                      <Text><strong>Release Date:</strong> {selectedPrisoner.releasedDate}</Text>
                    )}
                    {selectedPrisoner.releasedLocation && (
                      <Text><strong>Release Location:</strong> {selectedPrisoner.releasedLocation}</Text>
                    )}
                  </Card>
                </div>
              )}

              <Group justify="flex-end">
                {selectedPrisoner.status === 'under_search' && (
                  <Button color="green" onClick={() => handleMarkAsFound(selectedPrisoner.id)}>
                    Mark as Found
                  </Button>
                )}
                <Button variant="outline" onClick={close}>Close</Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Container>
    </AppLayout>
  );
} 