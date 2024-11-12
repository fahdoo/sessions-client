export default function LabsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-800 p-4">
        <div className="container mx-auto">
          <h1 className="text-lg font-semibold">
            Sessions Labs
          </h1>
        </div>
      </nav>
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
} 