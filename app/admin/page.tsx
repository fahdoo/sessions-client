import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">This is the protected admin dashboard restricted to users with the `admin` role.</p>
      <Link href="/admin/generate-learnings" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Generate User Learnings
      </Link>
    </div>
  );
}
