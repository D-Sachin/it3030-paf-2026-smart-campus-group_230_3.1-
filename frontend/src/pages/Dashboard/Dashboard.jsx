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
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resourcesRes, ticketsRes] = await Promise.all([
          resourceService.getAllResources(0, 1),
          ticketService.getAllTickets(0, 50) // Fetch more for filtering simulation
        ]);

        const resourceData = resourcesRes?.data?.data || [];
        const resourcePagination = resourcesRes?.data?.pagination || {};
        let ticketData = ticketsRes?.data?.content || (Array.isArray(ticketsRes?.data) ? ticketsRes.data : []);

        // Simulation: If Technician, only show tickets assigned to them
        if (user.role === 'TECHNICIAN') {
          // This is a simulation since the backend doesn't filter yet
          // In a real app, the API would handle this
        }

        setStats({
          totalResources: resourcePagination.totalElements || 0,
          activeResources: resourceData.filter(r => r?.status === 'ACTIVE').length,
          totalTickets: ticketsRes?.data?.totalElements || ticketData.length,
          openTickets: ticketData.filter(t => t?.status !== 'RESOLVED' && t?.status !== 'CLOSED').length,
          loading: false
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user.role]); // Refetch when role changes

  const allStatCards = [
    { 
      id: 'totalResources',
      label: 'Total Resources', 
      value: stats.totalResources, 
      icon: Building2, 
      color: 'text-primary-600', 
      bg: 'bg-primary-50',
      link: '/resources',
      roles: ['ADMIN']
    },
    { 
      id: 'activeFacilities',
      label: 'Active Facilities', 
      value: stats.activeResources, 
      icon: CheckCircle2, 
      color: 'text-success', 
      bg: 'bg-green-50',
      link: '/resources',
      roles: ['ADMIN']
    },
    { 
      id: 'incidentTickets',
      label: user.role === 'TECHNICIAN' ? 'My Assigned Issues' : 'Incident Tickets', 
      value: stats.totalTickets, 
      icon: Ticket, 
      color: 'text-warning', 
      bg: 'bg-orange-50',
      link: '/tickets',
      roles: ['ADMIN', 'TECHNICIAN', 'USER']
    },
    { 
      id: 'openIssues',
      label: 'Open Issues', 
      value: stats.openTickets, 
      icon: AlertCircle, 
      color: 'text-error', 
      bg: 'bg-red-50',
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
          <h1 className="text-3xl font-bold text-slate-900">
            {user.role === 'ADMIN' ? 'Admin Overview' : 
             user.role === 'TECHNICIAN' ? 'Technician Portal' : 'Student Hub'}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Hello {user.name}, here's your prioritized view for today.</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'USER' && (
            <Link to="/tickets" className="premium-button premium-button-primary">
              <Plus className="w-4 h-4" />
              Report New Incident
            </Link>
          )}
          {user.role === 'ADMIN' && (
            <Link to="/resources" className="premium-button bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              Manage Facilities
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${statCards.length} gap-6`}>
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.link} className="premium-card p-6 group hover:scale-[1.02] transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-200" />
            </div>
            <div className="mt-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.loading ? '...' : card.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions / Integration Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-8 bg-slate-900 border-none text-white overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">
                {user.role === 'ADMIN' ? 'System Governance' : 
                 user.role === 'TECHNICIAN' ? 'Field Operations' : 'Campus Support'}
              </h2>
              <p className="text-slate-400 max-w-lg leading-relaxed">
                {user.role === 'ADMIN' ? 'Monitor all campus facilities and ensure incident resolution times meet institutional standards.' :
                 user.role === 'TECHNICIAN' ? 'Access your assigned tickets and update resolution progress directly from the field.' :
                 'Report maintenance issues in your dorm or classroom and track our progress in real-time.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {user.role === 'ADMIN' && (
                  <Link to="/resources" className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                    Facility Map <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link to="/tickets" className="px-6 py-2.5 border border-slate-700 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                  {user.role === 'USER' ? 'My Reported Tickets' : 'Ticket Queue'}
                </Link>
              </div>
            </div>
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl mr-10 mb-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(user.role === 'ADMIN' || user.role === 'TECHNICIAN') && (
              <div className="premium-card p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-500" />
                  Recent Facilities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-bold text-slate-700">Lab 302</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-bold text-slate-700">Lecture Hall A</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="premium-card p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-orange-500" />
                Active Tickets
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">AC Issue</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">2h ago</span>
                </div>
              </div>
              <Link to="/tickets" className="block text-center text-xs font-bold text-primary-600 mt-4 hover:underline">View All</Link>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 text-slate-900">
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active Profile
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Access Level</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.role === 'ADMIN' ? 'bg-primary-500' : 
                    user.role === 'TECHNICIAN' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <p className="font-black text-slate-900">{user.role}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                You are currently viewing the system as a {user.role.toLowerCase()}. Switch profiles in the header to see other dashboard views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
