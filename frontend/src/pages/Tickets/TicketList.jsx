import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, Loader2, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import TicketCard from '../../components/Tickets/TicketCard';
import TicketForm from '../../components/Tickets/TicketForm';

const TicketList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets();
      const content = response.data.content ? response.data.content : response.data;
      setTickets(Array.isArray(content) ? content : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (formData, attachments) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const ticketResponse = await ticketService.createTicket(formData);
      const ticketId = ticketResponse.data.id;

      if (attachments.length > 0) {
        for (const file of attachments) {
          await ticketService.uploadAttachment(ticketId, file);
        }
      }

      setIsCreateModalOpen(false);
      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incident Tickets</h1>
          <p className="text-slate-500 mt-1">Manage and track campus facility issues in one place.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="premium-button premium-button-primary"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets by title, ID or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
        <button className="premium-button premium-button-secondary w-full sm:w-auto">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700 animate-fade-in-up">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-medium">Fetching tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="premium-card p-16 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 mb-8">
            {searchTerm ? `We couldn't find any tickets matching "${searchTerm}".` : "There are currently no active tickets in the system."}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="premium-button premium-button-primary"
            >
              <Plus className="w-5 h-5" />
              Create your first ticket
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredTickets.map((ticket) => (
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
