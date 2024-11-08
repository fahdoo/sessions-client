import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useRef, useEffect } from "react";

interface TopicInputsProps {
  inputs: string[];
  onInputChange: (index: number, value: string) => void;
  maxTopics: number;
  sparkleClicked: number | null;
  onSparkleClick: (index: number) => void;
  defaultPlaceholder: string;
}

export function TopicInputs({ 
  inputs, 
  onInputChange, 
  sparkleClicked, 
  onSparkleClick, 
  defaultPlaceholder 
}: TopicInputsProps) {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Auto-resize textarea
  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    textareaRefs.current.forEach(ref => {
      if (ref) {
        adjustHeight(ref);
      }
    });
  }, [inputs]); // Re-adjust when inputs change

  return (
    <div className="flex flex-col items-center gap-2">
      {inputs.map((input, index) => (
        <div key={index} className="relative flex items-center w-[360px]">
          <Textarea
            ref={(el) => {
              textareaRefs.current[index] = el;
            }}
            value={input}
            onChange={(e) => {
              onInputChange(index, e.target.value);
              adjustHeight(e.target);
            }}
            className="text-base bg-white/5 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl px-4 pr-12 min-h-[40px] max-h-[120px] border-slate-600/50 [&:not(:placeholder-shown)]:text-base [&::placeholder]:text-base text-slate-300 resize-none overflow-hidden leading-tight"
            placeholder={defaultPlaceholder}
            rows={1}
            style={{
              lineHeight: input.includes('\n') ? 'normal' : '24px',
              padding: input.includes('\n') ? '8px 16px 8px 16px' : '8px 16px 8px 16px',
              paddingRight: '36px'
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-[4px] hover:bg-transparent p-1"
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
        </div>
      ))}
    </div>
  );
} 