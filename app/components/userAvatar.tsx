'use client';
import React from 'react';

const UserAvatar: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-10 h-10 bg-[#FFF] pt-1 text-zinc-800 font-bold rounded-lg border border-1 border-purple-400 flex items-center justify-center">
    {name.charAt(0).toUpperCase()}
  </div>
);

export default UserAvatar;
