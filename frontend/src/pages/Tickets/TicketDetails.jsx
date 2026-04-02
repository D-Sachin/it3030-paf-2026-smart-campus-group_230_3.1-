import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import CommentSection from '../../components/Tickets/CommentSection';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(id);
      setTicket(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      // Optional: Ask for resolution notes if status is RESOLVED
      let resolutionNotes = "";
      if (newStatus === "RESOLVED") {
        resolutionNotes = prompt("Enter resolution notes (optional):") || "";
      }
      
      const response = await ticketService.updateTicketStatus(id, newStatus, resolutionNotes);
      setTicket(response.data);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleAddComment = async (text) => {
    try {
      setCommentSubmitting(true);
      // Create a comment payload mapping expected backend format
      const payload = {
        text: text,
        // The backend might deduce author from authenticated user implicitly.
        authorId: 1 // Default fallback id
      };
      const response = await ticketService.addComment(id, payload);
      // Wait, backend response might be the newly added Comment or the updated Ticket.
      // Easiest is to just re-fetch the ticket details to get the full updated state.
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await ticketService.downloadAttachment(id, attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      alert('Failed to download attachment.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error || 'Ticket not found'}</p>
          <button onClick={() => navigate('/tickets')} className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            &larr; Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/tickets" className="text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
        </div>
        
        {/* Status Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Update Status:</span>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdateLoading}
            className="block pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left, spans 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ticket Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{ticket.title}</h2>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolutionNotes && (
                <div className="mt-6 bg-green-50 rounded-md border border-green-200 p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Resolution Notes</h4>
                  <p className="text-sm text-green-700">{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
              <span>Reported on: {formattedDate}</span>
              <span>Category ID: {ticket.categoryId || 'N/A'}</span>
            </div>
          </div>

          {/* Comment Section Component */}
          <CommentSection 
            comments={ticket.comments || []} 
            onAddComment={handleAddComment}
            isSubmitting={commentSubmitting}
          />
        </div>

        {/* Sidebar Space (Right, 1 col) */}
        <div className="space-y-6">
          {/* Attributes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${ticket.status === 'RESOLVED' ? 'text-green-600' : 'text-gray-900'}`}>{ticket.status?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className="font-medium text-gray-900">{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created By</span>
                <span className="font-medium text-gray-900">{ticket.createdBy?.name || 'User'}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center justify-between">
              Attachments 
              <span className="text-xs bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full">
                {ticket.attachments?.length || 0}
              </span>
            </h3>
            
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <ul className="space-y-3">
                {ticket.attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between group">
                    <div className="flex items-center flex-1 min-w-0 pr-2">
                      <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate line-clamp-1" title={attachment.fileName}>
                        {attachment.fileName}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No attachments provided.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TicketDetails;
