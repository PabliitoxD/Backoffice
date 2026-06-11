import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath =
    path === '/login' ||
    path === '/signup' ||
    path === '/register' ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico') ||
    path.endsWith('.webp');

  const token = request.cookies.get('token')?.value;

  // Protect all other routes
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login/signup
  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/transactions', request.url)); // Default dashboard
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
