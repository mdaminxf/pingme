import React from 'react';
import { BiTrash } from 'react-icons/bi';
import Chat from './Chats';

interface Props {
  conversationName: string;
  conversationId: string;
  onDelete: () => void;
}

const ChatWindow: React.FC<Props> = ({ conversationName, conversationId, onDelete }) => (
  <div className="flex-1 flex flex-col p-4 h-full overflow-y-auto md:ml-64">
    <div className="flex justify-between items-center border-b pb-2 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center font-bold">
          {conversationName.charAt(0)}
        </div>
        <span className="text-xl font-semibold">{conversationName}</span>
      </div>
      <button onClick={onDelete} className="text-red-600 hover:text-red-800 bg-red-100 p-2 rounded-full">
        <BiTrash size={20} />
      </button>
    </div>
    <Chat selectedUserName={conversationId} selectedUser={conversationId} />
  </div>
);

export default ChatWindow;
