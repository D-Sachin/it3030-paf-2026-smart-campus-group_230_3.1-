import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertCircle, 
  Paperclip, 
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Info,
  Type,
  FileText,
  Flag,
  Tag
} from 'lucide-react';

/**
 * TicketForm Component
 * Renders a modal form for reporting a new incident ticket
 */
const TicketForm = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'LOW',
    category: 'Maintenance',
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);

  const categories = [
    "Maintenance",
    "IT Support",
    "Security",
    "Cleaning",
    "Other"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (attachments.length + selectedFiles.length > 3) {
      setError("Maximum 3 attachments allowed.");
      return;
    }
    setAttachments(prev => [...prev, ...selectedFiles]);
    setError(null);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and Description are required.');
      return;
    }
    
    onSubmit(formData, attachments);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </span>
              Report New Incident
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Please provide detailed information about the issue to help us resolve it quickly.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Type className="w-3 h-3" /> Incident Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="e.g., Water leakage in Room 402"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Flag className="w-3 h-3" /> Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="CRITICAL">Critical Issue</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Incident Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Detailed Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows="6"
                    placeholder="Describe exactly what happened, the location, and any other relevant details..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-medium text-slate-600 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Attachments & Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Paperclip className="w-3 h-3" /> Supporting Evidence
                </label>
                
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-primary-500 mb-3 transition-colors" />
                    <p className="text-xs font-bold text-slate-500 group-hover:text-primary-600 transition-colors">
                      Drop images here or click to browse
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Max 3 files (PNG, JPG)</p>
                  </div>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    multiple 
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group animate-slide-in">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(index)} 
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-white"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-400" />
                  Helpful Tips
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-primary-500" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Be specific about the location to help our team find the issue faster.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-primary-500" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Clear photos of the damage or issue are highly recommended.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 py-6 border-t border-slate-100 flex items-center justify-end gap-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="premium-button premium-button-primary px-12 py-3.5 flex items-center gap-3 text-sm group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {isLoading ? 'Creating Report...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
