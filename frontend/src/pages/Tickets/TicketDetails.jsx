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
  X,
  ChevronDown,
  Lock,
  AlertTriangle,
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
  Pencil,
  History
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import CommentSection from '../../components/Tickets/CommentSection';
import { useUser } from '../../context/UserContext';
import { getPriorityColor, getStatusColor } from '../../utils/ticketUtils';

const TicketDetails = () => {
  const { user: currentUser } = useUser();
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
        const promptMsg = newStatus === "RESOLVED" ? "Enter resolution notes (optional):" : "Enter rejection reason:";
        const notes = window.prompt(promptMsg) || (newStatus === "RESOLVED" ? "Resolved by technician." : "No reason provided.");
        
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const host = baseUrl.split('/api')[0];
    return `${host}${url}`;
  };

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
      await ticketService.updateTicket(id, {
        ...editForm,
        userId: currentUser?.id,
      });

      if (editNewAttachments.length > 0) {
        for (const file of editNewAttachments) {
          await ticketService.uploadAttachment(id, file);
        }
      }

      setIsEditing(false);
      setEditNewAttachments([]);
      await fetchTicketDetails();
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert(err?.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1c4f78' }} />
        <p className="font-medium" style={{ color: '#9BA8AB' }}>Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="rounded-2xl p-6 flex flex-col items-center gap-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="font-medium text-center" style={{ color: '#ef4444' }}>{error || 'Ticket not found'}</p>
          <button onClick={() => navigate('/tickets')} className="premium-button" style={{ backgroundColor: '#253745', color: '#CCD0CF' }}>
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
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 backdrop-blur-sm overflow-y-auto"
          style={{ backgroundColor: 'rgba(6, 20, 27, 0.85)' }}
        >
          <div 
            className="rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col my-8 overflow-hidden animate-in fade-in slide-in-from-top-10 duration-300" 
            style={{ maxHeight: '78vh', backgroundColor: '#11212D', border: '1px solid #253745' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 flex-shrink-0" style={{ borderBottom: '1px solid #253745' }}>
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#CCD0CF' }}>
                <Pencil className="w-5 h-5" style={{ color: '#1c4f78' }} />
                Edit Ticket
              </h3>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2 transition-colors"
                style={{ color: '#9BA8AB' }}
                onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
                onMouseLeave={e => e.currentTarget.style.color = '#9BA8AB'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-8 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4A5C6A' }}>Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium"
                  style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4A5C6A' }}>Description</label>
                <textarea
                  rows={4}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium resize-none leading-relaxed"
                  style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4A5C6A' }}>Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium appearance-none"
                    style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                  >
                    <option value="Maintenance" style={{ backgroundColor: '#11212D' }}>Maintenance</option>
                    <option value="IT Support" style={{ backgroundColor: '#11212D' }}>IT Support</option>
                    <option value="Security" style={{ backgroundColor: '#11212D' }}>Security</option>
                    <option value="Cleaning" style={{ backgroundColor: '#11212D' }}>Cleaning</option>
                    <option value="Other" style={{ backgroundColor: '#11212D' }}>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4A5C6A' }}>Priority</label>
                  <select
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium appearance-none"
                    style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                  >
                    <option value="LOW" style={{ backgroundColor: '#11212D' }}>Low</option>
                    <option value="MEDIUM" style={{ backgroundColor: '#11212D' }}>Medium</option>
                    <option value="HIGH" style={{ backgroundColor: '#11212D' }}>High</option>
                    <option value="CRITICAL" style={{ backgroundColor: '#11212D' }}>Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4A5C6A' }}>Resource Location <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.resourceLocation || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, resourceLocation: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium"
                  style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#4A5C6A' }}>Preferred Contact <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.preferredContactDetails || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, preferredContactDetails: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium"
                  style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4A5C6A' }}>Attachments</label>

                {/* Existing attachments */}
                {editExistingAttachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {editExistingAttachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl transition-all" style={{ backgroundColor: '#06141B', border: '1px solid #253745' }}>
                        <div className="flex items-center gap-2">
                          {isImageFile(att.fileName) ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border shadow-sm flex-shrink-0" style={{ borderColor: '#253745', backgroundColor: '#11212D' }}>
                              <img src={resolveFileUrl(att.fileUrl)} alt={att.fileName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <Paperclip className="w-4 h-4" style={{ color: '#4A5C6A' }} />
                          )}
                          <span className="text-sm font-medium truncate max-w-[220px]" style={{ color: '#CCD0CF' }}>{att.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingAttachment(att.id)}
                          className="p-1.5 hover:text-red-500 rounded-lg transition-all"
                          style={{ color: '#4A5C6A' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Attachment */}
                {(editExistingAttachments.length + editNewAttachments.length) < 3 && (
                  <label 
                    className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-xl cursor-pointer transition-all"
                    style={{ backgroundColor: '#06141B', borderColor: '#253745', color: '#9BA8AB' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2d70a3'; e.currentTarget.style.color = '#CCD0CF'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#253745'; e.currentTarget.style.color = '#9BA8AB'; }}
                  >
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
            <div className="flex items-center justify-end gap-3 px-8 py-5 flex-shrink-0" style={{ borderTop: '1px solid #253745' }}>
              <button onClick={() => setIsEditing(false)} className="premium-button" style={{ backgroundColor: '#253745', color: '#CCD0CF' }} disabled={editSaving}>Cancel</button>
              <button 
                onClick={handleEditSave} 
                disabled={editSaving || !editForm.title?.trim() || !editForm.resourceLocation?.trim()} 
                className="premium-button"
                style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
              >
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link to="/tickets" className="flex items-center gap-2 transition-colors font-medium" style={{ color: '#9BA8AB' }} onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'} onMouseLeave={e => e.currentTarget.style.color = '#9BA8AB'}>
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        
        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all"
              style={{ backgroundColor: 'rgba(45, 112, 163, 0.15)', color: '#1c4f78', borderColor: 'rgba(45, 112, 163, 0.3)' }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Ticket
            </button>
          )}
          <span className="text-sm font-bold" style={{ color: '#4A5C6A' }}>STATUS</span>
          {(isAdmin || (isTechnician && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED')) ? (
            <div className="flex items-center gap-2 relative">
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdateLoading}
                className={`px-4 py-2 rounded-xl text-sm font-bold border outline-none cursor-pointer transition-all appearance-none pr-10 ${getStatusColor(ticket.status)}`}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'currentColor' }} />
              {statusUpdateLoading && <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1c4f78' }} />}
            </div>
          ) : (
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority} PRIORITY
                </span>
                <span style={{ color: '#4A5C6A' }}>•</span>
                <span className="text-sm font-medium" style={{ color: '#9BA8AB' }}>#{ticket.id}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#CCD0CF' }}>{ticket.title}</h2>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#4A5C6A' }} />
                  <span className="text-xs font-bold" style={{ color: '#9BA8AB' }}>Location: <span style={{ color: '#CCD0CF' }}>{ticket.resourceLocation || "Not specified"}</span></span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#4A5C6A' }} />
                  <span className="text-xs font-bold" style={{ color: '#9BA8AB' }}>Contact: <span style={{ color: '#CCD0CF' }}>{ticket.preferredContactDetails || "Not specified"}</span></span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: '#4A5C6A' }} />
                  <span className="text-xs font-bold" style={{ color: '#9BA8AB' }}>Category: <span style={{ color: '#CCD0CF' }}>{ticket.category}</span></span>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl border leading-relaxed" style={{ backgroundColor: 'rgba(6, 20, 27, 0.4)', borderColor: '#4A5C6A', color: '#CCD0CF' }}>
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolutionNotes && (
                <div className={`mt-8 rounded-2xl border p-6 shadow-sm`} style={{ backgroundColor: ticket.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderColor: ticket.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    {ticket.status === 'REJECTED' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: ticket.status === 'REJECTED' ? '#ef4444' : '#10b981' }}>
                      {ticket.status === 'REJECTED' ? 'Rejection Reason' : 'Resolution Finalized'}
                    </h4>
                  </div>
                  <p className="leading-relaxed font-medium" style={{ color: '#CCD0CF' }}>{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
            
            <div className="px-8 py-5 border-t flex flex-wrap gap-6 items-center" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#9BA8AB' }}>
                <Calendar className="w-4 h-4" />
                <span>Reported: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#9BA8AB' }}>
                <User className="w-4 h-4" />
                <span>By: {ticket.userName}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
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
          <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#CCD0CF' }}>
              <ShieldCheck className="w-5 h-5" style={{ color: '#1c4f78' }} />
              Service Status
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(ticket.status).includes('blue') ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <span className="text-sm font-bold" style={{ color: '#CCD0CF' }}>{ticket.status}</span>
                </div>
                <Clock className="w-4 h-4" style={{ color: '#4A5C6A' }} />
              </div>

              {isAdmin ? (
                <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 112, 163, 0.15)', color: '#1c4f78' }}>
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Technician</p>
                          <p className="font-bold" style={{ color: '#CCD0CF' }}>{ticket.technicianName?.includes("Unassigned") ? "Unassigned" : ticket.technicianName}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsAssigning(!isAssigning)} className="text-xs font-bold transition-colors" style={{ color: '#1c4f78' }}>{isAssigning ? 'Cancel' : 'Change'}</button>
                    </div>

                    {isAssigning && (
                      <div className="space-y-4 mt-4 pt-4" style={{ borderTop: '1px solid #253745' }}>
                        <select 
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl font-bold outline-none border transition-all"
                          style={{ backgroundColor: '#06141B', borderColor: '#253745', color: '#CCD0CF' }}
                        >
                          <option value="" style={{ backgroundColor: '#11212D' }}>Choose a technician...</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id} style={{ backgroundColor: '#11212D' }}>{tech.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssignTechnician(selectedTechId)}
                          disabled={!selectedTechId || statusUpdateLoading}
                          className="premium-button w-full"
                          style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
                        >
                          Assign Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 flex items-center gap-3 border" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#06141B', color: '#4A5C6A' }}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Technician</p>
                    <p className="font-bold" style={{ color: '#CCD0CF' }}>{ticket.technicianName || "Unassigned"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Transition Actions */}
          {((currentUser?.role === 'ADMIN') || (currentUser?.role === 'TECHNICIAN' && (!ticket.technicianId || ticket.technicianId == currentUser.id))) && 
           (ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED') && (
            <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#CCD0CF' }}>
                <Zap className="w-5 h-5 text-amber-500" />
                Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ticket.status === 'OPEN' && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-300 group hover:border-blue-500/50 hover:bg-blue-500/5"
                    style={{ borderColor: '#2A3C46' }}
                  >
                    <div className="p-3 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <Play className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: '#9BA8AB' }}>
                      Start Work
                    </span>
                  </button>
                )}

                {ticket.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('RESOLVED')}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-300 group hover:border-green-500/50 hover:bg-green-500/5"
                      style={{ borderColor: '#2A3C46' }}
                    >
                      <div className="p-3 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: '#9BA8AB' }}>
                        Mark Resolved
                      </span>
                    </button>
                  </>
                )}



                {currentUser?.role === 'ADMIN' && (ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED') && (
                  <>
                    <button
                      onClick={() => handleStatusChange('CLOSED')}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-300 group hover:border-purple-500/50 hover:bg-purple-500/5"
                      style={{ borderColor: '#2A3C46' }}
                    >
                      <div className="p-3 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                        <Lock className="w-6 h-6 text-purple-500" />
                      </div>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: '#9BA8AB' }}>
                        Close Ticket
                      </span>
                    </button>

                    <button
                      onClick={() => handleStatusChange('REJECTED')}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-300 group hover:border-red-500/50 hover:bg-red-500/5"
                      style={{ borderColor: '#2A3C46' }}
                    >
                      <div className="p-3 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: '#9BA8AB' }}>
                        Reject
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#CCD0CF' }}>
              <History className="w-5 h-5" style={{ color: '#1c4f78' }} />
              Status History
            </h3>
            
            {ticket.statusHistory && ticket.statusHistory.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-gray-700/50">
                {ticket.statusHistory.map((history, idx) => (
                  <div key={history.id || idx} className="relative pl-12">
                    <div className="absolute left-3 top-0 w-4 h-4 rounded-full border-4 border-[#253745] z-10" style={{ backgroundColor: getStatusColor(history.status).split(' ')[0] === 'text-blue-500' ? '#3B82F6' : '#10B981' }} />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md border" style={{ color: '#CCD0CF', borderColor: '#4A5C6A', backgroundColor: '#11212D' }}>
                          {history.status}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: '#4A5C6A' }}>
                          {new Date(history.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium" style={{ color: '#9BA8AB' }}>
                        By <span style={{ color: '#CCD0CF' }}>{history.changedByName}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center italic text-sm" style={{ color: '#4A5C6A' }}>No status changes recorded</p>
            )}
          </div>

          <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#253745', border: '1px solid #4A5C6A' }}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#CCD0CF' }}>
              <Paperclip className="w-5 h-5" style={{ color: '#1c4f78' }} />
              Attachments
            </h3>
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {ticket.attachments.map((file) => (
                  <div key={file.id} className="group relative overflow-hidden rounded-xl border transition-all" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
                    {isImageFile(file.fileName) ? (
                      <div className="aspect-square w-full cursor-zoom-in overflow-hidden" onClick={() => setViewingImageUrl(resolveFileUrl(file.fileUrl))}>
                        <img src={resolveFileUrl(file.fileUrl)} alt={file.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download className="w-6 h-6 text-white" onClick={(e) => { e.stopPropagation(); handleDownloadAttachment(file); }} />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square w-full flex flex-col items-center justify-center p-3 text-center gap-2">
                        <Paperclip className="w-6 h-6" style={{ color: '#4A5C6A' }} />
                        <span className="text-[10px] font-bold uppercase truncate w-full px-1" style={{ color: '#9BA8AB' }}>{file.fileName}</span>
                        <Download className="w-4 h-4 cursor-pointer transition-colors" style={{ color: '#4A5C6A' }} onClick={() => handleDownloadAttachment(file)} onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'} onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center italic text-sm" style={{ color: '#4A5C6A' }}>No files attached</p>
            )}
          </div>
        </div>
      </div>

      {viewingImageUrl && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-10 animate-in fade-in duration-300" style={{ backgroundColor: 'rgba(6, 20, 27, 0.95)' }}>
          <button onClick={() => setViewingImageUrl(null)} className="absolute top-6 right-6 p-3 rounded-full hover:rotate-90 duration-300 z-[110]" style={{ color: '#CCD0CF', backgroundColor: 'rgba(255,255,255,0.1)' }}><X className="w-6 h-6" /></button>
          <img src={viewingImageUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
