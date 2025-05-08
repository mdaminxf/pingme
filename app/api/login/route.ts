import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/Users';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// POST handler for login
export async function POST(request: Request) {
  try {
    await dbConnect();
    console.log('MongoDB connected');

    const body = await request.json();
    console.log('Request body:', body);

    const { email, password } = body;

    // Ensure password is available in the query
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Stored password hash:', user.password);

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Use the user _id as the session token
    const sessionToken = user._id.toString(); // Ensure you are awaiting the result here

    const response = NextResponse.json({ message: 'Login successful' });

    // Set the session token cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (err: any) {
    console.error('Login error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
