import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

// These should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type JWTPayload = {
  userId: number;
  email: string;
  name: string;
  userType: 'family' | 'authority';
};

export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

export function parseAuthHeader(header?: string): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  
  return header.substring(7); // Remove 'Bearer ' prefix
} 