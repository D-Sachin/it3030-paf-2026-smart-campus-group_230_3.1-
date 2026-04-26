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
  Menu,
  Users,
  BarChart3
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useUser();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'TECHNICIAN', 'USER'] },
    { icon: Building2, label: 'Resources', path: '/resources', roles: ['ADMIN', 'USER'] },
    { icon: CalendarCheck, label: 'Bookings', path: '/bookings', roles: ['ADMIN', 'USER'] },
    { icon: Ticket, label: 'Incidents', path: '/tickets', roles: ['ADMIN', 'TECHNICIAN', 'USER'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['ADMIN'] },
    { icon: BarChart3, label: 'Technician Performance', path: '/technician-performance', roles: ['ADMIN'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN'] },
  ];

  const allowedMenuItems = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside 
      className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 flex flex-col ${
        isOpen ? 'w-[280px]' : 'w-[88px]'
      }`}
      style={{ 
        backgroundColor: '#06141B', 
        borderRight: '1px solid #253745' 
      }}
    >
      {/* Logo Section */}
      <div className="h-[72px] flex items-center px-6 gap-3 overflow-hidden" style={{ borderBottom: '1px solid #253745' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: '#1c4f78' }}>
          <Building2 className="text-white w-6 h-6" />
        </div>
        {isOpen && (
          <span className="font-bold text-lg whitespace-nowrap" style={{ color: '#CCD0CF' }}>
            SmartCampus
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {allowedMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link group relative ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              backgroundColor: isActive ? '#1c4f78' : 'transparent',
              color: isActive ? '#CCD0CF' : '#9BA8AB',
              border: isActive ? '1px solid #4A5C6A' : '1px solid transparent'
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = '#11212D';
                e.currentTarget.style.color = '#CCD0CF';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9BA8AB';
              }
            }}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${isOpen ? '' : 'mx-auto'}`} />
            {isOpen && <span>{item.label}</span>}
            {!isOpen && (
              <div 
                className="absolute left-full ml-4 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl"
                style={{ backgroundColor: '#11212D', color: '#CCD0CF', border: '1px solid #253745' }}
              >
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: '#253745' }}>
        <NavLink
          to="/help"
          className={({ isActive }) => `sidebar-link w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            backgroundColor: isActive ? '#1c4f78' : 'transparent',
            color: isActive ? '#CCD0CF' : '#9BA8AB',
          })}
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium">Help Support</span>}
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium"
          style={{ color: '#ef4444' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 border rounded-full flex items-center justify-center transition-colors shadow-xl"
        style={{ backgroundColor: '#11212D', borderColor: '#253745', color: '#9BA8AB' }}
        onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
        onMouseLeave={e => e.currentTarget.style.color = '#9BA8AB'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default Sidebar;
