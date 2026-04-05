import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Paperclip, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Info
} from 'lucide-react';
import ticketService from '../../services/ticketService';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'LOW',
    categoryId: 1, // Defaulting to 1 as per legacy
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (attachments.length + selectedFiles.length > 3) {
      alert("Maximum 3 attachments allowed.");
      return;
    }
    setAttachments(prev => [...prev, ...selectedFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Title and Description are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const ticketResponse = await ticketService.createTicket({
        ...formData,
        categoryId: parseInt(formData.categoryId) || 1
      });
      const ticketId = ticketResponse.data.id;

      if (attachments.length > 0) {
        for (const file of attachments) {
          await ticketService.uploadAttachment(ticketId, file);
        }
      }

      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <Link to="/tickets" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        <span className="text-sm font-bold text-slate-400">NEW INCIDENT REPORT</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="premium-card p-8 space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Report an Incident</h1>
            <p className="text-slate-500">Provide details about the issue you've encountered.</p>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-700 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Broken AC in Lecture Hall A"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-slate-700"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category ID</label>
                  <input
                    type="number"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="premium-button premium-button-primary px-8"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Evidence
            </h3>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-primary-500 mb-2 transition-colors" />
                  <p className="text-xs font-bold text-slate-400 group-hover:text-primary-600 transition-colors text-center px-4">Click to upload files</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange}
                />
              </label>

              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(index)} className="text-slate-400 hover:text-error transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6 bg-slate-900 border-none">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-400" />
              Submission Policy
            </h4>
            <ul className="space-y-3 mt-4 text-xs text-slate-400">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                Provide clear photos for faster resolution.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                Maximum 3 attachments allowed.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
