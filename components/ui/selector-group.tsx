import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface OptionInfo {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  dialog?: boolean;
}

interface SelectorGroupProps<T extends string> {
  options: Record<T, OptionInfo>;
  selectedOption: T;
  onOptionChange: (option: T) => void;
  className?: string;
  onDialogTrigger?: () => void;
}

export function SelectorGroup<T extends string>({ 
  options, 
  selectedOption, 
  onOptionChange,
  className = '',
  onDialogTrigger
}: SelectorGroupProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionIds = Object.keys(options) as T[];
  const SelectedIcon = options[selectedOption].icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    if (options[selectedOption].dialog && onDialogTrigger) {
      onDialogTrigger();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div ref={containerRef} className={`relative flex justify-center ${className}`}>
      {/* Expanded options */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100]">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-[20px] p-2">
                <div className="flex flex-col gap-2">
                  {optionIds
                    .filter(option => option !== selectedOption)
                    .map((option) => {
                      const Icon = options[option].icon;
                      return (
                        <div 
                          key={option} 
                          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            if (options[option].dialog && onDialogTrigger) {
                              onDialogTrigger();
                            } else {
                              onOptionChange(option);
                            }
                            setIsExpanded(false);
                          }}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full border-slate-700 bg-slate-800/80 backdrop-blur-sm"
                          >
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                          <span className="text-xs md:text-sm text-slate-200 whitespace-nowrap">
                            {options[option].label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main button */}
      <div 
        className="flex items-center gap-2 cursor-pointer text-slate-400 hover:opacity-80 transition-opacity"
        onClick={handleClick}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 md:h-10 md:w-10 rounded-full border-slate-700 bg-slate-800/50 backdrop-blur-sm"
        >
          <SelectedIcon className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <span className="text-xs md:text-sm whitespace-nowrap">
          {options[selectedOption].label}
        </span>
      </div>
    </div>
  );
} 