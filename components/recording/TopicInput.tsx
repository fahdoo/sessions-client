import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import React, { KeyboardEvent } from 'react';

interface TopicInputProps {
  index: number;
  input: string;
  onInputChange: (index: number, value: string) => void;
  onSparkleClick: (index: number) => void;
  sparkleClicked: number | null;
  placeholder: string;
  maxTopics: number;
  totalInputs: number;
}

export function TopicInput({
  index,
  input,
  onInputChange,
  onSparkleClick,
  sparkleClicked,
  placeholder,
  maxTopics,
  totalInputs
}: TopicInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.querySelector<HTMLInputElement>(`input[data-index="${index + 1}"]`);
      nextInput?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.querySelector<HTMLInputElement>(`input[data-index="${index - 1}"]`);
      prevInput?.focus();
    }
  };

  const isLastInput = index === totalInputs - 1;
  const isAtMaxTopics = totalInputs >= maxTopics;
  const showMaxMessage = isLastInput && isAtMaxTopics;

  return (
    <div className={`relative flex items-center w-[360px] ${showMaxMessage ? 'mb-6' : 'mb-2'}`}>
      <Input
        value={input}
        onChange={(e) => onInputChange(index, e.target.value)}
        onKeyDown={handleKeyDown}
        data-index={index}
        className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm rounded-full px-4 pr-10 text-sm [&::placeholder]:text-sm [&:not(:placeholder-shown)]:text-sm"
        placeholder={placeholder}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 hover:bg-transparent"
        onClick={() => onSparkleClick(index)}
        title="Get a topic suggestion"
      >
        <Sparkles 
          className={`h-4 w-4 transition-all duration-300 ${
            sparkleClicked === index 
              ? 'text-blue-400 scale-125 opacity-100'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        />
      </Button>
      {showMaxMessage && (
        <span className="absolute -bottom-5 right-0 text-xs text-slate-400">
          Maximum {maxTopics} topics reached
        </span>
      )}
    </div>
  );
} 