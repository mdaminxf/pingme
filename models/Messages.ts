import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
  conversationId: string;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  conversationId: { type: String, required: true }, // Optional: can also be ObjectId
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
