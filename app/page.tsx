'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chats';
import { BiChat, BiMenu, BiX } from 'react-icons/bi';
import { motion } from 'framer-motion';

interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: string | Date;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Conversation {
  _id: string;  // Represents the ID of the user in the conversation
  name: string;  // Display name of the user
  messages: Message[];  // List of messages exchanged in this conversation
}

const HomePage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await fetch('/api/me'); // Adjust to your API endpoint that returns the current user
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        console.error('Failed to fetch current user');
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch conversations
  useEffect(() => {
    fetch('/api/conversations')
      .then((res) => res.json())
      .then((data) => setConversations(data || []))
      .catch(console.error);
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users'); // Replace with correct API endpoint to get users
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // Handle user selection from sidebar
  const handleUserSelect = (user: User) => {
    // Check if the conversation with the selected user already exists
    const existingConversation = conversations.find((conv) => conv._id === user._id);
    
    if (existingConversation) {
      // If conversation exists, select it
      setSelectedConversation(existingConversation);
    } else {
      // If no conversation exists, create a new one and add it to the list
      const newConversation: Conversation = {
        _id: user._id,
        name: user.name,
        
        messages: [],  // New conversation, so no messages yet
      };
      // Update the state with the new conversation
      setConversations([...conversations, newConversation]);
      setSelectedConversation(newConversation);
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    console.log('Logging out...');
    // Implement logout functionality
  };

  return (
    <div className="flex h-screen bg-gray-100 text-zinc-700 relative">
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-[9px] left-1 z-20 text-rose-900/50 bg-white w-8 h-8 ml-2 py-[1px] rounded-full md:hidden shadow-md"
      >
        {sidebarOpen ? (
          <BiX size={20} />
        ) : (
          <motion.div
            key="chat-icon"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className='p-1'
          >
            <BiChat size={24} />
          </motion.div>
        )}
      </button>

      {/* Sidebar Component */}
      <Sidebar
        users={users}
        currentUser={currentUser}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onUserSelect={handleUserSelect}
        onLogout={handleLogout}
        conversations={conversations}
        setSelectedConversation={setSelectedConversation}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col w-screen overflow-y-auto lg:rounded-xl p-0 lg:p-2">
        {selectedConversation ? (
          <Chat
            selectedUser={selectedConversation._id}
            selectedUserName={selectedConversation.name}
            currentUser={currentUser}
            selectedConversation={selectedConversation}
          />
        ) : (
          <div className="text-center text-gray-500 text-lg mt-20">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
