import { NextResponse } from 'next/server';
import { db } from '@/db/connect';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
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
      // Use generic error message for security (don't reveal if email exists)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response with the token in a cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: userWithoutPassword,
      token // Also return token in response for clients that need it directly
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'finder_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production', // Only use secure in production
      maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
} 