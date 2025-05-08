import { NextRequest, NextResponse } from 'next/server';
import  dbConnect  from '@/lib/mongodb'; // Adjust this import based on your project structure
import { ObjectId } from 'mongodb';
import Messages from '@/models/Messages';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');

    if (!messageId || !ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid or missing messageId' }, { status: 400 });
    }

    const { db } = await dbConnect();

    const deletionResult = await Messages.deleteOne({ _id: new ObjectId(messageId) });

    if (deletionResult.deletedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
