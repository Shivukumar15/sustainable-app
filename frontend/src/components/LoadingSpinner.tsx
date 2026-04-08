import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-pulse-glow" />
        <Loader2 className={`${sizeClasses[size]} text-emerald-600 animate-spin`} />
      </div>
      <p className="mt-4 text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
}
