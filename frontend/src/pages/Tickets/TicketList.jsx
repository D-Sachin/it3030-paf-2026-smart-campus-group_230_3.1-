import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Inbox, 
  Loader2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import TicketCard from '../../components/Tickets/TicketCard';
import TicketForm from '../../components/Tickets/TicketForm';
import { useUser } from '../../context/UserContext';

const TicketList = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState(user.role === 'TECHNICIAN' ? 'OPEN' : '');
  const [dateFilter, setDateFilter] = useState('today');
  const [showAssignedOnly, setShowAssignedOnly] = useState(user.role === 'TECHNICIAN');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getDateRange = useCallback((filter) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    const formatLocalISO = (date) => {
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    
    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { startDate: formatLocalISO(start), endDate: formatLocalISO(now) };
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const endYesterday = new Date(start);
        endYesterday.setHours(23, 59, 59, 999);
        return { startDate: formatLocalISO(start), endDate: formatLocalISO(endYesterday) };
      case 'week':
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { startDate: formatLocalISO(start), endDate: formatLocalISO(now) };
      case 'month':
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        return { startDate: formatLocalISO(start), endDate: formatLocalISO(now) };
      default:
        return { startDate: undefined, endDate: undefined };
    }
  }, []);

  const isAdmin = user.role === 'ADMIN';
  const isTechnician = user.role === 'TECHNICIAN';
  const isStudent = user.role === 'USER';

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { startDate, endDate } = getDateRange(dateFilter);
      
      let response;

      if (user.role === 'ADMIN' || user.role === 'TECHNICIAN') {
        response = await ticketService.getAllTickets({
          searchTerm,
          category,
          status: statusFilter,
          technicianId: (isTechnician && showAssignedOnly) ? user.id : undefined,
          sortBy: "createdAt",
          sortDirection: "desc",
          startDate,
          endDate
        });
      } else {
        // For Students/Users: Fetch their own tickets with filters
        response = await ticketService.getTicketsByUserId(user.id, {
          searchTerm,
          category,
          status: statusFilter,
          startDate,
          endDate
        });
      }
      
      const data = response.data;
      const content = data.content !== undefined ? data.content : (Array.isArray(data) ? data : []);
      
      setTickets(content);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user.id, user.role, searchTerm, category, statusFilter, dateFilter, showAssignedOnly, isTechnician, getDateRange]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const categories = [
    "Maintenance",
    "IT Support",
    "Security",
    "Cleaning",
    "Other"
  ];

  const handleCreateSubmit = async (formData, attachments) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Inject current user ID into form data (coerce to int to ensure type safety)
      const payload = { ...formData, userId: parseInt(user.id) };
      
      const ticketResponse = await ticketService.createTicket(payload);
      const ticketId = ticketResponse?.data?.id;

      if (ticketId && attachments && attachments.length > 0) {
        for (const file of attachments) {
          await ticketService.uploadAttachment(ticketId, file);
        }
      }

      setIsCreateModalOpen(false);
      // Refresh the ticket list instead of navigating (avoids /tickets/undefined crash)
      await fetchTickets();
      // Navigate to ticket detail only if we have a valid ID
      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role-based header config
  const headerConfig = {
    ADMIN:      { title: 'Incident Management',   subtitle: 'Review, assign, and resolve all campus incident reports.' },
    TECHNICIAN: { title: 'My Work Queue',          subtitle: 'Manage and resolve assigned maintenance incidents.' },
    USER:       { title: 'My Incident Reports',    subtitle: 'Track and manage your submitted campus issues.' },
  };
  const { title, subtitle, accent } = headerConfig[user.role] || headerConfig.USER;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #11212D 0%, #253745 100%)', border: '1px solid #4A5C6A' }}
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#CCD0CF' }}>{title}</h1>
          <p className="mt-1 text-sm" style={{ color: '#9BA8AB' }}>{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTickets}
            className="p-3 rounded-xl transition-all"
            style={{ backgroundColor: '#4A5C6A', color: '#CCD0CF' }}
            title="Refresh"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {(isStudent || isAdmin) && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="premium-button"
              style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 rounded-2xl"
        style={{ backgroundColor: '#06141B', border: '1px solid #253745' }}
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA8AB' }} />
          <input
            type="text"
            placeholder="Search by title, location or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all font-medium"
            style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#CCD0CF' }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer w-44"
          style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#9BA8AB' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer w-40"
          style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#9BA8AB' }}
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">Last Month</option>
          <option value="all">All Time</option>
        </select>

        {(isAdmin || isTechnician) && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer w-40"
            style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#9BA8AB' }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}

        {isTechnician && (
          <div className="flex p-1 rounded-xl" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
            <button
              onClick={() => setShowAssignedOnly(true)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={showAssignedOnly
                ? { backgroundColor: '#1c4f78', color: '#CCD0CF' }
                : { color: '#9BA8AB' }}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setShowAssignedOnly(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={!showAssignedOnly
                ? { backgroundColor: '#1c4f78', color: '#CCD0CF' }
                : { color: '#9BA8AB' }}
            >
              All Public Tickets
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700 animate-fade-in-up">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{error}</span>
          <button onClick={fetchTickets} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="premium-card p-16 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 mb-8 max-w-sm font-medium">
            {searchTerm || category || statusFilter
              ? `No tickets match your current filters.`
              : isStudent
              ? "You haven't reported any incidents yet."
              : isTechnician
              ? "There are no tickets assigned to you yet."
              : "There are currently no incident tickets in the system."
            }
          </p>
          {/* Only students see 'Report Incident' in empty state */}
          {isStudent && !searchTerm && !category && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="premium-button premium-button-primary"
            >
              <Plus className="w-5 h-5" />
              Report Your First Incident
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <TicketForm 
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default TicketList;
