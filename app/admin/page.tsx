import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">This is the protected admin dashboard restricted to users with the `admin` role.</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Link 
          href="/admin/generate-learnings" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
        >
          Generate user learnings
        </Link>
        <Link 
          href="/admin/generate-titles" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
        >
          Update user session titles
        </Link>
        <Link 
          href="/admin/generate-summaries" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
        >
          Generate user summaries
        </Link>
      </div>
    </div>
  );
}
