import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const TopBar = () => {
  const { user, availableUsers, switchUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for resources, tickets..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 relative group transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>

        {/* User Profile With Role Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all border ${
              isMenuOpen ? 'bg-slate-50 border-slate-100 shadow-sm' : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-colors ${
              user.role === 'ADMIN' ? 'bg-primary-600' : 
              user.role === 'TECHNICIAN' ? 'bg-orange-500' : 'bg-green-500'
            }`}>
              {user.initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Role Switching Dropdown */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-scale-in">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switch Identity (Demo Mode)</p>
                </div>
                <div className="p-2">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-slate-50 group ${
                        user.id === u.id ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 
                          u.role === 'TECHNICIAN' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.initials}
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-bold ${user.id === u.id ? 'text-primary-700' : 'text-slate-700'}`}>
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">{u.role}</p>
                        </div>
                      </div>
                      {user.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-50">
                  <button className="w-full p-2.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors text-center">
                    Settings & Security
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
