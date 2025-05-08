import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  participants: {
    type: [String],
    required: true,
  },
});

    

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
