import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/db';

export async function GET() {
  try {
    const result = await checkDatabaseConnection();
    
    if (result.connected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database connection successful',
        timestamp: result.timestamp
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection failed',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing database connection',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 