import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the session_token cookie by setting it with an expired date
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire the cookie immediately
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return new NextResponse('Failed to logout', { status: 500 });
  }
}
