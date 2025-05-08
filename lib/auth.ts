// lib/auth.ts
import { verify, Jwt} from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { Types } from 'mongoose';

interface CustomJwtPayload {
  _id: string; // or Types.ObjectId if you're sure of format
  email: string;
  name?:string
}

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}




export async function getSession(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    return { user: decoded };
  } catch (err) {
    console.error('Invalid token:', err);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
}


export async function verifyToken(req: Request): Promise<CustomJwtPayload> {
  const authHeader = req.headers.get('Authorization');


  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET) as CustomJwtPayload; 
    return decoded; // e.g., { userId, email, etc. }
  } catch (err) {
    throw new Error("Invalid token");
  }
}





