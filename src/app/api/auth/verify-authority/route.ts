import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { id, approve } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Authority ID is required' },
        { status: 400 }
      );
    }

    // Check if the user exists and is an authority
    const authority = await db.query.users.findFirst({
      where: (user) => eq(user.id, id)
    });

    if (!authority) {
      return NextResponse.json(
        { error: 'Authority not found' },
        { status: 404 }
      );
    }

    if (authority.userType !== 'authority') {
      return NextResponse.json(
        { error: 'User is not an authority' },
        { status: 400 }
      );
    }

    if (approve) {
      // Approve the authority
      await db.update(users)
        .set({ isVerified: true })
        .where(eq(users.id, id));
    } else {
      // Option 1: Reject by deleting the account
      await db.delete(users)
        .where(eq(users.id, id));
      
      // Option 2: Alternatively, you could mark it as rejected instead of deleting
      // await db.update(users)
      //   .set({ status: 'rejected' })
      //   .where(eq(users.id, id));
    }

    return NextResponse.json(
      { success: true, action: approve ? 'approved' : 'rejected' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying authority:', error);
    return NextResponse.json(
      { error: 'Failed to verify authority' },
      { status: 500 }
    );
  }
} 