import React from 'react';
import UserAvatar from './userAvatar';

interface Props {
  name: string;
  email?: string;
  selected?: boolean;
  onClick: () => void;
}

const UserListItem: React.FC<Props> = ({ name, email, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 rounded-lg px-2 py-1 cursor-pointer transition-colors hover:bg-purple-100 ${
      selected ? 'bg-purple-100' : 'hover:bg-zinc-100'
    }`}
  >
    <UserAvatar name={name} />
    <div className="flex flex-col overflow-hidden">
      <span className="font-medium truncate">{name}</span>
      {email && <span className="text-sm text-gray-500 truncate">{email}</span>}
    </div>
  </div>
);

export default UserListItem;
