import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, parseAuthHeader } from '@/lib/auth';
import { db } from '@/db/connect';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // Get token from cookie or Authorization header
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('finder_token');
    
    // Check for Authorization header if cookie not present
    const authHeader = request.headers.get('Authorization');
    const headerToken = parseAuthHeader(authHeader || '');
    
    const token = tokenCookie?.value || headerToken;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      isAuthenticated: true
    });
    
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
  }
} 