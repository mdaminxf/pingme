import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BiTrash, BiShare, BiMicrophone,BiRightArrow } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
interface Message {
  _id:string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  replyTo?: Message;
  conversationId:string
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Conversation {
  _id: string;  // Represents the ID of the user in the conversation
  name: string;
}

interface ChatProps {
  selectedUser: string;
  selectedUserName: string;
  currentUser: User | null;
  selectedConversation: Conversation;
}

const Chat: React.FC<ChatProps> = ({ selectedUser, selectedUserName, currentUser, selectedConversation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<{ [key: number]: number }>({});
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isClose, setIsClose] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const touchEndX = useRef<number | null>(null);  
  const touchStartX = useRef<number | null>(null);
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);

  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const MAX_SWIPE_DISTANCE = 100;

  const handleTouchMove = (e: React.TouchEvent, idx: number) => {
    if (touchStartX.current !== null) {
      let deltaX = e.touches[0].clientX - touchStartX.current;
  
      // Only allow swiping to the right
      if (deltaX > 0) {
        // Limit swipe distance
        deltaX = Math.min(deltaX, MAX_SWIPE_DISTANCE);
        setSwipeOffset((prev) => ({ ...prev, [idx]: deltaX }));
      }
    }
  };
  
  const SWIPE_REPLY_THRESHOLD = 60;

  const handleTouchEnd = (msg: Message, idx: number) => {
    if (swipeOffset[idx] >= SWIPE_REPLY_THRESHOLD) {
      setReplyTo(msg);
    }
  
    // Reset offset with animation
    setSwipeOffset((prev) => ({ ...prev, [idx]: 0 }));
    touchStartX.current = null;
  };
  const handleLongTouchStart = (msgId: string) => {
    longPressTimeout.current = setTimeout(() => {
      handleDeleteChat(msgId);
    }, 600); // 600ms = long press
  };
  
  const handleLongTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };
  
  
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?receiver=${selectedUser}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        // Parse reply text on load
        const parsed = data.map((msg: Message) => {
          const match = msg.content.match(/^<{\(`"'(.+?)'"`\)}> ?(.*)$/);
          if (match) {
            return {
              ...msg,
              replyTo: { content: match[1] } as Message,
              content: match[2],
            };
          }
          return msg;
        });
        
        setMessages(parsed);
      } catch (err) {
        console.error('Polling fetch failed:', err);
      }
    };
    
    
    fetchMessages(); // Initial load
    
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [selectedUser]);
  
  const sendMessage = async () => {
    setIsSending(true);
    setTimeout(() => setIsSending(false), 500);
    
    if (!newMessage.trim()) return;
    
    // Embed reply text inside message
    const replyText = replyTo?.content ? `<{(\`"'${replyTo.content}'"\`)}> ` : '';
    const combinedMessage = replyText + newMessage;
  
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver: selectedUser,
          content: combinedMessage,
        }),
      });
  
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
  
      // Parse for reply immediately (no wait for polling)
      const match = data.content.match(/^<{\(`"'(.+?)'"`\)}> ?(.*)$/);
      const parsed = match
      ? {
            ...data,
            replyTo: { content: match[1] } as Message,
            content: match[2],
          }
        : data;
  
      setMessages((prevMessages) => [...prevMessages, parsed]);
      setNewMessage('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  const handleDelete = async () => {
    try {
      // If you need to delete messages for multiple conversation IDs, join them with commas
      const conversationIds:string[] = messages.map(msg => msg.conversationId);
      conversationIds.forEach(con => {
        console.log(con);
      });
      // Pass only the first ID if you're working with multiple IDs
      const conversationIdToSend = conversationIds[0]; // Choose the first one
      
      
      // Make the PATCH request with the proper query parameters
      const res = await fetch(`/api/delete?conversationId=${encodeURIComponent(conversationIdToSend)}&otherUserId=${encodeURIComponent(selectedUser)}`, {
        method: 'PATCH',
      });
  
      if (!res.ok) {
        const data = await res.json();
        console.error('Error deleting messages:', data.error);
        return;
      }
  
      const result = await res.json();
      setMessages([]); // Clear messages after successful deletion
    } catch (err) {
      console.error('Network or server error:', err);
    }
  };
  
  // Function to highlight and scroll to the message being replied to
  const handleReplyClick = (msg: Message | null, index: number | null) => {
    if (msg) {
      // When clicking the reply button, set this message as the reply target
      setReplyTo(msg);
  
      // Optionally scroll to the original message being replied to for better UX
      if (index !== null) {
        const el = document.getElementById(`message-${index}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const handleDeleteChat = async (messageId: string) => {
    try {
      const res = await fetch(`/api/delete/chat?messageId=${messageId}`, {
        method: 'DELETE',
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete message');
      
      // Update UI after successful deletion
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };
  
  return (
<div className="flex flex-col h-screen bg-[#FF6B81] sm:p-1 sm:rounded-none lg:rounded-xl">
{/* Header */}
      <div className="flex items-center justify-between px-3 py-2 text-white">
        <div className="flex items-center gap-2 ">
          <div className="bg-white text-[#8A56AC] w-8 h-8 ml-9 lg:ml-0 md:ml-0 text-lg rounded-lg flex items-center justify-center">
            {selectedUserName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{selectedUserName}</h1>
          </div>
        </div>
        {/* <button onClick={()=>setIsClose(false)} className="bg-[#FF6B81] p-2 bg-white text-[#FF6B81] rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100">
          <BiTrash size={27} />
        </button> */}
      </div>

{/* Messages */}
<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 mt-1 shareDiv rounded-t-2xl min-h-0">
  {messages.map((msg, idx) => (
    <div
    key={idx}
    id={`message-${idx}`}
    className={`group flex items-center space-x-2 ${
      msg.sender === currentUser?._id ? 'justify-end ' : 'justify-start'
    } ${highlightedIndex === idx ? 'animate-pulse-fast' : ''}`}
    onTouchStart={(e) => {
      handleTouchStart(e, idx);
      if (msg.sender === currentUser?._id) handleLongTouchStart(msg._id);
    }}
    onTouchMove={(e) => handleTouchMove(e, idx)}
    onTouchEnd={() => {
      handleTouchEnd(msg, idx);
      handleLongTouchEnd();
    }}
    >
      <motion.div
        animate={{ x: swipeOffset[idx] || 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`max-w-[75%] sm:max-w-[60%] lg:max-w-[50%] shadow-md px-2 py-1 ${
          msg.sender === currentUser?._id
            ? 'bg-[#8A56AC]/60 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl'
            : 'bg-white text-[#333333] rounded-br-xl rounded-tl-xl rounded-tr-xl'
        }`}
      >
        {/* Show Replying message if the current message is a reply */}
        {msg.replyTo && (
          <div
            onClick={() => handleReplyClick(msg, idx)}
            className="cursor-pointer mb-2 p-2 bg-white/20 border-l-4 border-purple-400 rounded-lg hover:bg-white/30 backdrop-blur-md"
          >
            <p
              className={`text-xs font-medium ${
                msg.sender !== currentUser?._id ? 'text-gray-400' : 'text-gray-50'
              }`}
            >
              Replying to:
            </p>
            <p
              className={`text-sm italic ${
                msg.sender !== currentUser?._id ? 'text-gray-800' : 'text-white'
              } truncate`}
            >
              {msg.replyTo.content}
            </p>
          </div>
        )}

        {/* Message content */}
        <div className="relative bg-gray-600/0 left-0 bottom-0 p-1">
          <div>{msg.content}</div>
          <div className="text-xs text-gray-600 text-left">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          {/* Share & Delete icons (visible on hover) */}
          <div className="hidden group-hover:flex flex-col items-center space-y-1 text-gray-500">
            <button onClick={() => handleReplyClick(msg, idx)} title="Reply">
              <BiShare className="hover:text-purple-600 transition" size={20} />
            </button>
            {msg.sender === currentUser?._id && (
              <button onClick={() => handleDeleteChat(msg._id)} title="Delete">
                <BiTrash className="hover:text-red-500 transition" size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  ))}
  <div ref={messageEndRef} />
</div>


      {/* Reply Preview */}
 {/* Reply Preview */}
<AnimatePresence>
  {replyTo && (
    <motion.div
      key="reply-preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#FF6B81]/90 text-sm p-2 px-4 text-zinc-200 flex justify-between items-center"
    >
      <div>
        Replying to: <span className="font-semibold text-gray-50">{replyTo.content}</span>
      </div>
      <button onClick={() => setReplyTo(null)} className="text-zinc-100 font-bold text-2xl">
        ×
      </button>
    </motion.div>
  )}
</AnimatePresence>



      {/* Input */}
      <div className="sticky left-0 right-0 bottom-0 px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl">
  <div className="relative flex items-center">
    
    {/* Mic Button - Left */}
    <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
    <motion.button
  initial={{ opacity: 0, scale: 0.6 }}
  animate={{
    opacity: newMessage.trim() !== '' ? 1 : 0,
    scale: newMessage.trim() !== '' ? 1 : 0.6,
  }}
  transition={{ duration: 0.2 }}
  onClick={sendMessage}
  disabled={isSending || newMessage.trim() === ''}
  aria-label="Send message"
  className={`p-2 rounded-full shadow-md transition-all duration-200 
    ${newMessage.trim() !== '' ? 'bg-[#FF6B81] hover:bg-[#e75f74] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
    ${isSending ? 'animate-pulse' : ''}`}
>
  {isSending ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
  ) : (
    <BiRightArrow size={20} />
  )}
</motion.button>

    </div>

    {/* Input */}
    <input
      type="text"
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      className="w-full bg-[#f2f2f2] rounded-full py-3 pl-12 pr-12 text-sm text-[#333] placeholder-gray-500 focus:outline-none"
    />

    {/* Send Button - Right */}
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: newMessage.trim() !== '' ? 1 : 0, scale: newMessage.trim() !== '' ? 1 : 0.6 }}
        transition={{ duration: 0.2 }}
        onClick={sendMessage}
        className={`bg-[#FF6B81] p-2 rounded-full text-white shadow-md hover:bg-[#e75f74] transition-all duration-200 ${
          newMessage.trim() === '' && 'pointer-events-none'
        }`}
      >
        <BiRightArrow size={20} />
      </motion.button>
    </div>

  </div>
</div>
{!isClose && (
<motion.div 
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{opacity:10, scale:0}}
        animate={{opacity:90, scale:.9}}

      className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg text-zinc-800 dark:text-white mb-2 ">Delete
        <span className="relative inline-block text-white font-semibold ml-1">
  {selectedConversation?.name.toUpperCase()}
  <span className="absolute left-0 top-1/2 w-full h-[2px] bg-white translate-y-[-50%]"></span>
</span>
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">Are u realy want to delete selected conversation</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={()=>setIsClose(true)}
            className="px-4 py-2 text-sm font-medium text-zinc-800 bg-zinc-200 rounded hover:bg-zinc-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
)}
    </div>
  );
};

export default Chat;
