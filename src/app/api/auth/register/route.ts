import { NextResponse } from 'next/server';
import { db } from '@/db/connect'; // Revert to original import
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm'; // Import eq from drizzle-orm

// Define validation schema using Zod
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional(), // Basic validation, could be stricter
  userType: z.enum(['family', 'authority'])
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }
    
    const { name, email, password, phone, userType } = validation.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const newUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      phone: phone ?? null, // Ensure phone is null if undefined
      userType,
    }).returning({ id: users.id, email: users.email, name: users.name, userType: users.userType });

    if (!newUser || newUser.length === 0) {
        throw new Error('Failed to create user.');
    }

    return NextResponse.json({ message: 'User registered successfully', user: newUser[0] }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    // Generic error for security
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
} 