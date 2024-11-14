'use client';

import { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { useToast } from '@/lib/hooks/useToast';
import debounce from 'lodash/debounce';

interface PersonalInfoInputProps {
  userId: string;
  initialValue?: string;
}

export function PersonalInfoInput({ userId, initialValue }: PersonalInfoInputProps) {
  const [value, setValue] = useState(initialValue || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Debounced save function
  const savePersonalInfo = useCallback(
    debounce(async (text: string) => {
      try {
        setIsSaving(true);
        const supabase = await createAuthSupabaseClient();
        
        const { error } = await supabase
          .from('users')
          .update({ personal_info: text })
          .eq('id', userId);

        if (error) throw error;

        toast({
          description: "Personal info saved",
          duration: 2000,
        });
      } catch (error) {
        console.error('Error saving personal info:', error);
        toast({
          variant: "destructive",
          description: "Failed to save personal info",
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [userId, toast]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    savePersonalInfo(newValue);
  };

  return (
    <div className="w-full space-y-2">
      <Textarea
        placeholder="Tell Willow about yourself... This helps personalize your conversations."
        value={value}
        onChange={handleChange}
        className="resize-none h-32"
      />
      {isSaving && (
        <p className="text-xs text-slate-500 text-right animate-fade-in">
          Saving...
        </p>
      )}
    </div>
  );
} 