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

const Dashboard = () => {
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
          ticketService.getAllTickets(0, 1)
        ]);

        const resourceData = resourcesRes.data.data || [];
        const resourcePagination = resourcesRes.data.pagination || {};

        setStats({
          totalResources: resourcePagination.totalElements || 0,
          activeResources: resourceData.filter(r => r.status === 'ACTIVE').length,
          totalTickets: ticketsRes.data.totalElements || 0,
          openTickets: ticketsRes.data.content.filter(t => t.status !== 'RESOLVED').length,
          loading: false
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'Total Resources', 
      value: stats.totalResources, 
      icon: Building2, 
      color: 'text-primary-600', 
      bg: 'bg-primary-50',
      link: '/resources'
    },
    { 
      label: 'Active Facilities', 
      value: stats.activeResources, 
      icon: CheckCircle2, 
      color: 'text-success', 
      bg: 'bg-green-50',
      link: '/resources'
    },
    { 
      label: 'Incident Tickets', 
      value: stats.totalTickets, 
      icon: Ticket, 
      color: 'text-warning', 
      bg: 'bg-orange-50',
      link: '/tickets'
    },
    { 
      label: 'Open Issues', 
      value: stats.openTickets, 
      icon: AlertCircle, 
      color: 'text-error', 
      bg: 'bg-red-50',
      link: '/tickets'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back! Here's what's happening across the hub today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tickets/new" className="premium-button premium-button-primary">
            <Plus className="w-4 h-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <h2 className="text-2xl font-bold mb-4">Unified Operations Hub</h2>
              <p className="text-slate-400 max-w-lg leading-relaxed">
                Seamlessly manage campus resources and track incident reports in one central interface. 
                Our new integration ensures that facility health directly informs maintenance ticketing.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/resources" className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                  Check Resources <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/tickets" className="px-6 py-2.5 border border-slate-700 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                  View All Tickets
                </Link>
              </div>
            </div>
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl mr-10 mb-10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="premium-card p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-500" />
                Recent Facilities
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-bold text-slate-700">Lab 302</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-bold text-slate-700">Lecture Hall A</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <Link to="/resources" className="block text-center text-xs font-bold text-primary-600 mt-4 hover:underline">View All Resources</Link>
            </div>

            <div className="premium-card p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-orange-500" />
                Active Tickets
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">AC Not Working</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">2h ago</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">Water Leakage</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">5h ago</span>
                </div>
              </div>
              <Link to="/tickets" className="block text-center text-xs font-bold text-primary-600 mt-4 hover:underline">View All Tickets</Link>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              System Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">Backend API</p>
                  <p className="text-xs text-slate-400">Connected to :8080</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-200"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">Database</p>
                  <p className="text-xs text-slate-400">Operational</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-200"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">File Storage</p>
                  <p className="text-xs text-slate-400">S3 / Local Storage</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-200"></div>
              </div>
            </div>
          </div>

          <div className="premium-card p-6 bg-primary-600 border-none text-white">
            <h4 className="font-bold mb-2">Need Support?</h4>
            <p className="text-xs text-primary-100 leading-relaxed">
              If you encounter any issues with the dashboard or integration, please contact the SLIIT IT Hub technical team.
            </p>
            <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-bold transition-colors">
              Contact Tech Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
