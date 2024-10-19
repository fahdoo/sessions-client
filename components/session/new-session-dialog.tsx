import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { getRandomTopic } from '@/lib/topics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NewSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (title: string, systemPrompt: string) => void;
  isCreating: boolean;
}

export function NewSessionDialog({ isOpen, onClose, onCreateSession, isCreating }: NewSessionDialogProps) {
  const [title, setTitle] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSession(title, systemPrompt);
  };

  const refreshTopic = () => {
    setTitle(getRandomTopic());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Your AI Conversation</DialogTitle>
          <DialogDescription>
            Have an interactive conversation to explore your memories, experiences, and thoughts. 
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                What do you want to talk about?
              </label>
              <div className="relative">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. my childhood memories, career reflections, future aspirations"
                  required
                  className="pr-24 py-2" // Increased right padding
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={refreshTopic}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 h-7 flex items-center justify-center"
                        disabled={isCreating}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span className="text-xs">Suggest</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Suggest a topic</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div>
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced-options">
                  <AccordionTrigger>Advanced options</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <label htmlFor="systemPrompt" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Additional instructions
                      </label>
                      <Textarea
                        id="systemPrompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={10}
                        disabled={isLoadingPrompt}
                        placeholder={"Give additional context and instructions for the AI to follow."}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <DialogFooter>
            <small>Sessions are recorded and can be kept private or shared publicly.</small>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
