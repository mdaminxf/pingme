import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }  // <-- select: false is common
  });
  

  const User = mongoose.models.User || mongoose.model<Document>('User', userSchema);

export default User;
