import dbConnect from "@/lib/mongodb";
import Message from "@/models/Messages";
import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();


  const { conversationId } = req.query;

  if (req.method === "GET") {
    try {
      const messages = await Message.find({ conversationId })
        .populate("sender", "username email")
        .sort({ createdAt: 1 });

      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages", error });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
