export function SkeletonInfo() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg h-16" />
      ))}
    </div>
  );
} 