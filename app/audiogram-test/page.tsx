'use client';

import { useEffect, useState } from 'react';
import AudiogramVisualizer from '@/components/audiogram/AudiogramVisualizer';
import { AudiogramSettingsSidebar } from '@/components/audiogram/AudiogramSettingsSidebar';
import { Session } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { THEME_COLORS } from '@/components/audiogram/constants';
import { VisualizationType, VisualizerConfig } from '@/components/audiogram/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AudiogramTest() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('bars');
  const [config, setConfig] = useState<VisualizerConfig>({
    barColor: '#FFFFFF',
    visualizerHeight: 0.3,
    titleSize: 32,
    titleColor: '#FFFFFF'
  });

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      try {
        console.log('Fetching sessions...');
        // Fetch user's recent public sessions with audio
        const response = await fetch('/api/sessions/mine?limit=10&hasAudio=true');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        if (data.sessions?.length) {
          setSessions(data.sessions);
          // Auto-select the most recent session
          setSelectedSessionId(data.sessions[0].id);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error: {error}
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="p-4 text-center">
        No sessions with audio found. Please make sure you have recorded a session.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main content - much wider */}
      <div className="flex-1 p-8 overflow-auto max-w-[calc(100vw-320px)]">
        {/* Session selector at the top */}
        <div className="mb-8 max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Audiogram Visualizer</h1>
          </div>
          <div className="w-[320px]">
              <Select
                value={selectedSessionId}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.title || 'Untitled Session'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </div>

        {/* Audiogram visualizer */}
        {selectedSession && (
          <div className="max-w-[1200px] mx-auto">
            <AudiogramVisualizer 
              sessionId={selectedSession.id}
              session={selectedSession}
              visualizationType={visualizationType}
              config={config}
              onConfigChange={(newConfig) => {
                setConfig(prev => ({
                  ...prev,
                  ...newConfig
                }));
              }}
            />
          </div>
        )}
      </div>

      {/* Sidebar - fixed width */}
      <AudiogramSettingsSidebar
        config={config}
        onConfigChange={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
        visualizationType={visualizationType}
        onVisualizationTypeChange={setVisualizationType}
      />
    </div>
  );
} 