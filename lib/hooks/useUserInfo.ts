import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './useToast';
import type { UserInfo } from '@/lib/types';
import { USER_INFO_LIMITS } from '@/lib/constants';

export function useUserInfo() {
  const [info, setInfo] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchInfo = useCallback(async () => {
    // Reset state before fetching
    setIsLoading(true);
    setError(null);
    setInfo([]);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/users/info', {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch info');
      }
      
      const data = await response.json();
      setInfo(data.info);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Error fetching info:', error);
      setError(error.message || 'Failed to fetch info');
      toast({
        variant: "destructive",
        description: "Failed to load your personal info"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const validateInfo = (newInfo: string[]): string | null => {
    if (newInfo.length > USER_INFO_LIMITS.MAX_ITEMS) {
      return `Maximum ${USER_INFO_LIMITS.MAX_ITEMS} items allowed`;
    }

    for (const item of newInfo) {
      if (item.trim().length < USER_INFO_LIMITS.MIN_TEXT_LENGTH) {
        return `Each item must be at least ${USER_INFO_LIMITS.MIN_TEXT_LENGTH} characters`;
      }
      if (item.length > USER_INFO_LIMITS.MAX_TEXT_LENGTH) {
        return `Each item must be less than ${USER_INFO_LIMITS.MAX_TEXT_LENGTH} characters`;
      }
    }

    return null;
  };

  const saveInfo = async (newInfo: string[]) => {
    const validationError = validateInfo(newInfo);
    if (validationError) {
      toast({
        variant: "destructive",
        description: validationError
      });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch('/api/users/info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          info: newInfo
            .filter(item => item.trim())
            .slice(0, USER_INFO_LIMITS.MAX_ITEMS)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save info');
      }

      const { info: savedInfo } = await response.json();
      setInfo(savedInfo);
      toast({
        description: "Your personal info has been saved"
      });
    } catch (error: any) {
      console.error('Error saving info:', error);
      setError(error.message || 'Failed to save info');
      toast({
        variant: "destructive",
        description: error.message || "Failed to save your personal info"
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    info,
    setInfo,
    isLoading,
    isSaving,
    error,
    fetchInfo,
    saveInfo
  };
} 