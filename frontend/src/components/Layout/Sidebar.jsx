import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Building2, 
  CalendarCheck, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'Resources', path: '/resources' },
    { icon: CalendarCheck, label: 'Bookings', path: '/bookings' },
    { icon: Ticket, label: 'Incidents', path: '/tickets' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 bg-white border-r border-slate-100 flex flex-col ${
        isOpen ? 'w-[280px]' : 'w-[88px]'
      }`}
    >
      {/* Logo Section */}
      <div className="h-[72px] flex items-center px-6 gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
          <Building2 className="text-white w-6 h-6" />
        </div>
        {isOpen && (
          <span className="font-bold text-lg text-slate-900 whitespace-nowrap">
            SmartCampus
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link group ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isOpen ? '' : 'mx-auto'}`} />
            {isOpen && <span className="font-medium">{item.label}</span>}
            {!isOpen && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button className="sidebar-link w-full text-left">
          <HelpCircle className="w-5 h-5 shrink-0" />
          {isOpen && <span>Help Support</span>}
        </button>
        <button className="sidebar-link w-full text-left text-error hover:bg-red-50 hover:text-error">
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 shadow-sm transition-colors"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default Sidebar;
