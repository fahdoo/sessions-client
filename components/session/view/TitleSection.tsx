'use client';

interface TitleSectionProps {
  title: string;
  className?: string;
}

export function TitleSection({ title, className = '' }: TitleSectionProps) {
  return (
    <h1 className={`text-xl sm:text-2xl font-bold text-white sm:text-slate-900 sm:dark:text-white 
      line-clamp-5 break-words max-w-full ${className}`}>
      {title}
    </h1>
  );
} 