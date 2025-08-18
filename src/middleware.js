import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request) {
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HTTPS redirect in production
  if (process.env.NODE_ENV === 'production' && !request.headers.get('x-forwarded-proto')?.includes('https')) {
    return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`, 301);
  }

  // Protected routes
  const protectedPaths = ['/dashboard', '/tasks', '/notes', '/groups', '/settings', '/admin'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isProtectedPath) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // Admin-only routes
    if (request.nextUrl.pathname.startsWith('/admin') && session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/signin', '/signup'];
  const isAuthPath = authPaths.includes(request.nextUrl.pathname);
  
  if (isAuthPath) {
    const session = await auth();
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};