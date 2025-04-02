import { NextResponse } from 'next/server';
import { db } from '@/db'; // Revert to original import
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm'; // Import eq from drizzle-orm
import { generateToken } from '@/lib/auth'; // Import token generation utility
import { cookies } from 'next/headers'; // Import cookies

// Define validation schema using Zod
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional(), // Basic validation, could be stricter
  userType: z.enum(['family', 'authority']),
  organization: z.string().optional(),
  position: z.string().optional(),
  details: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }
    
    const { name, email, password, phone, userType, organization, position, details } = validation.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set isVerified based on userType (family is auto-verified, authority needs verification)
    const isVerified = userType === 'family';

    // Insert new user into the database
    const insertedUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      phone: phone ?? null, // Ensure phone is null if undefined
      userType,
      isVerified,
      organization: organization ?? null,
      position: position ?? null,
      details: details ?? null,
    }).returning({ 
      id: users.id,
      userType: users.userType,
      isVerified: users.isVerified,
      email: users.email,
      name: users.name,
      organization: users.organization,
      position: users.position
    });

    if (!insertedUser || insertedUser.length === 0) {
      throw new Error('Failed to create user.');
    }

    const newUser = insertedUser[0];
    let token = null;
    const response = NextResponse.json({ 
      message: 'User registered successfully', 
      user: newUser,
      token: null // Initially null
    }, { status: 201 });

    if (newUser.isVerified) { // Only generate token if verified (family accounts or verified authorities)
      token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        userType: newUser.userType
      });
      
      // Update the user record with the generated token
      await db.update(users)
        .set({ token: token })
        .where(eq(users.id, newUser.id));

      // Set the token in cookies via response headers
      response.cookies.set('finder_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      // Update the response body to include the token
      response.headers.set('Content-Type', 'application/json'); // Ensure correct content type
      const updatedBody = { 
        message: 'User registered successfully', 
        user: newUser,
        token: token // Include the generated token
      };
      // Re-create the response with the updated body and existing headers/status
      return new NextResponse(JSON.stringify(updatedBody), {
        status: response.status,
        headers: response.headers,
      });
    }

    return response; // Return the initial response if user is not verified

  } catch (error) {
    console.error('Registration Error:', error);
    // Generic error for security
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
} 