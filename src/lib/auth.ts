import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import * as jose from 'jose';

// These should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type JWTPayload = {
  userId: number;
  email: string;
  name: string;
  userType: 'family' | 'authority';
  iat?: number;
  exp?: number;
};

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // @ts-ignore
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify<JWTPayload>(token, secretKey);
    return payload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      console.error('JWT Expired:', error.message);
    } else if (error instanceof jose.errors.JOSEError) {
      console.error('JWT Verification Error (jose):', error.message);
    } else {
      console.error('Unknown JWT Verification Error:', error);
    }
    return null;
  }
}

export function parseAuthHeader(header?: string): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  
  return header.substring(7); // Remove 'Bearer ' prefix
} 