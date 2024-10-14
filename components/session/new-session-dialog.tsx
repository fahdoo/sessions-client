import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
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

  useEffect(() => {
    // Load the default system prompt when the component mounts
    const loadDefaultPrompt = async () => {
      if (!isOpen) return;
      
      setIsLoadingPrompt(true);
      try {
        const response = await fetch('/api/default-prompt');
        if (!response.ok) {
          throw new Error('Failed to load default prompt');
        }
        const defaultPrompt = await response.text();
        setSystemPrompt(defaultPrompt);
      } catch (error) {
        console.error('Failed to load default prompt:', error);
        setSystemPrompt(''); // Set an empty string or a fallback prompt
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    loadDefaultPrompt();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSession(title, systemPrompt);
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
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. my childhood memories, career reflections, future aspirations"
                required
              />
            </div>
            <div>
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced-options">
                  <AccordionTrigger>Advanced options</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <label htmlFor="systemPrompt" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        System Prompt
                      </label>
                      <Textarea
                        id="systemPrompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={10}
                        required
                        disabled={isLoadingPrompt}
                        placeholder={isLoadingPrompt ? "Loading default prompt..." : "Enter system prompt"}
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
