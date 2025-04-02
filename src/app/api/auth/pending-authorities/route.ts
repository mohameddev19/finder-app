import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // Check if the user is authenticated and is a verified authority
    // This would typically check the user's session
    
    // Fetch all authority users that are not verified
    const pendingAuthorities = await db.query.users.findMany({
      where: (user) => and(
        eq(user.userType, 'authority'), 
        eq(user.isVerified, false)
      ),
      orderBy: (user) => desc(user.createdAt),
    });

    return NextResponse.json({ 
      pendingAuthorities: pendingAuthorities.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        position: user.position,
        details: user.details,
        createdAt: user.createdAt
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending authorities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending authorities' },
      { status: 500 }
    );
  }
} 