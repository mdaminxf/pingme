import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Messages';
import User from '@/models/Users'; // Assuming this is your User model
import Conversation from '@/models/Conversation'; // Import the Conversation model

// Handle GET request to retrieve users involved in conversations with the current user
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const currentUserId = req.cookies.get('session_token')?.value;
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    });

    const userIds = new Set();

    messages.forEach((msg) => {
      if (msg.sender?.toString() !== currentUserId) userIds.add(msg.sender?.toString());
      if (msg.receiver?.toString() !== currentUserId) userIds.add(msg.receiver?.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('_id name email');

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Handle DELETE request to remove a conversation


export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const currentUserId = req.cookies.get('session_token')?.value;
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the conversationId from query parameters
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Find the conversation where the current user is a participant
    const conversation = await Conversation.findOne({
      participants: currentUserId,  // Ensure the current user is part of the participants array
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    const participants = conversation.participants;

    // Delete the messages related to the conversation
    await Message.deleteMany({ conversationId });

    // Optionally, delete the conversation document
    await Conversation.deleteOne({ _id: conversationId });

    // Remove the conversation reference from users' list of conversations
    await User.updateMany(
      { _id: { $in: participants } },
      { $pull: { conversations: conversationId } }
    );

    return NextResponse.json({ success: 'Conversation deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}