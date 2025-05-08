import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BiSearch, BiX } from 'react-icons/bi';
import UserListItem from './UserListItem';
import UserAvatar from './userAvatar';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface SidebarProps {
  users: User[];
  currentUser: User | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUserSelect: (user: User) => void;
  onLogout: () => void;
  conversations: { _id: string; name: string }[];  // List of conversations
  setSelectedConversation: React.Dispatch<React.SetStateAction<any>>;  // Function to set selected conversation
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  currentUser,
  isOpen,
  setIsOpen,
  onUserSelect,
  onLogout,
  conversations,
  setSelectedConversation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.trim()) {
        try {
          const res = await fetch(`/api/users?search=${searchTerm}`);
          const data = await res.json();
          setFilteredUsers(data);
        } catch (error) {
          console.error('Error fetching filtered users:', error);
          setFilteredUsers([]);
        }
      } else {
        setFilteredUsers([]);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  const showSearchResults = isSearching && searchTerm.trim().length > 0;

  const sidebarContent = (
<div className="h-screen flex flex-col bg-purple-200 p-1 ">
{/* Top Section */}
      <div className="flex items-center gap-3 px-4 py-4 text-zinc-700 relative">
        <UserAvatar name={currentUser?.name || 'U'} />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{currentUser?.name}</span>
          <span className="text-xs text-zinc-500">{currentUser?.email}</span>
        </div>
      
      </div>

      {/* Main White Section */}
        {/* Search or Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
          <AnimatePresence mode="wait">
            {!isSearching ? (
              <motion.div
                key="header"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex justify-between items-center"
              >
                <h2 className="text-base font-semibold text-[#333]">Users</h2>
                <button
                  onClick={() => setIsSearching(true)}
                  className="bg-[#f5f5f5] hover:bg-gray-200 p-2 rounded-full"
                >
                  <BiSearch size={20} className="text-[#8A56AC]" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="relative"
              >
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-3 py-2 text-sm border border-[#8A56AC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC] text-[#333] placeholder-gray-400"
                />
                <button
                  onClick={() => {
                    setIsSearching(false);
                    setSearchTerm('');
                    setFilteredUsers([]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <BiX size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results or Conversations List */}
        <div className="flex-1 overflow-y-auto px-1 py-3 bg-[#fdfdfd]">
        {/* Show search results if searching */}
          {showSearchResults ? (
            filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserListItem
                  key={user._id}
                  name={user.name}
                  email={user.email}
                  onClick={() => {
                    // Select user (conversation will be selected in handleUserSelect)
                    onUserSelect(user);
                    setIsOpen(false);
                  }}
                />
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 pt-4">No users found.</p>
            )
          ) : (
            // Show conversation list if not searching
            conversations.map((conversation) => {
              // Match conversation to user
              const userInConversation = users.find((user) => user._id === conversation._id);
              return userInConversation ? (
                <UserListItem
                  key={conversation._id}
                  name={userInConversation.name}
                  email={userInConversation.email}
                  onClick={() => {
                    // Select the conversation
                    onUserSelect(userInConversation);
                    setIsOpen(false);
                  }}
                />
              ) : null;
            })
          )}
        </div>

        {/* Logout Button */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 ">
          <button
            onClick={onLogout}
            className="w-full text-sm font-medium py-2 px-4 bg-[#FF6B81] text-white rounded-lg hover:bg-[#e55b70] transition"
          >
            Logout
          </button>
        </div>
      </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col fixed top-0 left-0 z-40 w-72 md:hidden "
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="flex flex-col hidden md:flex w-64 h-screen shadow-lg">
      {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
