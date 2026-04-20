import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import ThemeToggle from '../Theme/ThemeToggle';

const TopBar = () => {
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  return (
    <header className="h-[72px] bg-gradient-to-r from-primary-700 to-primary-600 dark:from-primary-800 dark:to-primary-700 border-b border-primary-500/40 dark:border-primary-600/60 shadow-sm sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search for resources, tickets..." 
            className="w-full bg-white/15 border border-white/25 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/35 focus:border-white/50 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle className="border-white/30 bg-white/15 text-white hover:bg-white/25 hover:border-white/40 dark:border-white/30 dark:bg-white/15 dark:text-white dark:hover:bg-white/25 dark:hover:border-white/40" />

        <button className="p-2.5 rounded-xl text-white/85 hover:bg-white/15 relative group transition-all border border-transparent hover:border-white/30">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-primary-700"></span>
        </button>

        <div className="h-8 w-[1px] bg-white/30 mx-2"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all border ${
              isMenuOpen ? 'bg-white/20 border-white/35 shadow-sm' : 'border-transparent hover:bg-white/15 hover:border-white/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-colors ${
              user.role === 'ADMIN' ? 'bg-primary-600' : 
              user.role === 'TECHNICIAN' ? 'bg-orange-500' : 'bg-green-500'
            }`}>
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-white/70 mt-1 uppercase tracking-wider">{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-56 bg-slate-50/95 dark:bg-slate-200 border border-slate-200 dark:border-slate-300 rounded-2xl shadow-xl shadow-slate-900/20 z-20 overflow-hidden animate-scale-in">
                <div className="p-4 bg-white/70 dark:bg-slate-100 border-b border-slate-100 dark:border-slate-300">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-700 uppercase tracking-widest">Signed in as</p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-1">{user.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-100 transition-all">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-700" />
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-100 transition-all mt-1"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
