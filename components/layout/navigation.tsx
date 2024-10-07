import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/sessions" className="hover:text-gray-300">Public</Link>
          <Link href="/sessions/manage" className="hover:text-gray-300">Manage</Link>
          <Link href="/create-session" className="hover:text-gray-300">New Session</Link>
        </div>
        <UserButton />
      </div>
    </nav>
  );
}