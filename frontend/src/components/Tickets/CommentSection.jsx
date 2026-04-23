import React, { useState } from 'react';
import { MessageSquare, Send, Clock, Loader2 } from 'lucide-react';

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
    <div className="space-y-10">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #253745' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 112, 163, 0.15)', color: '#2d70a3' }}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#CCD0CF' }}>Engagement Log ({comments.length})</h3>
      </div>
      
      {/* Comment Input */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-[10px] shadow-sm uppercase" style={{ backgroundColor: '#11212D', color: '#4A5C6A' }}>
              YOU
            </div>
          </div>
          <div className="flex-grow space-y-3">
            <textarea
              rows="3"
              className="w-full rounded-2xl p-4 text-sm outline-none transition-all font-medium resize-none shadow-inner"
              style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
              placeholder="Post a progress update or inquiry..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
              onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
              onBlur={e => e.currentTarget.style.borderColor = '#253745'}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="premium-button px-6"
                style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
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
        {comments.map((comment) => {
          const isMe = currentUser && comment.userId === currentUser.id;
          return (
            <div key={comment.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg" style={{ backgroundColor: isMe ? '#11212D' : '#1c4f78', color: isMe ? '#4A5C6A' : '#CCD0CF', border: isMe ? '1px solid #253745' : 'none' }}>
                  {getInitials(comment.userName || 'User')}
                </div>
              </div>
              <div className={`flex-grow space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`flex items-center gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="font-bold text-sm" style={{ color: '#CCD0CF' }}>{comment.userName || 'Campus Personnel'}</span>
                  <div 
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors shrink-0"
                    style={{ backgroundColor: '#11212D', color: '#4A5C6A', borderColor: '#253745' }}
                  >
                    <Clock className="w-3 h-3" />
                    {formattedDate(comment.createdAt)}
                  </div>
                  
                  {/* Ownership Actions */}
                  {isMe && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditStart(comment)}
                        className="text-[10px] font-bold uppercase transition-colors"
                        style={{ color: '#4A5C6A' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#2d70a3'}
                        onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'}
                      >
                        Edit
                      </button>
                      <span className="text-[10px]" style={{ color: '#253745' }}>|</span>
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-[10px] font-bold uppercase transition-colors"
                        style={{ color: '#4A5C6A' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                
                {editingCommentId === comment.id ? (
                  <div className="mt-2 space-y-3 w-full max-w-md">
                    <textarea
                      rows="2"
                      className="w-full rounded-xl p-3 text-sm outline-none transition-all font-medium resize-none shadow-sm"
                      style={{ backgroundColor: '#06141B', border: '1px solid #2d70a3', color: '#CCD0CF' }}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: '#4A5C6A' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleEditSave(comment.id)}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors"
                        style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`p-4 rounded-2xl border text-sm leading-relaxed font-medium ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                    style={{ 
                      backgroundColor: isMe ? 'rgba(28, 79, 120, 0.25)' : 'rgba(37, 55, 69, 0.4)', 
                      borderColor: isMe ? '#1c4f78' : '#253745', 
                      color: isMe ? '#CCD0CF' : '#9BA8AB' 
                    }}
                  >
                    {comment.content || comment.text}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {comments.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#11212D' }}>
              <MessageSquare className="w-8 h-8" style={{ color: '#253745' }} />
            </div>
            <p className="font-medium italic" style={{ color: '#4A5C6A' }}>No updates have been logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
