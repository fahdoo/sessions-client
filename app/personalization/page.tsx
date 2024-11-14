'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Minus } from 'lucide-react';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useEffect, useState, useRef } from 'react';
import type { UserInfo } from '@/lib/types';
import { USER_INFO_LIMITS } from '@/lib/constants';
import TextareaAutosize from 'react-textarea-autosize';

const PLACEHOLDER_EXAMPLES = [
  "I enjoy reading science fiction novels and discussing space exploration",
  "I'm passionate about sustainable gardening and cooking with home-grown ingredients",
  "I work in healthcare and have a special interest in medical technology",
  "I've been learning piano for 5 years and love classical music",
  "I'm an avid hiker and have completed trails in 12 national parks",
  "I'm fascinated by ancient history and collect historical maps",
  "I run a local book club focused on mystery novels and true crime",
  "I'm learning three languages and love traveling to practice them",
  "I rescue dogs in my spare time and advocate for animal welfare",
  "I'm a photography enthusiast specializing in wildlife photography"
];

const getRandomPlaceholder = () => {
  return PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)];
};

function PersonalizationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1 relative">
            <div className="h-[42px] bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
          </div>
          <div className="shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function PersonalizationPage() {
  const { user } = useUser();
  const { info, setInfo, isLoading, isSaving, fetchInfo, saveInfo } = useUserInfo();
  const [hasChanges, setHasChanges] = useState(false);
  const isAddingNewRef = useRef(false);

  useEffect(() => {
    if (user?.id) {
      fetchInfo();
    }
  }, [user?.id, fetchInfo]);

  const handleAddItem = () => {
    isAddingNewRef.current = true;
    const newItem: UserInfo = {
      text: '',
      createdAt: new Date().toISOString(),
      updatedAt: null
    };
    setInfo([...info, newItem]);
    setHasChanges(true);
    setTimeout(() => {
      isAddingNewRef.current = false;
    }, 100);
  };

  const handleUpdateItem = (index: number, text: string) => {
    // Limit text length
    if (text.length > USER_INFO_LIMITS.MAX_TEXT_LENGTH) return;

    const newItems = [...info];
    newItems[index] = {
      ...newItems[index],
      text,
      updatedAt: new Date().toISOString()
    };
    setInfo(newItems);
    setHasChanges(true);
  };

  const handleRemoveItem = (index: number) => {
    setInfo(info.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    const textArray = info.map(item => item.text);
    await saveInfo(textArray);
    setHasChanges(false);
  };

  // Auto-save on blur if there are changes and content is valid
  const handleBlur = async () => {
    if (!hasChanges || isAddingNewRef.current) return;

    // Filter out empty items and check if anything has actually changed
    const validItems = info.filter(item => item.text.trim().length > 0);
    const currentTexts = validItems.map(item => item.text.trim());
    
    // Don't save if we only have empty strings
    if (currentTexts.length === 0) {
      setHasChanges(false);
      return;
    }

    await saveInfo(currentTexts);
    setHasChanges(false);
  };

  // Auto-resize textarea helper - updated for better handling
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Add a small buffer (2px) to prevent scrollbar flashing
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Personalization</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Have richer conversations when you add information.
        <br />
        Just write <em>naturally</em> and describe an aspect of yourself or a fact.
      </p>

      {isLoading ? (
        <PersonalizationSkeleton />
      ) : (
        <div className="space-y-4">
          {(info.length === 0 ? [{ text: '', createdAt: new Date().toISOString() }] : info).map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 relative">
                <TextareaAutosize
                  value={item.text}
                  onChange={(e) => handleUpdateItem(index, e.target.value)}
                  onBlur={handleBlur}
                  placeholder={`${getRandomPlaceholder()}...`}
                  className="w-full resize-none pr-12 min-h-[42px] leading-relaxed bg-background rounded-md border border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-3"
                  minRows={1}
                  maxRows={5}
                />
                <span 
                  className={`absolute right-3 top-2.5 text-xs transition-colors ${
                    item.text.length >= USER_INFO_LIMITS.MAX_TEXT_LENGTH 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-slate-400'
                  }`}
                >
                  {item.text.length}/{USER_INFO_LIMITS.MAX_TEXT_LENGTH}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                className="shrink-0 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="secondary"
              size="default"
              onClick={handleAddItem}
              disabled={info.length >= USER_INFO_LIMITS.MAX_ITEMS}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add more
            </Button>

            <Button
              size="default"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`ml-auto text-sm ${!hasChanges && !isSaving ? 'opacity-50' : ''}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasChanges ? 'Save changes' : 'Saved'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 