import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export default function RecommendedUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/recommended');
        if (!response.ok) {
          throw new Error('Failed to fetch recommended users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching recommended users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {users.map((user) => (
        <Link href={`/profile/${user.username}`} key={user.id} className="flex items-center p-2 rounded-lg hover:bg-slate-100">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-slate-400">@{user.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
