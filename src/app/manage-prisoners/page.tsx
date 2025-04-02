'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppShell';
import { 
  Container, Title, Text, Card, Badge, Group, Table, Button, 
  Select, TextInput, Box, Modal, Stack, ActionIcon, Menu, Tooltip,
  Loader, Alert
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';

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
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const fetchPrisoners = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('name', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (typeFilter === 'regular') params.append('isRegular', 'true');
        if (typeFilter === 'special') params.append('isRegular', 'false');
        if (typeFilter === 'civilian') params.append('isCivilian', 'true');
        if (typeFilter === 'non-civilian') params.append('isCivilian', 'false');

        const response = await fetch(`/api/prisoners?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch prisoners (status ${response.status})`);
        }
        const data = await response.json();
        setPrisoners(data.prisoners || []);
      } catch (err) {
        console.error("Fetch prisoners error:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
        setPrisoners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrisoners();
  }, [searchTerm, statusFilter, typeFilter]);

  const handleViewDetails = (prisoner: Prisoner) => {
    setSelectedPrisoner(prisoner);
    open();
  };

  const handleMarkAsFound = async (id: number) => {
    try {
      const response = await fetch(`/api/prisoners/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'found' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      setPrisoners(prevPrisoners =>
        prevPrisoners.map(p => (p.id === id ? { ...p, status: 'found' } : p))
      );

      notifications.show({
        title: 'Status Updated',
        message: 'Prisoner marked as found successfully.',
        color: 'green',
      });
      
      if (selectedPrisoner?.id === id) {
        setSelectedPrisoner(prev => prev ? { ...prev, status: 'found' } : null);
      }
      
      close();

    } catch (err) {
      console.error("Update status error:", err);
      notifications.show({
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not mark prisoner as found.',
        color: 'red',
      });
    }
  };

  return (
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
          {isLoading && (
            <Group justify="center" py="xl">
              <Loader />
              <Text>Loading prisoners...</Text>
            </Group>
          )}

          {!isLoading && error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error Fetching Data" color="red" variant="light" my="xl">
              {error}
            </Alert>
          )}

          {!isLoading && !error && (
            <>
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
                  {prisoners.map((prisoner: Prisoner) => (
                    <Table.Tr key={prisoner.id}>
                      <Table.Td>{prisoner.name}</Table.Td>
                      <Table.Td>{prisoner.locationOfDisappearance || 'N/A'}</Table.Td>
                      <Table.Td>{prisoner.dateOfDisappearance ? new Date(prisoner.dateOfDisappearance).toLocaleDateString() : 'N/A'}</Table.Td>
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
              
              {!isLoading && !error && prisoners.length === 0 && (
                <Text ta="center" fz="lg" c="dimmed" py="xl">
                  No prisoners match the current filters or none have been added yet.
                </Text>
              )}
            </>
          )}
        </Box>
      </Card>

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
                <Stack gap="xs">
                  {selectedPrisoner.age && <Text><strong>Age:</strong> {selectedPrisoner.age}</Text>}
                  {selectedPrisoner.gender && <Text><strong>Gender:</strong> {selectedPrisoner.gender}</Text>}
                </Stack>
              </Card>
            </div>

            <div>
              <Text c="dimmed" size="sm">Disappearance Details</Text>
              <Card withBorder>
                <Stack gap="xs">
                  {selectedPrisoner.locationOfDisappearance && (
                    <Text><strong>Location:</strong> {selectedPrisoner.locationOfDisappearance}</Text>
                  )}
                  {selectedPrisoner.dateOfDisappearance && (
                    <Text><strong>Date:</strong> {new Date(selectedPrisoner.dateOfDisappearance).toLocaleDateString()}</Text>
                  )}
                  {selectedPrisoner.reasonForCapture && (
                    <Text><strong>Reason:</strong> {selectedPrisoner.reasonForCapture}</Text>
                  )}
                </Stack>
              </Card>
            </div>

            {selectedPrisoner.status === 'found' && (
              <div>
                <Text c="dimmed" size="sm">Release Information</Text>
                <Card withBorder>
                  <Stack gap="xs">
                    {selectedPrisoner.releasedDate && (
                      <Text><strong>Release Date:</strong> {new Date(selectedPrisoner.releasedDate).toLocaleDateString()}</Text>
                    )}
                    {selectedPrisoner.releasedLocation && (
                      <Text><strong>Release Location:</strong> {selectedPrisoner.releasedLocation}</Text>
                    )}
                  </Stack>
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
  );
} 