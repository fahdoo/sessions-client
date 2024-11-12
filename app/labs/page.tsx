import Link from 'next/link';

export default function LabsIndex() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Labs</h1>
      <div className="grid gap-4">
        <Link 
          href="/labs/audiogram" 
          className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Audiogram Lab</h2>
          <p className="text-slate-400">
            Experiment with different audio visualizations and settings for audiograms
          </p>
        </Link>
        
        <Link 
          href="/labs/musicolors" 
          className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Musicolors Lab</h2>
          <p className="text-slate-400">
            Test and experiment with the Musicolors visualization library
          </p>
        </Link>
      </div>
    </div>
  );
} 