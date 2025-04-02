import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, ilike } from 'drizzle-orm';
import { prisoners } from '@/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const results = await db.query.prisoners.findMany({
      where: ilike(prisoners.name, `%${name}%`),
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 