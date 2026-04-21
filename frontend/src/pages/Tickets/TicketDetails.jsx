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
  Inbox,
  Pencil,
  X
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import CommentSection from '../../components/Tickets/CommentSection';
import { useUser } from '../../context/UserContext';
import { getPriorityColor, getStatusColor } from '../../utils/ticketUtils';

const TicketDetails = () => {
  const { user: currentUser } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  // ... state ...
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [viewingImageUrl, setViewingImageUrl] = useState(null);
  const [editExistingAttachments, setEditExistingAttachments] = useState([]);
  const [editNewAttachments, setEditNewAttachments] = useState([]);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isTechnician = currentUser?.role === 'TECHNICIAN';
  const isOwner = ticket && currentUser && (ticket.userId === currentUser.id || ticket.userEmail === currentUser.email);
  const canEdit = isOwner && ticket?.status === 'OPEN';

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
      const response = await ticketService.getUsersByRole("TECHNICIAN");
      setTechnicians(response.data);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
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
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status. Ensure you have the correct permissions.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

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

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const resolveFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Backend API is at http://localhost:8080/api
    // Prepend the origin for the browser to find it
    return `http://localhost:8080${url}`;
  };

  // Helper component for safe image preview from File object
  const ImagePreview = ({ file, className }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    useEffect(() => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);
    if (!previewUrl) return null;
    return <img src={previewUrl} alt={file.name} className={className} />;
  };

  const handleAddComment = async (content) => {
    try {
      setCommentSubmitting(true);
      await ticketService.addComment(id, content, currentUser?.id);
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

  const openEditModal = () => {
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      resourceLocation: ticket.resourceLocation || '',
      preferredContactDetails: ticket.preferredContactDetails || '',
    });
    setEditExistingAttachments(ticket.attachments ? [...ticket.attachments] : []);
    setEditNewAttachments([]);
    setIsEditing(true);
  };

  const handleDeleteExistingAttachment = async (attachmentId) => {
    try {
      await ticketService.deleteAttachment(id, attachmentId);
      setEditExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Error deleting attachment:', err);
      alert('Failed to delete attachment.');
    }
  };

  const handleEditSave = async () => {
    try {
      setEditSaving(true);
      console.log('Starting ticket update with data:', editForm);
      await ticketService.updateTicket(id, {
        ...editForm,
        userId: currentUser?.id,
      });
      console.log('Ticket metadata updated successfully');

      // Upload any new attachments
      if (editNewAttachments.length > 0) {
        console.log(`Uploading ${editNewAttachments.length} new attachments...`);
        for (const file of editNewAttachments) {
          await ticketService.uploadAttachment(id, file);
        }
        console.log('Attachments uploaded successfully');
      }

      setIsEditing(false);
      setEditNewAttachments([]);
      await fetchTicketDetails();
      console.log('Refreshed ticket details');
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert(err?.response?.data?.message || 'Failed to update ticket. Make sure you are the ticket owner and the ticket is still OPEN.');
    } finally {
      setEditSaving(false);
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
    <div className="space-y-8 animate-fade-in-up">
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col my-8 overflow-hidden animate-in fade-in slide-in-from-top-10 duration-300" style={{maxHeight: '78vh'}}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary-500" />
                Edit Ticket
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-8 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Security">Security</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Priority</label>
                  <select
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              {/* Location & Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Resource Location <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.resourceLocation || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, resourceLocation: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Contact <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.preferredContactDetails || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, preferredContactDetails: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Attachments</label>

                {/* Existing attachments */}
                {editExistingAttachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {editExistingAttachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          {isImageFile(att.fileName) ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm flex-shrink-0 bg-slate-200">
                              <img 
                                src={resolveFileUrl(att.fileUrl)} 
                                alt={att.fileName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40?text=IMG';
                                }}
                              />
                            </div>
                          ) : (
                            <Paperclip className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-sm font-medium text-slate-600 truncate max-w-[220px]">{att.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingAttachment(att.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New attachments queued */}
                {editNewAttachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {editNewAttachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-100">
                        <div className="flex items-center gap-2">
                          {isImageFile(file.name) ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary-100 shadow-sm flex-shrink-0 bg-primary-100">
                              <ImagePreview file={file} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <Paperclip className="w-4 h-4 text-primary-400" />
                          )}
                          <span className="text-sm font-medium text-primary-700 truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[10px] font-bold text-primary-400 uppercase">New</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditNewAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new file button */}
                {(editExistingAttachments.length + editNewAttachments.length) < 3 && (
                  <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all text-slate-500 hover:text-primary-600">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm font-medium">Add attachment (max 3 total)</span>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const slots = 3 - editExistingAttachments.length - editNewAttachments.length;
                        setEditNewAttachments(prev => [...prev, ...files.slice(0, slots)]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setIsEditing(false)}
                className="premium-button premium-button-secondary"
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editForm.title?.trim() || !editForm.resourceLocation?.trim() || !editForm.preferredContactDetails?.trim()}
                className="premium-button premium-button-primary"
              >
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/tickets" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        
        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 font-bold text-sm hover:bg-primary-100 hover:border-primary-300 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Ticket
            </button>
          )}
          <span className="text-sm font-bold text-slate-400">STATUS</span>
          {(isAdmin || isTechnician) ? (
            <>
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
            </>
          ) : (
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              currentUser={currentUser}
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

            {/* SLA Performance Section */}
            {(ticket.timeToFirstResponse || ticket.timeToResolution) && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">SLA Performance</h4>
                <div className="space-y-3">
                  {ticket.timeToFirstResponse && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-medium text-slate-600">Response Time</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{ticket.timeToFirstResponse}</span>
                    </div>
                  )}
                  {ticket.timeToResolution && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-medium text-slate-600">Resolution Time</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{ticket.timeToResolution}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <div className="grid grid-cols-2 gap-3">
                {ticket.attachments.map((file) => (
                  <div key={file.id} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white hover:border-primary-200 transition-all shadow-sm">
                    {isImageFile(file.fileName) ? (
                      <div 
                        className="aspect-square w-full bg-slate-50 cursor-zoom-in overflow-hidden"
                        onClick={() => setViewingImageUrl(resolveFileUrl(file.fileUrl))}
                      >
                        <img 
                          src={resolveFileUrl(file.fileUrl)} 
                          alt={file.fileName} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download 
                            className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition-transform" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAttachment(file);
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square w-full flex flex-col items-center justify-center p-3 text-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 truncate w-full uppercase px-1">{file.fileName}</span>
                        <Download 
                          className="w-4 h-4 text-slate-300 hover:text-primary-500 cursor-pointer transition-colors mt-1" 
                          onClick={() => handleDownloadAttachment(file)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm italic">No files attached</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Image Lightbox */}
      {viewingImageUrl && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <button 
            onClick={() => setViewingImageUrl(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 hover:rotate-90 duration-300 z-[110]"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="absolute inset-0 z-[105]" 
            onClick={() => setViewingImageUrl(null)}
          />

          <div className="relative max-w-5xl w-full h-full flex items-center justify-center z-[110]">
            <img 
              src={viewingImageUrl} 
              alt="Viewing attachment" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500 select-none pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
