import mongoose from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

const ConversationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: uuidv4, // Automatically assigns a UUID
  },
  participants: {
    type: [String],
    required: true,
  },
}, { timestamps: true });


export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
