import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock, Loader2 } from 'lucide-react';

const CommentSection = ({ 
  comments = [], 
  onAddComment, 
  onUpdateComment, 
  onDeleteComment, 
  isSubmitting = false,
  currentUser = null
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && !isSubmitting) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content || comment.text);
  };

  const handleEditSave = (commentId) => {
    if (editingContent.trim()) {
      onUpdateComment(commentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent("");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formattedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="premium-card p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Engagement Log ({comments.length})</h3>
      </div>
      
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm">
              YOU
            </div>
          </div>
          <div className="flex-grow space-y-3">
            <textarea
              rows="3"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
              placeholder="Post a progress update or inquiry..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="premium-button premium-button-primary px-6"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? 'Transmitting...' : 'Post Update'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-primary-200">
                {getInitials(comment.authorName || comment.author?.name || 'User')}
              </div>
            </div>
            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">{comment.authorName || comment.author?.name || 'Campus Personnel'}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
                    <Clock className="w-3 h-3" />
                    {formattedDate(comment.createdAt)}
                  </div>
                </div>
                
                {/* Ownership Actions — only visible to the comment's author */}
                {currentUser && (comment.authorId === currentUser.id || comment.author?.id === currentUser.id) && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditStart(comment)}
                      className="text-[10px] font-bold text-slate-400 hover:text-primary-600 uppercase transition-colors"
                    >
                      Edit
                    </button>
                    <span className="text-slate-200 text-[10px]">|</span>
                    <button 
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-[10px] font-bold text-slate-400 hover:text-error uppercase transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="mt-2 space-y-3">
                  <textarea
                    rows="2"
                    className="w-full bg-white border border-primary-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium resize-none shadow-sm"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingCommentId(null)}
                      className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleEditSave(comment.id)}
                      className="px-3 py-1.5 text-[10px] font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-600 text-sm leading-relaxed font-medium">
                  {comment.content || comment.text}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-medium italic">No updates have been logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
