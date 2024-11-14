import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const animations = {
  fade: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  circle: {
    initial: { rotate: -10, x: 100, opacity: 0 },
    animate: { rotate: 0, x: 0, opacity: 1 },
    exit: { rotate: 10, x: -100, opacity: 0 },
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  typewriter: {
    initial: { width: 0, opacity: 0 },
    animate: { width: "100%", opacity: 1 },
    exit: { width: 0, opacity: 0 },
    transition: { duration: { enter: 1.5, exit: 0.5 }, ease: "easeInOut" }
  },
  slide: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" }
  }
} as const;

type AnimationType = keyof typeof animations;

// Configuration
const config = {
  animationType: 'typewriter' as AnimationType, // Change this to try different animations
  interval: 6000, // Time between transitions in milliseconds
};

const examples = [
  "Reflect on childhood memories",
  "Articulate your dreams",
  "Discuss your favorite books and movies",
  "Explore your creative passions",
  "Share your life lessons",
  "Navigate personal challenges",
  "Think about your future goals",
  "Express your feelings",
  "Discuss your hobbies",
  "Reflect on your values"
];

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const selectedAnimation = animations[config.animationType];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length);
    }, config.interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (config.animationType === 'typewriter') {
      setWords(examples[currentIndex].split(' '));
    }
  }, [currentIndex]);

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
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

        <div className="h-24 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {config.animationType === 'typewriter' ? (
              <motion.div
                key={currentIndex}
                className="flex flex-wrap justify-center gap-x-2 text-lg md:text-xl text-slate-200/90"
              >
                {words.map((word, i) => (
                  <motion.span
                    key={`${currentIndex}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.p
                key={currentIndex}
                initial={selectedAnimation.initial}
                animate={selectedAnimation.animate}
                exit={selectedAnimation.exit}
                transition={selectedAnimation.transition}
                className="text-lg md:text-xl text-slate-200/90"
              >
                {examples[currentIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
