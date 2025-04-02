import { NextResponse } from 'next/server';

export async function POST() {
  // Create response
  const response = NextResponse.json({
    message: 'Logged out successfully'
  });

  // Clear the auth cookie
  response.cookies.set({
    name: 'finder_token',
    value: '',
    expires: new Date(0), // Expire immediately
    path: '/',
  });

  return response;
} 