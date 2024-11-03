'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import OpenAI from 'openai';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle, RotateCw } from 'lucide-react';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface TopicControlsProps {
  transcript: string;
  onTopicAction: (action: string, params?: { topic: string }) => void;
  messageStatus: { [key: string]: 'sending' | 'success' | 'error' };
}

interface Topic {
  name: string;
  active: boolean;
}

export function TopicControls({ transcript, onTopicAction, messageStatus }: TopicControlsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);

  // Extract topics from transcript
  const extractTopics = useCallback(async (text: string) => {
    if (!text || text.length < 10) return [];

    const prompt = `
      Analyze the following conversation and extract the most relevant topics being discussed (0-3 topics maximum).
      Rules:
      - Return only 1-2 word topics, one per line
      - Focus on the most recent context (last few exchanges)
      - Only include topics that are central to the current discussion
      - Exclude generic or superficial topics
      - If no clear topics are present, return nothing
      
      Conversation:
      ${text}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a topic extractor. Return only the topics, one per line." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 50,
      });

      const newTopics = response.choices[0].message?.content
        ?.split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(name => ({
          name,
          active: topics.find(t => t.name === name)?.active || false
        })) || [];

      // Preserve active topics
      const preservedTopics = topics
        .filter(t => t.active && !newTopics.find(nt => nt.name === t.name));
      
      setTopics([...preservedTopics, ...newTopics]);
    } catch (error) {
      console.error('Error extracting topics:', error);
    }
  }, [topics]);

  // Update topics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      extractTopics(transcript);
    }, 30000);

    return () => clearInterval(interval);
  }, [transcript, extractTopics]);

  // Handle topic button clicks
  const handleTopicClick = (topic: Topic) => {
    // First determine the new active state
    const willBeActive = !topic.active;
    
    // Update local state
    setTopics(prev => prev.map(t => 
      t.name === topic.name ? { ...t, active: willBeActive } : t
    ));

    // Send the appropriate action based on the new state
    onTopicAction(
      willBeActive ? 'focus_topic' : 'unfocus_topic',
      { topic: topic.name }
    );
  };

  // Handle new topic button click
  const handleNewTopic = () => {
    onTopicAction('change_topic');
  };

  // Helper function to render status indicator
  const renderStatus = (topicName: string) => {
    const status = messageStatus[topicName];
    if (!status) return null;

    return (
      <span className="ml-2 inline-flex items-center">
        {status === 'sending' && (
          <Loader2 className="h-3 w-3 animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle className="h-3 w-3 text-green-500" />
        )}
        {status === 'error' && (
          <div className="flex items-center">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <RotateCw 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleTopicClick({ name: topicName, active: false });
              }}
            />
          </div>
        )}
      </span>
    );
  };

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4">
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <AnimatePresence mode="popLayout">
          {topics.map((topic) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTopicClick(topic)}
                className={cn(
                  "transition-colors inline-flex items-center",
                  topic.active && "bg-primary text-primary-foreground"
                )}
              >
                {topic.name}
                {renderStatus(topic.name)}
              </Button>
            </motion.div>
          ))}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewTopic}
              className="inline-flex items-center"
            >
              New Topic
              {renderStatus('new')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 