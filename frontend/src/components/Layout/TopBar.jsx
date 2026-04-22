import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useUser } from '../../context/UserContext';

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

  const avatarBg = user.role === 'ADMIN' ? '#1c4f78' : user.role === 'TECHNICIAN' ? '#b45309' : '#15803d';

  return (
    <header
      className="h-[72px] sticky top-0 z-40 px-8 flex items-center justify-between backdrop-blur-md"
      style={{ backgroundColor: 'rgba(6, 20, 27, 0.92)', borderBottom: '1px solid #253745' }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA8AB' }} />
          <input
            type="text"
            placeholder="Search for resources, tickets..."
            className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
            style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#CCD0CF' }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">

        <button
          className="p-2.5 rounded-xl relative group transition-all"
          style={{ color: '#9BA8AB' }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" style={{ border: '2px solid #06141B' }}></span>
        </button>

        <div className="h-8 w-[1px]" style={{ backgroundColor: '#253745' }}></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all"
            style={isMenuOpen
              ? { backgroundColor: '#253745', border: '1px solid #4A5C6A' }
              : { border: '1px solid transparent' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
              style={{ backgroundColor: avatarBg, color: '#CCD0CF' }}
            >
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold leading-none" style={{ color: '#CCD0CF' }}>{user.name}</p>
              <p className="text-[10px] font-bold mt-1 uppercase tracking-wider" style={{ color: '#9BA8AB' }}>{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#9BA8AB' }} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
              <div
                className="absolute right-0 mt-3 w-56 rounded-2xl shadow-xl z-20 overflow-hidden"
                style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}
              >
                <div className="p-4" style={{ backgroundColor: '#06141B', borderBottom: '1px solid #253745' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Signed in as</p>
                  <p className="text-xs font-bold truncate mt-1" style={{ color: '#CCD0CF' }}>{user.email}</p>
                </div>
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: '#9BA8AB' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#253745'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all mt-1"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
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
