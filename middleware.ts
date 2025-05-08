import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('session_token')?.value;

  // If no session token, redirect to /login
  if (!sessionToken && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ['/', '/dashboard/:path*'], // Update as needed
};
