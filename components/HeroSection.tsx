import { motion } from 'framer-motion';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  return (  
    <div>
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent"
        >
          Share your story
        </motion.h1>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-base md:text-lg text-blue-400/60 leading-relaxed">
            Have meaningful talks with <em className="text-blue-300">Willow</em>, your AI guide, <br className="hidden md:block"/> about life experiences, memories, and interests.
          </p>
        </div>
      </div>
    </div>
  );
}
