import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Paperclip, 
  MessageSquare,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import CommentSection from '../../components/Tickets/CommentSection';
import { getPriorityColor, getStatusColor } from '../../utils/ticketUtils';

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
      
      // Update basic status
      await ticketService.updateTicketStatus(id, newStatus);
      
      // Handle Resolution/Rejection Notes
      if (newStatus === "RESOLVED" || newStatus === "REJECTED") {
        const promptMsg = newStatus === "RESOLVED" ? "Enter resolution notes:" : "Enter rejection reason:";
        const notes = prompt(promptMsg) || "";
        if (notes.trim()) {
          await ticketService.updateResolutionNotes(id, notes);
        }
      }
      
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status. Ensure you have the correct permissions.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleAssignTechnician = async () => {
    const techId = prompt("Enter Technician ID to assign (e.g., 101):");
    if (!techId) return;
    
    try {
      setStatusUpdateLoading(true);
      await ticketService.assignTechnician(id, parseInt(techId));
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error assigning technician:', err);
      alert('Failed to assign technician. Ensure the ID is valid.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await ticketService.updateComment(commentId, newContent);
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Permanently delete this progress update?")) return;
    try {
      await ticketService.deleteComment(commentId);
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment.');
    }
  };

  const handleAddComment = async (content) => {
    try {
      setCommentSubmitting(true);
      // Fixed: Backend expects { content: "..." }
      await ticketService.addComment(id, content);
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
      // Fixed: downloadAttachment now takes the fileName
      const response = await ticketService.downloadAttachment(attachment.fileName);
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
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-red-700 font-medium text-center">{error || 'Ticket not found'}</p>
          <button onClick={() => navigate('/tickets')} className="premium-button premium-button-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/tickets" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400">STATUS</span>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdateLoading}
            className={`px-4 py-2 rounded-xl text-sm font-bold border outline-none cursor-pointer transition-all ${getStatusColor(ticket.status)} ${statusUpdateLoading ? 'opacity-50' : 'hover:shadow-md'}`}
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          {statusUpdateLoading && <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="premium-card overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority} PRIORITY
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-sm font-medium">#{ticket.id}</span>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{ticket.title}</h2>
              
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolutionNotes && (
                <div className={`mt-8 rounded-2xl border p-6 shadow-sm ${ticket.status === 'REJECTED' ? 'bg-red-50 border-red-100 shadow-red-100/50' : 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {ticket.status === 'REJECTED' ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${ticket.status === 'REJECTED' ? 'text-red-900' : 'text-emerald-900'}`}>
                      {ticket.status === 'REJECTED' ? 'Rejection Reason' : 'Resolution Finalized'}
                    </h4>
                  </div>
                  <p className={`leading-relaxed font-medium ${ticket.status === 'REJECTED' ? 'text-red-700' : 'text-emerald-700'}`}>{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Reported: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Tag className="w-4 h-4" />
                <span>Category: {ticket.category || 'Maintenance'}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection 
            comments={ticket.comments || []} 
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            isSubmitting={commentSubmitting}
          />
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Support Team / Technician */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Support Engagement
              </h3>
              <button 
                onClick={handleAssignTechnician}
                className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg transition-colors border border-primary-100"
              >
                Assign
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Personnel Assigned</p>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-primary-100">
                    {ticket.technicianName?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block leading-none">{ticket.technicianName || 'Standby'}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Certified Personnel</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2">REPORTED BY</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs text-uppercase">
                    {ticket.userName?.substring(0, 2).toUpperCase() || 'AU'}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{ticket.userName || 'Authorized User'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Artifacts ({ticket.attachments?.length || 0})
              </h3>
            </div>
            
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="space-y-3">
                {ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary-600">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 truncate line-clamp-1 pr-2" title={attachment.fileName}>
                        {attachment.fileName}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-400 font-medium italic">No evidence provided.</p>
              </div>
            )}
          </div>

          <div className="premium-card p-6 bg-primary-900 text-white border-none shadow-primary-100">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Need Assistance?
            </h4>
            <p className="text-primary-100 text-xs leading-relaxed opacity-80 mb-4">
              If this incident requires immediate attention, please contact the campus security office directly.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 transition-all rounded-lg text-xs font-bold ring-1 ring-white/20">
              View Emergency Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
