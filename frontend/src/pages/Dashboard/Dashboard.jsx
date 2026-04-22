import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import resourceService from '../../services/resourceService';
import ticketService from '../../services/ticketService';
import { useUser } from '../../context/UserContext';

const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalResources: 0,
    activeResources: 0,
    totalTickets: 0,
    openTickets: 0,
    recentTickets: [],
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let response;
        if (user.role === 'ADMIN' || user.role === 'TECHNICIAN') {
          response = await ticketService.getAllTickets({ size: 50 });
        } else {
          response = await ticketService.getTicketsByUserId(user.id);
        }

        const resourcesRes = await resourceService.getAllResources(0, 1);
        const resourcePagination = resourcesRes?.data?.pagination || {};
        const resourceData = resourcesRes?.data?.data || [];
        
        const ticketsRes = response;
        let ticketData = ticketsRes?.data?.content || (Array.isArray(ticketsRes?.data) ? ticketsRes.data : []);

        setStats({
          totalResources: resourcePagination.totalElements || 0,
          activeResources: resourceData.filter(r => r?.status === 'ACTIVE').length,
          totalTickets: ticketsRes?.data?.totalElements || ticketData.length,
          openTickets: ticketData.filter(t => t?.status !== 'RESOLVED' && t?.status !== 'CLOSED').length,
          recentTickets: ticketData.slice(0, 3), 
          loading: false
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user.role, user.id]); 

  const allStatCards = [
    { 
      id: 'totalResources',
      label: 'Total Resources', 
      value: stats.totalResources, 
      icon: Building2, 
      iconColor: '#2d70a3', 
      iconBg: 'rgba(45, 112, 163, 0.15)',
      link: '/resources',
      roles: ['ADMIN']
    },
    { 
      id: 'activeFacilities',
      label: 'Active Facilities', 
      value: stats.activeResources, 
      icon: CheckCircle2, 
      iconColor: '#10b981', 
      iconBg: 'rgba(16, 185, 129, 0.15)',
      link: '/resources',
      roles: ['ADMIN']
    },
    { 
      id: 'incidentTickets',
      label: user.role === 'TECHNICIAN' ? 'My Assigned Issues' : 'Incident Tickets', 
      value: stats.totalTickets, 
      icon: Ticket, 
      iconColor: '#f59e0b', 
      iconBg: 'rgba(245, 158, 11, 0.15)',
      link: '/tickets',
      roles: ['ADMIN', 'TECHNICIAN', 'USER']
    },
    { 
      id: 'openIssues',
      label: 'Open Issues', 
      value: stats.openTickets, 
      icon: AlertCircle, 
      iconColor: '#ef4444', 
      iconBg: 'rgba(239, 68, 68, 0.15)',
      link: '/tickets',
      roles: ['ADMIN', 'TECHNICIAN', 'USER']
    }
  ];

  const statCards = allStatCards.filter(card => card.roles.includes(user.role));

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#CCD0CF' }}>
            {user.role === 'ADMIN' ? 'Admin Overview' : 
             user.role === 'TECHNICIAN' ? 'Technician Portal' : 'Student Hub'}
          </h1>
          <p className="mt-1 font-medium" style={{ color: '#9BA8AB' }}>Hello {user.name}, here's your prioritized view for today.</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'USER' && (
            <Link to="/tickets" className="premium-button" style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}>
              <Plus className="w-4 h-4" />
              Report New Incident
            </Link>
          )}
          {user.role === 'ADMIN' && (
            <Link to="/resources" className="premium-button" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A', color: '#CCD0CF' }}>
              Manage Facilities
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${statCards.length} gap-6`}>
        {statCards.map((card, idx) => (
          <Link 
            key={idx} 
            to={card.link} 
            className="rounded-2xl p-6 transition-all duration-300"
            style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9BA8AB'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A5C6A'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start justify-between">
              <div 
                className="p-3 rounded-xl transition-transform" 
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4" style={{ color: '#4A5C6A' }} />
            </div>
            <div className="mt-4">
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#9BA8AB' }}>{card.label}</span>
              <div className="text-3xl font-extrabold mt-1" style={{ color: '#CCD0CF' }}>
                {stats.loading ? '...' : card.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className="p-8 rounded-[32px] overflow-hidden relative shadow-2xl"
            style={{ backgroundColor: '#06141B', border: '1px solid #253745' }}
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#CCD0CF' }}>
                {user.role === 'ADMIN' ? 'System Governance' : 
                 user.role === 'TECHNICIAN' ? 'Field Operations' : 'Campus Support'}
              </h2>
              <p className="max-w-lg leading-relaxed" style={{ color: '#9BA8AB' }}>
                {user.role === 'ADMIN' ? 'Monitor all campus facilities and ensure incident resolution times meet institutional standards.' :
                 user.role === 'TECHNICIAN' ? 'Access your assigned tickets and update resolution progress directly from the field.' :
                 'Report maintenance issues in your dorm or classroom and track our progress in real-time.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {user.role === 'ADMIN' && (
                  <Link 
                    to="/resources" 
                    className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    style={{ backgroundColor: '#CCD0CF', color: '#06141B' }}
                  >
                    Facility Map <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link 
                  to="/tickets" 
                  className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors border"
                  style={{ borderColor: '#4A5C6A', color: '#CCD0CF' }}
                >
                  {user.role === 'USER' ? 'My Reported Tickets' : 'Ticket Queue'}
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl mr-10 mb-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(user.role === 'ADMIN' || user.role === 'TECHNICIAN') && (
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#CCD0CF' }}>
                  <Building2 className="w-4 h-4" style={{ color: '#2d70a3' }} />
                  Recent Facilities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-bold" style={{ color: '#CCD0CF' }}>Lab 302</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-bold" style={{ color: '#CCD0CF' }}>Lecture Hall A</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#CCD0CF' }}>
                <Ticket className="w-4 h-4" style={{ color: '#f59e0b' }} />
                Active Tickets
              </h3>
              <div className="space-y-4">
                {stats.recentTickets.length > 0 ? (
                  stats.recentTickets.map((ticket, idx) => (
                    <div 
                      key={ticket.id || idx} 
                      className="flex items-center justify-between p-3 rounded-xl" 
                      style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          ticket.status === 'OPEN' ? 'bg-orange-500' : 
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-bold truncate max-w-[120px]" style={{ color: '#CCD0CF' }}>
                          {ticket.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: '#4A5C6A' }}>
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>No active tickets</p>
                  </div>
                )}
              </div>
              <Link to="/tickets" className="block text-center text-xs font-bold mt-4 transition-colors" style={{ color: '#2d70a3' }}>View All</Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: '#9BA8AB' }}>
              <Clock className="w-4 h-4" />
              Active Profile
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4A5C6A' }}>Access Level</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.role === 'ADMIN' ? 'bg-primary-500' : 
                    user.role === 'TECHNICIAN' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <p className="font-black" style={{ color: '#CCD0CF' }}>{user.role}</p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed italic" style={{ color: '#9BA8AB' }}>
                You are currently viewing the system as a {user.role.toLowerCase()}. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
