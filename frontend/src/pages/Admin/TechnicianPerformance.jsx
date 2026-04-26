import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, CheckCircle2, Clock, Zap, Loader2, BarChart3 } from 'lucide-react';
import { userService } from '../../services/userService';
import ticketService from '../../services/ticketService';

const TechnicianPerformance = () => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsersByRole("TECHNICIAN");
      setTechnicians(data);
      if (data.length > 0) {
        setSelectedTech(data[0]);
        fetchStats(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching technicians:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (techId) => {
    try {
      setStatsLoading(true);
      const response = await ticketService.getTechnicianStats(techId);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTechnicianSelect = (tech) => {
    setSelectedTech(tech);
    fetchStats(tech.id);
  };

  // Prepare chart data for ticket distribution
  const ticketDistributionData = stats ? [
    { name: 'Resolved', value: stats.resolvedCount, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgressCount, color: '#f59e0b' },
    { name: 'Open', value: stats.openCount, color: '#ef4444' },
  ] : [];

  // Calculate total for percentage
  const totalTickets = stats ? (stats.resolvedCount + stats.inProgressCount + stats.openCount) : 0;

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl" style={{ backgroundColor: '#1A3A42' }}>
          <BarChart3 className="w-6 h-6" style={{ color: '#4ECDC4' }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#CCD0CF' }}>Technician Performance</h1>
          <p className="text-sm mt-1" style={{ color: '#9BA8AB' }}>Monitor and analyze technician productivity metrics</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#4ECDC4' }} />
          <p style={{ color: '#9BA8AB' }}>Loading technician data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Technician List Sidebar */}
          <div className="lg:col-span-1 rounded-2xl p-4" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#4A5C6A' }}>
              Technicians
            </h2>
            <div className="space-y-2">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => handleTechnicianSelect(tech)}
                  className="w-full text-left p-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: selectedTech?.id === tech.id ? '#253745' : 'transparent',
                    borderLeft: selectedTech?.id === tech.id ? '3px solid #4ECDC4' : '3px solid transparent',
                    color: selectedTech?.id === tech.id ? '#CCD0CF' : '#9BA8AB'
                  }}
                  onMouseEnter={e => {
                    if (selectedTech?.id !== tech.id) {
                      e.currentTarget.style.backgroundColor = '#1A2E3A';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedTech?.id !== tech.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <p className="font-semibold text-sm">{tech.name}</p>
                  <p className="text-xs mt-1" style={{ color: '#4A5C6A' }}>{tech.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="lg:col-span-3">
            {statsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#4ECDC4' }} />
                <p style={{ color: '#9BA8AB' }}>Loading statistics...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Total Assigned */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4A5C6A' }}>
                          Total Assigned
                        </p>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#CCD0CF' }}>
                          {stats.totalAssigned}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#1A3A42' }}>
                        <Users className="w-5 h-5" style={{ color: '#4ECDC4' }} />
                      </div>
                    </div>
                  </div>

                  {/* Resolved */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4A5C6A' }}>
                          Resolved
                        </p>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#10b981' }}>
                          {stats.resolvedCount}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#1A3A42' }}>
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                      </div>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4A5C6A' }}>
                          In Progress
                        </p>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#f59e0b' }}>
                          {stats.inProgressCount}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#1A3A42' }}>
                        <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
                      </div>
                    </div>
                  </div>

                  {/* Resolution Rate */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4A5C6A' }}>
                          Resolution Rate
                        </p>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#2563EB' }}>
                          {stats.resolutionRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#1A3A42' }}>
                        <TrendingUp className="w-5 h-5" style={{ color: '#2563EB' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ticket Distribution Pie Chart */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#CCD0CF' }}>
                      Ticket Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={ticketDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ticketDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#11212D', 
                            border: '1px solid #253745',
                            borderRadius: '8px',
                            color: '#CCD0CF'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Average Resolution Time */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#CCD0CF' }}>
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p style={{ color: '#9BA8AB' }}>Average Resolution Time</p>
                          <p className="font-bold" style={{ color: '#CCD0CF' }}>
                            {stats.averageResolutionTimeHours.toFixed(1)} hours
                          </p>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2" style={{ backgroundColor: '#0F1A22' }}>
                          <div 
                            className="bg-gradient-to-r rounded-full h-2 transition-all"
                            style={{ 
                              width: `${Math.min((stats.averageResolutionTimeHours / 72) * 100, 100)}%`,
                              background: 'linear-gradient(to right, #2563EB, #4ECDC4)'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t" style={{ borderColor: '#253745' }}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p style={{ color: '#9BA8AB' }}>Open Tickets</p>
                            <p className="font-bold" style={{ color: '#ef4444' }}>{stats.openCount}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p style={{ color: '#9BA8AB' }}>Resolved Tickets</p>
                            <p className="font-bold" style={{ color: '#10b981' }}>{stats.resolvedCount}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p style={{ color: '#9BA8AB' }}>Total Assigned</p>
                            <p className="font-bold" style={{ color: '#CCD0CF' }}>{stats.totalAssigned}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#CCD0CF' }}>
                    Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs" style={{ color: '#4A5C6A' }}>EFFICIENCY</p>
                      <p className="text-xl font-bold mt-2" style={{ color: '#CCD0CF' }}>
                        {totalTickets > 0 ? ((stats.resolvedCount / totalTickets) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9BA8AB' }}>
                        of assigned tickets completed
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#4A5C6A' }}>AVG RESPONSE TIME</p>
                      <p className="text-xl font-bold mt-2" style={{ color: '#CCD0CF' }}>
                        {stats.averageResolutionTimeHours.toFixed(1)}h
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9BA8AB' }}>
                        to resolve tickets
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#4A5C6A' }}>WORKLOAD</p>
                      <p className="text-xl font-bold mt-2" style={{ color: '#CCD0CF' }}>
                        {stats.totalAssigned}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9BA8AB' }}>
                        total assignments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianPerformance;
