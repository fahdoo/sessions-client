'use client';

import { useEffect, useRef } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveTranscriptOverlayProps {
  transcript: TranscriptSegment[];
}

export function LiveTranscriptOverlay({ transcript }: LiveTranscriptOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 bg-transparent overflow-y-auto pointer-events-none"
      style={{ 
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent 100%)'
      }}
    >
      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {transcript.map((segment) => (
            <motion.div
              key={segment.id}
              initial={{ 
                opacity: 0, 
                y: 20,
                x: segment.participantId.startsWith('agent') ? -20 : 20 
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }
              }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.2 }
              }}
              className={`flex ${
                segment.participantId.startsWith('agent') ? 'justify-start' : 'justify-end'
              }`}
            >
              <motion.div 
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm backdrop-blur-sm ${
                  segment.participantId.startsWith('agent')
                    ? 'bg-blue-500/10 text-blue-200 border border-blue-500/20'
                    : 'bg-green-500/10 text-green-200 border border-green-500/20'
                }`}
                initial={{ scale: 0.9 }}
                animate={{ 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  {segment.text}
                </motion.span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 