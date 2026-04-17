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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (user.role === 'ADMIN' || user.role === 'TECHNICIAN') {
        response = await ticketService.getAllTickets({
          searchTerm,
          category,
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
  }, [user.id, user.role, searchTerm, category]);

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
      
      // Inject current user ID into form data
      const payload = { ...formData, userId: user.id };
      
      const ticketResponse = await ticketService.createTicket(payload);
      const ticketId = ticketResponse.data.id;

      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          await ticketService.uploadAttachment(ticketId, file);
        }
      }

      setIsCreateModalOpen(false);
      // After creation, navigate to details - which is now role-aware
      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user.role === 'USER' ? 'My Incident Reports' : 'Incident Management'}
          </h1>
          <p className="text-slate-500 mt-1">
            {user.role === 'USER' ? 'Track and manage your submitted campus issues.' : 'Monitor and resolve facility issues across the campus.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchTickets}
            className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary-600 transition-all hover:shadow-md"
            title="Refresh List"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="premium-button premium-button-primary"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Filters & Search - Only for Admins/Techs or broad search */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title, location or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 lg:w-48 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
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
          <p className="text-slate-500 font-medium font-bold uppercase tracking-widest text-[10px]">Updating Queue...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="premium-card p-16 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 mb-8 max-w-sm font-medium">
            {searchTerm || category ? `We couldn't find any tickets matching your filters.` : "There are currently no active tickets in your queue."}
          </p>
          {(!searchTerm && !category) && (
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
