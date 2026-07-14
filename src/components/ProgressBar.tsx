import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  size = 'md', 
  className = '' 
}) => {
  const heightClass = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-2';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className={`${heightClass} w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
