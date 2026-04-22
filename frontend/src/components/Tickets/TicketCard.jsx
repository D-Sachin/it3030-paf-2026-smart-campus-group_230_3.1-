import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
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
      className="flex flex-col h-full cursor-pointer group rounded-2xl p-6 transition-all duration-300"
      style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#9BA8AB'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A5C6A'; e.currentTarget.style.transform = 'translateY(0)'; }}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      {/* Priority + Status row */}
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(ticket.status)}`}>
          {ticket.status?.replace('_', ' ')}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-lg font-bold mb-2 line-clamp-1 transition-colors"
        style={{ color: '#CCD0CF' }}
      >
        {ticket.title}
      </h3>

      {/* Description */}
      <p className="text-sm mb-6 line-clamp-2 flex-1" style={{ color: '#9BA8AB' }}>
        {ticket.description}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-4 mt-auto"
        style={{ borderTop: '1px solid #4A5C6A' }}
      >
        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#9BA8AB' }}>
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </div>
        <div
          className="text-xs font-bold px-2 py-1 rounded"
          style={{ backgroundColor: '#11212D', color: '#9BA8AB' }}
        >
          #{ticket.id}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
