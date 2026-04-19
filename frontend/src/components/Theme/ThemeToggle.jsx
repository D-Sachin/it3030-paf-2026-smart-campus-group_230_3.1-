import React from 'react';
import { Moon } from 'lucide-react';

const ThemeToggle = ({ onClick }) => {
  const handleClick = onClick || (() => {});

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Dark Mode"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all"
    >
      <Moon className="w-4 h-4" />
      Dark Mode
    </button>
  );
};

export default ThemeToggle;