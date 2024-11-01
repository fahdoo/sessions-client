import React from 'react';
import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';

interface GenerateTitleButtonProps {
  isGenerating: boolean;
  onClick: () => void;
}

export function GenerateTitleButton({ isGenerating, onClick }: GenerateTitleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isGenerating}
      className="ml-2 text-slate-500 hover:text-slate-400 disabled:text-gray-400 focus:outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isGenerating ? {
          opacity: [1, 0.5, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        } : {}}
      >
        <Wand2 className="h-5 w-5" />
      </motion.div>
    </motion.button>
  );
}
