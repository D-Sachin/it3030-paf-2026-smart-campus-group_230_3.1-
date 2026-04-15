import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
<<<<<<< Updated upstream
=======
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
  Loader2,
  MapPin,
  Phone,
  Zap,
  Play,
  CheckCircle,
  XCircle,
  Archive,
  UserPlus,
  UserCheck,
  Inbox
} from 'lucide-react';
>>>>>>> Stashed changes
import ticketService from '../../services/ticketService';
import CommentSection from '../../components/Tickets/CommentSection';
import { getPriorityColor, getStatusColor } from '../../utils/ticketUtils';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Mock roles for UI logic - In a real app, these would come from Auth Context
  const userRole = localStorage.getItem('userRole') || 'ADMIN'; 
  const isAdmin = userRole === 'ADMIN';
  const isTechnician = userRole === 'TECHNICIAN' || userRole === 'ADMIN';

  useEffect(() => {
    fetchTicketDetails();
    fetchTechnicians();
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

  const fetchTechnicians = async () => {
    try {
      const response = await ticketService.getUsersByRole("ADMIN"); // Fetching admins/technicians
      setTechnicians(response.data);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
<<<<<<< Updated upstream
      setStatusUpdateLoading(true);
      // Optional: Ask for resolution notes if status is RESOLVED
      let resolutionNotes = "";
      if (newStatus === "RESOLVED") {
        resolutionNotes = prompt("Enter resolution notes (optional):") || "";
      }
      
      const response = await ticketService.updateTicketStatus(id, newStatus, resolutionNotes);
      setTicket(response.data);
=======
      if (newStatus === "RESOLVED" || newStatus === "REJECTED") {
        const promptMsg = newStatus === "RESOLVED" ? "Enter resolution notes:" : "Enter rejection reason:";
        const notes = prompt(promptMsg) || "";
        if (!notes.trim()) {
          alert("Notes are required for final status transitions.");
          return;
        }
        
        setStatusUpdateLoading(true);
        await ticketService.updateResolutionNotes(id, notes);
      } else {
        setStatusUpdateLoading(true);
      }
      
      await ticketService.updateTicketStatus(id, newStatus);
      await fetchTicketDetails();
>>>>>>> Stashed changes
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

<<<<<<< Updated upstream
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
=======
  const handleAssignTechnician = async (techId) => {
    if (!techId) return;
    
    try {
      setStatusUpdateLoading(true);
      await ticketService.assignTechnician(id, parseInt(techId));
      setIsAssigning(false);
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error assigning technician:', err);
      alert('Failed to assign technician.');
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
      await ticketService.addComment(id, { content });
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      const response = await ticketService.downloadAttachment(id, attachment.id);
=======
      const response = await ticketService.downloadAttachment(attachment.fileName);
>>>>>>> Stashed changes
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
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="relative">
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdateLoading}
              className={`block pl-3 pr-8 py-1.5 text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md appearance-none cursor-pointer transition-colors ${getStatusColor(ticket.status)} ${statusUpdateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            {statusUpdateLoading && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<<<<<<< Updated upstream
        
        {/* Main Content (Left, spans 2 cols) */}
=======
>>>>>>> Stashed changes
        <div className="lg:col-span-2 space-y-8">
          {/* Ticket Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
                <div className="flex gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
<<<<<<< Updated upstream
              <div className="prose max-w-none text-gray-700 leading-relaxed">
=======
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{ticket.title}</h2>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Location: <span className="text-slate-900">{ticket.resourceLocation || "Not specified"}</span></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Contact: <span className="text-slate-900">{ticket.preferredContactDetails || "Not specified"}</span></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Category: <span className="text-slate-900">{ticket.category}</span></span>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
>>>>>>> Stashed changes
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolutionNotes && (
                <div className="mt-6 bg-green-50 rounded-md border border-green-200 p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Resolution Notes</h4>
                  <p className="text-sm text-green-700">{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
<<<<<<< Updated upstream
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-5 pb-3 border-b flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Ticket Details
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                  {ticket.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Priority</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-2">
                <span className="text-gray-500">Created By</span>
                <span className="font-medium text-gray-900">{ticket.createdBy?.name || 'Authorized User'}</span>
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
=======
            
            <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Reported: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <User className="w-4 h-4" />
                <span>Reported By: {ticket.userName}</span>
              </div>
            </div>
          </div>

          <div className="premium-card p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              Resolution Progress
            </h3>
            <CommentSection 
              comments={ticket.comments} 
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              isSubmitting={commentSubmitting}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              Service Status
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(ticket.status).includes('blue') ? 'bg-blue-500' : getStatusColor(ticket.status).includes('emerald') ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="text-sm font-bold text-slate-700">{ticket.status}</span>
                </div>
                <Clock className="w-4 h-4 text-slate-300" />
              </div>

              {isAdmin && !ticket.technicianName?.includes("Unassigned") ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Technician</p>
                        <p className="text-slate-900 font-bold">{ticket.technicianName}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsAssigning(true)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 underline"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              ) : isAdmin ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  {isAssigning ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Technician</label>
                      <select 
                        value={selectedTechId}
                        onChange={(e) => setSelectedTechId(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-primary-500"
                      >
                        <option value="">Choose a technician...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name} ({tech.email})</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAssignTechnician(selectedTechId)}
                          disabled={!selectedTechId || statusUpdateLoading}
                          className="premium-button premium-button-primary py-2 flex-1"
                        >
                          Assign Now
                        </button>
                        <button 
                          onClick={() => setIsAssigning(false)}
                          className="premium-button premium-button-secondary py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-500 text-sm mb-4 font-medium">No technician assigned yet.</p>
                      <button 
                        onClick={() => setIsAssigning(true)}
                        className="premium-button premium-button-primary w-full"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Technician
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technician</p>
                    <p className="text-slate-900 font-bold">{ticket.technicianName || "Unassigned"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {(isAdmin || isTechnician) && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
            <div className="premium-card p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Management Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {ticket.status === 'OPEN' && (
                  <button 
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={statusUpdateLoading}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Start Work</span>
                  </button>
                )}
                
                {(ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN') && (
                  <>
                    <button 
                      onClick={() => handleStatusChange('RESOLVED')}
                      disabled={statusUpdateLoading}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Resolve</span>
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange('REJECTED')}
                      disabled={statusUpdateLoading}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Reject</span>
                    </button>
                  </>
                )}
                
                {ticket.status === 'RESOLVED' && (
                  <button 
                    onClick={() => handleStatusChange('CLOSED')}
                    disabled={statusUpdateLoading}
                    className="col-span-2 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                      <Archive className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Close Ticket Permanently</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-indigo-500" />
              Attachments
            </h3>
            
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="space-y-3">
                {ticket.attachments.map((file) => (
                  <div key={file.id} className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors shadow-sm">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-600 truncate max-w-[150px]">{file.fileName}</span>
                    </div>
                    <button 
                      onClick={() => handleDownloadAttachment(file)}
                      className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
>>>>>>> Stashed changes
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
<<<<<<< Updated upstream
              <p className="text-sm text-gray-500 italic">No attachments provided.</p>
=======
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm italic">No files attached</p>
              </div>
>>>>>>> Stashed changes
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TicketDetails;
