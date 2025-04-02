import { NextResponse, type NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '@/lib/auth'; // Import the payload type
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Read token from the request cookies
    const tokenCookie = request.cookies.get('finder_token');
    const token = tokenCookie?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication token cookie missing' }, { status: 401 });
    }

    let decodedPayload: JWTPayload;
    try {
      // Use jsonwebtoken.verify here as API routes run in Node.js env
      decodedPayload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('API /me JWT Verification Error:', error);
      // If verification fails, consider instructing the browser to clear the invalid cookie
      const response = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      response.cookies.set('finder_token', '', { maxAge: -1, path: '/' }); // Clear the cookie
      return response;
    }

    // Fetch the latest user data from DB
    const user = await db.query.users.findFirst({
        where: eq(users.id, decodedPayload.userId),
        columns: { // Exclude sensitive data like password
            id: true,
            email: true,
            name: true,
            userType: true,
            isVerified: true,
            organization: true,
            position: true,
            phone: true, // Include if needed by frontend
            createdAt: true, // Include if needed
        }
    });

    if (!user) {
      // User associated with token no longer exists, clear cookie
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      response.cookies.set('finder_token', '', { maxAge: -1, path: '/' }); // Clear the cookie
      return response;
    }
    
    // Important: Check if the token matches the one stored in the DB (if applicable)
    // This helps invalidate sessions if a user logs out elsewhere or token is compromised
    // const storedToken = await db.query.users.findFirst({ columns: { token: true }, where: eq(users.id, user.id) });
    // if (storedToken?.token !== token) {
    //    return NextResponse.json({ error: 'Token mismatch or session invalidated' }, { status: 401 });
    // }


    // Return the user data (from DB preferably, or decoded payload as fallback)
    return NextResponse.json({ user: user });

  } catch (error) {
    console.error('API /me Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 