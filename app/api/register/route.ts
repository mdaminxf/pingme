import dbConnect from '@/lib/mongodb';
import User from '@/models/Users';
import * as bcrypt from 'bcrypt'; // ✅ Correct way to import bcrypt in TypeScript
import { NextResponse } from 'next/server';
import { json } from 'stream/consumers';

export async function POST(req: Request) {
  try {
    const { name, email, password, cpassword } = await req.json();

    // Check if passwords match
    if (password !== cpassword) {
      return NextResponse.json({ message: 'Password not matchs' }, {status:400});
      
    }

    // Connect to the database
    await dbConnect();

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return  NextResponse.json({ message: 'User Already Exist' },{status:400});
      
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    await User.create({
      name: name,
      email,
      password: hashedPassword,
    });

    return  NextResponse.json({ message: 'User created successful' },{status:201});
    
  } catch (error) {

    return NextResponse.json({ message: JSON.stringify(error) }, {status:500});
 
  }
}
