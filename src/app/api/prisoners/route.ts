import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prisoners, users } from '@/db/schema';
import { desc, eq, like, and, or } from 'drizzle-orm';
import { verifyToken, parseAuthHeader, type JWTPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

// Get all prisoners with optional filtering
export async function GET(request: Request) {
  try {
    // Validate authentication
    const cookieStore = await cookies();
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
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('finder_token');
    const authHeader = request.headers.get('Authorization');
    const headerToken = parseAuthHeader(authHeader || '');
    const token = tokenCookie?.value || headerToken;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Await the token verification
    const payload = await verifyToken(token); 

    // Check if payload is valid and contains userId after awaiting
    if (!payload || typeof payload !== 'object' || typeof payload.userId !== 'number') {
        return NextResponse.json({ error: 'Invalid or expired token payload' }, { status: 401 });
    }

    // Authorization check (optional)
    // if (payload.userType !== 'authority') { ... }

    const body = await request.json();

    // Prepare data for insertion
    let parsedAge: number | null = null;
    if (body.age) {
        const ageNum = parseInt(body.age);
        if (!isNaN(ageNum) && ageNum > 0 && ageNum <= 120) {
            parsedAge = ageNum;
        }
    }

    const insertData: Partial<typeof prisoners.$inferInsert> = {
        ...body,
        addedById: payload.userId, // Safe access after await and check
        releasedDate: body.releasedDate ? new Date(body.releasedDate) : null,
        dateOfDisappearance: body.dateOfDisappearance ? new Date(body.dateOfDisappearance) : null,
        age: parsedAge, 
        status: body.status === 'found' ? 'found' : 'under_search',
    };

    // Remove optional fields if they are empty strings (database schema should handle nulls)
    // This keeps the logic cleaner than setting everything explicitly to null
    if (!insertData.gender) delete insertData.gender;
    if (insertData.age === null) delete insertData.age; // Remove if age ended up null
    if (!insertData.reasonForCapture) delete insertData.reasonForCapture;
    if (!insertData.locationOfDisappearance) delete insertData.locationOfDisappearance;
    if (!insertData.dateOfDisappearance) delete insertData.dateOfDisappearance;
    if (!insertData.additionalInfo) delete insertData.additionalInfo;
    if (!insertData.contactPerson) delete insertData.contactPerson;
    if (!insertData.contactPhone) delete insertData.contactPhone;
    if (!insertData.releasedLocation) delete insertData.releasedLocation;
    if (!insertData.releasedNotes) delete insertData.releasedNotes;

    // Basic validation for required fields
    if (!insertData.name) {
        return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }
     if (!insertData.status) {
        // This case shouldn't happen due to default above, but good practice
        return NextResponse.json({ error: 'Missing required field: status' }, { status: 400 });
    }
    // Add validation for other required fields if necessary


    // Insert the new prisoner
    const newPrisoner = await db.insert(prisoners)
        .values(insertData as typeof prisoners.$inferInsert) 
        .returning();

    if (!newPrisoner || newPrisoner.length === 0) {
        throw new Error("Failed to insert prisoner into database.");
    }

    return NextResponse.json({ 
      message: 'Prisoner added successfully',
      prisoner: newPrisoner[0] 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Prisoner creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add prisoner';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 