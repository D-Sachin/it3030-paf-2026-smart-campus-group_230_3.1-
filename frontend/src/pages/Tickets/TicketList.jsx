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
  const [showAssignedOnly, setShowAssignedOnly] = useState(user.role === 'TECHNICIAN');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAdmin = user.role === 'ADMIN';
  const isTechnician = user.role === 'TECHNICIAN';
  const isStudent = user.role === 'USER';

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (user.role === 'ADMIN' || user.role === 'TECHNICIAN') {
        response = await ticketService.getAllTickets({
          searchTerm,
          category,
          status: statusFilter,
          technicianId: (isTechnician && showAssignedOnly) ? user.id : undefined,
          sortBy: "createdAt",
          sortDirection: "desc"
        });
      } else {
        // For Students/Users: Fetch their own tickets
        response = await ticketService.getTicketsByUserId(user.id);
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
  }, [user.id, user.role, searchTerm, category, statusFilter, showAssignedOnly, isTechnician]);

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
    ADMIN:       { title: 'Incident Management',    subtitle: 'Review, assign, and resolve all campus incident reports.', accent: 'bg-violet-600' },
    TECHNICIAN:  { title: 'My Work Queue',           subtitle: 'Manage and resolve assigned maintenance incidents.',          accent: 'bg-amber-500' },
    USER:        { title: 'My Incident Reports',     subtitle: 'Track and manage your submitted campus issues.',             accent: 'bg-primary-600' },
  };
  const { title, subtitle, accent } = headerConfig[user.role] || headerConfig.USER;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl text-white ${accent}`}>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 opacity-80 text-sm">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchTickets}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
            title="Refresh"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {/* Only students and admins can create new tickets */}
          {(isStudent || isAdmin) && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="premium-button bg-white text-slate-800 hover:bg-slate-50"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title, location or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer w-44"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status filter — only for Admin and Technician */}
        {(isAdmin || isTechnician) && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer w-40"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}

        {/* Technician-specific Assigned Toggle */}
        {isTechnician && (
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setShowAssignedOnly(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                showAssignedOnly 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setShowAssignedOnly(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !showAssignedOnly 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
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
