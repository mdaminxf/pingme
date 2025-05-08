import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/Users';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Unauthorized: No session token found' },
        { status: 401 }
      );
    }

    // Use the token (user._id) to fetch the user
    const user = await User.findById(sessionToken).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return safe user info
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
