import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notificationSubscriptions, prisoners } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { JWTPayload } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Authentication
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('finder_token');
    const token = tokenCookie?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyToken(token) as JWTPayload | null;

    if (!payload || typeof payload !== 'object' || typeof payload.userId !== 'number') {
      return NextResponse.json({ error: 'Invalid or expired token payload' }, { status: 401 });
    }

    const userId = payload.userId;

    // 2. Fetch subscriptions joined with prisoner data
    const userSubscriptions = await db
      .select({
        id: notificationSubscriptions.id,
        prisonerId: notificationSubscriptions.prisonerId,
        isSubscribed: notificationSubscriptions.isActive,
        prisonerName: prisoners.name,
        status: prisoners.status,
        lastUpdated: prisoners.updatedAt, // Use prisoner's last update time
      })
      .from(notificationSubscriptions)
      .innerJoin(prisoners, eq(notificationSubscriptions.prisonerId, prisoners.id))
      .where(eq(notificationSubscriptions.userId, userId))
      .orderBy(desc(prisoners.updatedAt)); // Order by most recently updated prisoner

    // 3. Format and Return
    // The structure already closely matches the frontend's SearchEntry type
    return NextResponse.json({ searches: userSubscriptions });

  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
} 