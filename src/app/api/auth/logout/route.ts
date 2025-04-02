import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Re-import cookies from next/headers
import { db } from '@/db'; // Adjust import path if needed
import { users } from '@/db/schema'; // Adjust import path if needed
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth'; // Adjust import path if needed

export async function POST(request: Request) {
  try {
    // Create the initial response for clearing the cookie
    const response = NextResponse.json({ message: 'Logout successful' });
    response.cookies.set('finder_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire the cookie immediately
      path: '/',
    });

    // Optionally: Clear the token from the database
    const cookieStore = await cookies(); // Use cookies() from next/headers
    const token = cookieStore.get('finder_token')?.value;

    if (token) {
      try {
        const decoded = await verifyToken(token) as { id: number } | null;
        if (decoded?.id) {
          await db.update(users)
            .set({ token: null })
            .where(eq(users.id, decoded.id));
        }
      } catch (dbError) {
        console.error("Failed to clear token from DB during logout:", dbError);
        // Don't fail the logout if DB update fails, just log the error
      }
    }

    return response;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'An error occurred during logout' }, { status: 500 });
  }
} 