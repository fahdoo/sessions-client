'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { SelectorGroup, type OptionInfo } from '@/components/ui/selector-group';
import { USER_INFO_LIMITS } from '@/lib/constants';

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

const personalizationOptions: Record<'info', OptionInfo> = {
  info: {
    id: 'info',
    icon: Fingerprint,
    label: 'Me',
    description: 'Add personal information to help Willow understand you better',
    dialog: true
  }
};

export function PersonalizationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [newInfo, setNewInfo] = useState('');
  const { info, saveInfo, isSaving } = useUserInfo();

  const handleChange = (value: string) => {
    if (value.length > USER_INFO_LIMITS.MAX_TEXT_LENGTH) return;
    setNewInfo(value);
  };

  const handleSave = async () => {
    if (!newInfo.trim()) return;
    
    try {
      const updatedInfo = [
        ...info.map(item => item.text),
        newInfo.trim()
      ];
      
      await saveInfo(updatedInfo);
      setNewInfo('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save info:', error);
    }
  };

  const handleDialogOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <SelectorGroup
        options={personalizationOptions}
        selectedOption="info"
        onOptionChange={() => {}}
        onDialogTrigger={handleDialogOpen}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Personal Info</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Have richer conversations when you add information.
              <br />
              Just write <em>naturally</em> and describe an aspect of yourself or a fact.
            </p>
            
            <div className="relative">
              <Textarea
                value={newInfo}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]}
                className="min-h-[100px] pr-12"
              />
              <span 
                className={`absolute right-3 top-2.5 text-xs transition-colors ${
                  newInfo.length >= USER_INFO_LIMITS.MAX_TEXT_LENGTH 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-slate-400'
                }`}
              >
                {newInfo.length}/{USER_INFO_LIMITS.MAX_TEXT_LENGTH}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <Link 
                href="/personalization" 
                className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
              >
                Manage all my info
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="text-xs md:text-sm h-8 md:h-10 px-2 md:px-4"
                onClick={handleSave}
                disabled={isSaving || !newInfo.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 