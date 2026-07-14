import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  title: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onMenuClick?: () => void;
  userInfo: { name: string; email: string };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  darkMode,
  setDarkMode,
  onMenuClick,
  userInfo
}) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-10 transition-colors duration-300">
      <div className="flex items-center space-x-4 min-w-0">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-base sm:text-xl font-bold text-slate-855 dark:text-white truncate">{title}</h1>
      </div>

      <div className="flex items-center space-x-4 shrink-0">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-all cursor-pointer"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
        
        <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-755 dark:text-slate-350">Chào, <span className="font-semibold">{userInfo.name}</span> 👋</span>
        </div>
      </div>
    </header>
  );
};
