import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notificationSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { JWTPayload } from '@/lib/auth';

// Helper function for ownership check (token verification happens in handlers)
async function checkSubscriptionOwnership(userId: number, subscriptionId: number): Promise<{ subscription?: typeof notificationSubscriptions.$inferSelect, errorResponse?: NextResponse }> {
    const subscription = await db.query.notificationSubscriptions.findFirst({
        where: eq(notificationSubscriptions.id, subscriptionId)
    });

    if (!subscription) {
        return { errorResponse: NextResponse.json({ error: 'Subscription not found' }, { status: 404 }) };
    }

    if (subscription.userId !== userId) {
        return { errorResponse: NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 }) };
    }

    return { subscription };
}

// PATCH - Toggle subscription status (isActive)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscriptionId = parseInt(params.id);
    if (isNaN(subscriptionId)) {
        return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 });
    }

    // 1. Authenticate
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('finder_token');
    const token = tokenCookie?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);
    if (!payload || typeof payload !== 'object' || typeof payload.userId !== 'number') {
      return NextResponse.json({ error: 'Invalid or expired token payload' }, { status: 401 });
    }
    
    const userId = payload.userId;

    // 2. Authorize (Check Ownership)
    const { errorResponse, subscription } = await checkSubscriptionOwnership(userId, subscriptionId);
    if (errorResponse) return errorResponse;
    if (!subscription) { 
         return NextResponse.json({ error: 'Subscription not found after ownership check' }, { status: 404 });
    }

    // 3. Perform Action
    const newStatus = !subscription.isActive;
    await db.update(notificationSubscriptions)
      .set({ isActive: newStatus })
      .where(eq(notificationSubscriptions.id, subscriptionId));

    return NextResponse.json({ message: 'Subscription status updated', isActive: newStatus });

  } catch (error) {
    console.error('Failed to update subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

// DELETE - Remove a subscription
export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = parseInt(params.id);
    if (isNaN(subscriptionId)) {
        return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 });
    }

    // 1. Authenticate (same as PATCH)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('finder_token');
    const token = tokenCookie?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);
    if (!payload || typeof payload !== 'object' || typeof payload.userId !== 'number') {
      return NextResponse.json({ error: 'Invalid or expired token payload' }, { status: 401 });
    }
    
    const userId = payload.userId;

    // 2. Authorize (Check Ownership)
    const { errorResponse } = await checkSubscriptionOwnership(userId, subscriptionId);
    if (errorResponse) return errorResponse;

    // 3. Perform Action
    await db.delete(notificationSubscriptions)
      .where(eq(notificationSubscriptions.id, subscriptionId));

    return NextResponse.json({ message: 'Subscription removed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
} 