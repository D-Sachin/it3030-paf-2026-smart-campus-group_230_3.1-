import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { getPriorityColor, getStatusColor } from '../../utils/ticketUtils';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div 
      className="premium-card p-6 flex flex-col h-full cursor-pointer group"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(ticket.status)}`}>
          {ticket.status?.replace('_', ' ')}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-1">
        {ticket.title}
      </h3>
      
      <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">
        {ticket.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </div>
        <div className="text-slate-400 text-xs font-bold bg-slate-50 px-2 py-1 rounded">
          #{ticket.id}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
