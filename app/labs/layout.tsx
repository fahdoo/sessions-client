export default function LabsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
  );
} 