import { NextResponse } from 'next/server';
import { db } from '@/db/connect';
import { prisoners } from '@/db/schema';
import { desc, eq, like, and, or } from 'drizzle-orm';
import { verifyToken, parseAuthHeader } from '@/lib/auth';
import { cookies } from 'next/headers';

// Get all prisoners with optional filtering
export async function GET(request: Request) {
  try {
    // Validate authentication
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('finder_token');
    const authHeader = request.headers.get('Authorization');
    const headerToken = parseAuthHeader(authHeader || '');
    const token = tokenCookie?.value || headerToken;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');
    const location = url.searchParams.get('location');
    
    // Build query conditions
    let conditions = [];
    
    if (name) {
      conditions.push(like(prisoners.name, `%${name}%`));
    }
    
    if (status) {
      conditions.push(eq(prisoners.status, status as any));
    }
    
    if (location) {
      conditions.push(like(prisoners.locationOfDisappearance, `%${location}%`));
    }
    
    // Get results based on conditions
    const prisonerResults = conditions.length > 0
      ? await db.query.prisoners.findMany({
          where: and(...conditions),
          orderBy: [desc(prisoners.createdAt)],
        })
      : await db.query.prisoners.findMany({
          orderBy: [desc(prisoners.createdAt)],
        });
    
    return NextResponse.json({ prisoners: prisonerResults });
    
  } catch (error) {
    console.error('Prisoners fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch prisoners' }, { status: 500 });
  }
}

// Create a new prisoner
export async function POST(request: Request) {
  try {
    // Validate authentication
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('finder_token');
    const authHeader = request.headers.get('Authorization');
    const headerToken = parseAuthHeader(authHeader || '');
    const token = tokenCookie?.value || headerToken;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Check if user has authority type or is a family member
    if (payload.userType !== 'authority') {
      // Family members can add prisoners but the entry needs approval
      // This is implemented later or handled client-side for now
    }

    const body = await request.json();
    
    // Add the user ID of the person adding the prisoner
    body.addedById = payload.userId;
    
    // Insert the new prisoner
    const newPrisoner = await db.insert(prisoners).values(body).returning();
    
    return NextResponse.json({ 
      message: 'Prisoner added successfully',
      prisoner: newPrisoner[0] 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Prisoner creation error:', error);
    return NextResponse.json({ error: 'Failed to add prisoner' }, { status: 500 });
  }
} 