import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  size?: number;
}

const LoadingIndicator = ({ message, size = 24 }: LoadingIndicatorProps) => {
  if (message) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className={`h-${size} w-${size} animate-spin text-white mr-2`} />
        <p>{message}</p>
      </div>
    );
  }

  // Return just the spinner when no message is provided
  return <Loader2 className={`h-${size} w-${size} animate-spin text-white`} />;
};

export default LoadingIndicator;
