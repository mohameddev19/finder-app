import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/lib/auth';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if the user is verified
    if (!user.isVerified) {
      if (user.userType === 'authority') {
        return NextResponse.json({ error: 'Authority account not verified', code: 'AUTHORITY_NOT_VERIFIED' }, { status: 403 });
      }
      // Handle other unverified cases if necessary, though family should be auto-verified
      return NextResponse.json({ error: 'Account not verified' }, { status: 403 });
    }

    // Generate a new token if one doesn't exist (e.g., first login after verification)
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType
    });
    await db.update(users)
      .set({ token: token })
      .where(eq(users.id, user.id));

    // Prepare user data to return (excluding password and potentially token)
    const userResponseData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      isVerified: user.isVerified,
      organization: user.organization,
      position: user.position
    };
    
    const response = NextResponse.json({
      message: 'Login successful',
      user: userResponseData,
      token: token
    });
    
    // Set the token in cookies
    response.cookies.set('finder_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
} 