'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Alert, 
  Button, 
  Stack, 
  Paper,
  Table,
  Group,
  Badge,
  Loader,
  Modal,
  Box,
  ActionIcon,
  Center
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { IconAlertCircle, IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

type PendingAuthority = {
  id: number;
  name: string;
  email: string;
  organization: string;
  position: string;
  details?: string;
  createdAt: string;
};

export default function AuthorityVerification() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pendingAuthorities, setPendingAuthorities] = useState<PendingAuthority[]>([]);
  const [isLoadingAuthorities, setIsLoadingAuthorities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuthority, setSelectedAuthority] = useState<PendingAuthority | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Redirect if not authenticated or if user is not a verified authority
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!user || user.userType !== 'authority' || !user.isVerified) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Fetch pending authorities
  useEffect(() => {
    const fetchPendingAuthorities = async () => {
      try {
        setIsLoadingAuthorities(true);
        const response = await fetch('/api/auth/pending-authorities');
        if (!response.ok) {
          throw new Error('Failed to fetch pending authorities');
        }
        const data = await response.json();
        setPendingAuthorities(data.pendingAuthorities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching pending authorities:', err);
      } finally {
        setIsLoadingAuthorities(false);
      }
    };

    if (isAuthenticated && user?.userType === 'authority' && user?.isVerified) {
      fetchPendingAuthorities();
    }
  }, [isAuthenticated, user]);

  const handleVerify = async (id: number, approve: boolean) => {
    try {
      const response = await fetch('/api/auth/verify-authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approve }),
      });

      if (!response.ok) {
        throw new Error('Failed to update authority status');
      }

      // Update the local state
      if (approve) {
        setPendingAuthorities(pendingAuthorities.filter(auth => auth.id !== id));
      } else {
        setPendingAuthorities(pendingAuthorities.filter(auth => auth.id !== id));
      }

      close(); // Close the modal if open
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating authority status:', err);
    }
  };

  const handleViewDetails = (authority: PendingAuthority) => {
    setSelectedAuthority(authority);
    open();
  };

  if (isLoading || !user) {
    return (
      <AppLayout>
        <Container size="md" py={40}>
          <Center>
            <Loader />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="lg" py={40}>
        <Stack>
          <Title order={2} ta="center">Authority Verification Management</Title>
          
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Paper withBorder p="xl" radius="md" mt="xl">
            <Title order={3} mb="md">Pending Authorities</Title>
            
            {isLoadingAuthorities ? (
              <Center>
                <Loader />
              </Center>
            ) : pendingAuthorities.length === 0 ? (
              <Text ta="center" c="dimmed">No pending authority verification requests.</Text>
            ) : (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Organization</Table.Th>
                    <Table.Th>Position</Table.Th>
                    <Table.Th>Registered</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pendingAuthorities.map((authority) => (
                    <Table.Tr key={authority.id}>
                      <Table.Td>{authority.name}</Table.Td>
                      <Table.Td>{authority.email}</Table.Td>
                      <Table.Td>{authority.organization}</Table.Td>
                      <Table.Td>{authority.position}</Table.Td>
                      <Table.Td>{new Date(authority.createdAt).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon 
                            variant="light" 
                            color="blue" 
                            onClick={() => handleViewDetails(authority)}
                            aria-label="View details"
                          >
                            <IconInfoCircle size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            variant="light" 
                            color="green" 
                            onClick={() => handleVerify(authority.id, true)}
                            aria-label="Approve"
                          >
                            <IconCheck size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            variant="light" 
                            color="red" 
                            onClick={() => handleVerify(authority.id, false)}
                            aria-label="Reject"
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Stack>
      </Container>

      <Modal 
        opened={opened} 
        onClose={close} 
        title="Authority Details"
        size="lg"
      >
        {selectedAuthority && (
          <Stack>
            <Box>
              <Text fw={500}>Name:</Text>
              <Text>{selectedAuthority.name}</Text>
            </Box>
            <Box>
              <Text fw={500}>Email:</Text>
              <Text>{selectedAuthority.email}</Text>
            </Box>
            <Box>
              <Text fw={500}>Organization:</Text>
              <Text>{selectedAuthority.organization}</Text>
            </Box>
            <Box>
              <Text fw={500}>Position:</Text>
              <Text>{selectedAuthority.position}</Text>
            </Box>
            {selectedAuthority.details && (
              <Box>
                <Text fw={500}>Additional Details:</Text>
                <Paper withBorder p="sm">
                  <Text>{selectedAuthority.details}</Text>
                </Paper>
              </Box>
            )}
            <Group grow mt="md">
              <Button color="green" onClick={() => handleVerify(selectedAuthority.id, true)}>
                Approve
              </Button>
              <Button color="red" onClick={() => handleVerify(selectedAuthority.id, false)}>
                Reject
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </AppLayout>
  );
} 