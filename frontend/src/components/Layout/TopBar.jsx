import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown, CheckCircle2 } from 'lucide-react';
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
    <header className="h-[72px] bg-white/80 dark:bg-slate-100/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-300 sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for resources, tickets..." 
            className="w-full bg-slate-50 dark:bg-slate-200 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-800 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <button className="p-2.5 rounded-xl text-slate-500 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200 relative group transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-100"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-300 mx-2"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all border ${
              isMenuOpen ? 'bg-slate-50 dark:bg-slate-200 border-slate-100 dark:border-slate-300 shadow-sm' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-200 hover:border-slate-100 dark:hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-colors ${
              user.role === 'ADMIN' ? 'bg-primary-600' : 
              user.role === 'TECHNICIAN' ? 'bg-orange-500' : 'bg-green-500'
            }`}>
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-100 border border-slate-100 dark:border-slate-300 rounded-2xl shadow-xl z-20 overflow-hidden animate-scale-in">
                <div className="p-4 bg-slate-50 dark:bg-slate-200 border-b border-slate-100 dark:border-slate-300">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-900 truncate mt-1">{user.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-200 transition-all">
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all mt-1"
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
