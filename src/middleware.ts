import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// List of routes that don't require authentication
const publicRoutes = [
  '/',
  // '/login', // Removed from public check if user is logged in
  // '/register', // Removed from public check if user is logged in
  '/search',
  '/api/auth/login',
  '/api/auth/register',
];

// Auth paths where logged-in users should be redirected
const authPaths = ['/login', '/register', '/authority-verification', '/authority-register', '/verification-pending'];

// Routes that require authority level access
const authorityRoutes = [
  '/manage-prisoners',
  '/add-released',
  '/authority-verification',
  '/api/prisoners/manage',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('finder_token')?.value;

  // If user is logged in and trying to access auth paths, redirect to home
  if (token && authPaths.includes(pathname)) {
    const decoded = await verifyToken(token); // Await the verification
    if (decoded) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    // If token is invalid, let it proceed to potentially be caught later or handled by the page
  }

  // Allow specific public routes, static assets, and API auth routes without authentication
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') || // Allow images folder
    pathname.startsWith('/public') // Allow public folder
  ) {
    return NextResponse.next();
  }

  // If no token is provided for protected routes, redirect to login
  if (!token) {
    // Allow access to login/register explicitly if no token
    if (authPaths.includes(pathname)) {
        return NextResponse.next();
    }
    return redirectToLogin(request);
  }

  // Verify token for protected routes
  const decoded = await verifyToken(token); // Await the verification

  console.log("decoded", decoded)

  if (!decoded) {
     // If token is invalid, remove it and redirect to login
     const response = redirectToLogin(request);
     response.cookies.delete('finder_token');
     return response;
  }

  // Check authority access for restricted routes
  if (authorityRoutes.some(route => pathname.startsWith(route))) {
    if (decoded.userType !== 'authority') {
      return NextResponse.redirect(new URL('/', request.url)); // Redirect non-authorities from authority routes
    }
    // If authority user is not verified, redirect based on verification status (handle in specific components or API)
    // Example: if (!decoded.isVerified) return NextResponse.redirect(new URL('/verification-pending', request.url));
  }


  // User is authenticated, continue
  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  // Add the original path as a query parameter to redirect after login
  if (request.nextUrl.pathname !== '/') { // Avoid redirecting to home from home
    url.searchParams.set('redirect', request.nextUrl.pathname);
  }
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
     * - api/auth routes handled above
     * - public files (handled above)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)', // Adjusted matcher
  ],
}; 