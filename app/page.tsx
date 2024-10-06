import { auth, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to Sessions, {user?.firstName}!</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Sessions is your personal podcast app where you can record conversations with an AI interviewer to capture your life stories, thoughts, and reflections.
      </p>
      <div className="space-y-4">
        <Link href="/sessions/create" className="block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
          Create Your First Session
        </Link>
        <Link href="/sessions" className="block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300">
          Browse Public Sessions
        </Link>
      </div>
    </div>
  );
}