import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import mongoose from 'mongoose';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Extract parameters from the URL
    const conversationIdParam = searchParams.get('conversationId');
    const otherUserId = searchParams.get('otherUserId');

    // Check if conversationId is a valid object ID
    const conversationId = conversationIdParam
      ? new mongoose.Types.ObjectId(conversationIdParam)
      : null;

    if (!conversationId || !otherUserId) {
      return NextResponse.json({ error: 'Missing conversationId or otherUserId' }, { status: 400 });
    }

    const currentUserId = req.cookies.get('session_token')?.value;

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the conversation with both users
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or user is not part of it' }, { status: 404 });
    }

    // Remove all messages in the conversation
    conversation.messages = [];

    // Save updated conversation
    await conversation.save();

    return NextResponse.json({
      message: 'All messages removed from the conversation',
      conversation,
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Server error', details: err }, { status: 500 });
  }
}

