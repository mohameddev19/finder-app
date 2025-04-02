import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

// List of routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/search',
  '/api/auth/login',
  '/api/auth/register',
];

// Routes that require authority level access
const authorityRoutes = [
  '/manage-prisoners',
  '/add-released',
  '/api/prisoners/manage',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes without authentication
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('finder_token')?.value;
  
  // If no token is provided, redirect to login
  if (!token) {
    return redirectToLogin(request);
  }

  // Verify token
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return redirectToLogin(request);
  }

  // Check authority access for restricted routes
  if (authorityRoutes.some(route => pathname.startsWith(route)) && decoded.userType !== 'authority') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // User is authenticated, continue
  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  // Add the original path as a query parameter to redirect after login
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/* (image files in public)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
}; 