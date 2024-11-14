import TextareaAutosize from 'react-textarea-autosize';
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAnimatedPlaceholder } from "@/lib/hooks/useAnimatedPlaceholder";
import { conversationExamples } from '@/lib/examples';

interface TopicInputsProps {
  inputs: string[];
  onInputChange: (index: number, value: string) => void;
  maxTopics: number;
  sparkleClicked: number | null;
  onSparkleClick: (index: number) => void;
  defaultPlaceholder?: string;
  examples?: string[];
  typingSpeed?: number;
  pauseDuration?: number;
}

export function TopicInputs({
  inputs,
  onInputChange,
  maxTopics,
  sparkleClicked,
  onSparkleClick,
  defaultPlaceholder,
  examples = conversationExamples,
  typingSpeed,
  pauseDuration
}: TopicInputsProps) {
  const placeholder = useAnimatedPlaceholder({ 
    examples,
    typingSpeed,
    pauseDuration
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {inputs.map((input, index) => (
        <div key={index} className="flex items-start gap-2">
          <TextareaAutosize
            value={input}
            onChange={(e) => onInputChange(index, e.target.value)}
            placeholder={placeholder}
            minRows={1}
            maxRows={4}
            className="flex-1 resize-none bg-slate-800/40 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ overflow: 'hidden' }}
          />
          <motion.button
            animate={sparkleClicked === index ? {
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0],
            } : {}}
            transition={{ duration: 0.5 }}
            onClick={() => onSparkleClick(index)}
            className="p-2 hover:bg-slate-700/50 rounded-full transition-colors mt-1"
          >
            <Sparkles className="h-5 w-5 text-slate-400" />
          </motion.button>
        </div>
      ))}
    </div>
  );
} 