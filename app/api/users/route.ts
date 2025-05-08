import dbConnect from '@/lib/mongodb';
import User from '@/models/Users';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('search');

    // Example: get session token from cookies (Next.js edge API)
    const currentUserId = req.cookies.get('session_token')?.value;

    // Define filter object
    const filter: any = currentUserId
      ? { _id: { $ne: currentUserId } } // Exclude current user
      : {};

    if (searchTerm) {
      filter.$or = [
        { email: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const users = await User.find(filter);

    const safeUsers = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    }));

    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
