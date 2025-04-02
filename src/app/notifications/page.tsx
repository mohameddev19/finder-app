'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Card, Text, Badge, Button, Group, Loader, Center } from '@mantine/core';
import { AppLayout } from '@/components/AppShell';

type Notification = {
  id: number;
  prisonerId: number;
  prisonerName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch notifications - replace with actual API call
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: 1,
          prisonerId: 101,
          prisonerName: 'Ahmed Hassan',
          message: 'New information has been added about Ahmed Hassan.',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          prisonerId: 102,
          prisonerName: 'Sara Ali',
          message: 'Sara Ali has been marked as found.',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          prisonerId: 103,
          prisonerName: 'Mohammed Ibrahim',
          message: 'A family member has added new contact information for Mohammed Ibrahim.',
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        }
      ];
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppLayout>
      <Container size="md">
        <Title order={2} mb="xl">Notifications</Title>

        {loading ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : notifications.length === 0 ? (
          <Card withBorder p="xl" ta="center">
            <Text c="dimmed">You have no notifications.</Text>
          </Card>
        ) : (
          <Stack gap="md">
            {notifications.map((notification) => (
              <Card key={notification.id} withBorder shadow="sm" p="md">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Text fw={500}>{notification.prisonerName}</Text>
                    {!notification.isRead && (
                      <Badge color="red">New</Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed">{formatDate(notification.createdAt)}</Text>
                </Group>
                
                <Text mb="md">{notification.message}</Text>
                
                <Group justify="space-between">
                  <Button 
                    variant="outline"
                    size="xs"
                    onClick={() => markAsRead(notification.id)}
                    disabled={notification.isRead}
                  >
                    {notification.isRead ? 'Read' : 'Mark as read'}
                  </Button>
                  
                  <Button 
                    variant="light"
                    size="xs"
                    component="a"
                    href={`/search/${notification.prisonerId}`}
                  >
                    View Details
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
} 