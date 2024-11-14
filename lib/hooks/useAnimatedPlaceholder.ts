import { useState, useEffect } from 'react';

interface UseAnimatedPlaceholderProps {
  examples: string[];
  typingSpeed?: number;
  pauseDuration?: number;
}

export function useAnimatedPlaceholder({ 
  examples,
  typingSpeed = 150,
  pauseDuration = 6000 
}: UseAnimatedPlaceholderProps) {
  const [placeholder, setPlaceholder] = useState('');
  const [currentExample, setCurrentExample] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const words = examples[currentExample].split(' ');
    
    if (currentWord < words.length) {
      const timer = setTimeout(() => {
        setPlaceholder(prev => prev + (prev ? ' ' : '') + words[currentWord]);
        setCurrentWord(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setPlaceholder('');
        setCurrentWord(0);
        setCurrentExample((prev) => (prev + 1) % examples.length);
      }, pauseDuration);

      return () => clearTimeout(timer);
    }
  }, [currentExample, currentWord, examples, typingSpeed, pauseDuration]);

  return placeholder;
} 