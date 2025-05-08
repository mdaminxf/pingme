import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Message from '@/models/Messages';
import Conversation from '@/models/Conversation';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await dbConnect();

  const sender = req.cookies.get('session_token')?.value;
  if (!sender) {
    console.error('Error: No session token found');
    return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
  }

  const body = await req.json();
  const { receiver, content } = body;

  // Log the values to debug
  console.log('Sender:', sender);
  console.log('Receiver:', receiver);
  console.log('Content:', content);
  try {

    const participants = [sender, receiver];

    let conversation = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });

    if (!conversation) {
      console.log('Creating new conversation');
      conversation = await Conversation.create({ participants });
    }

    const message = await Message.create({
      sender: sender,
      receiver: receiver,
      content,
      conversationId: conversation._id,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: 'Failed to save message', details: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const sender = req.cookies.get('session_token')?.value;
  const { searchParams } = new URL(req.url);
  const receiver = searchParams.get('receiver');

  if (!sender || !receiver) {
    return NextResponse.json({ error: 'Missing sender or receiver' }, { status: 400 });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
