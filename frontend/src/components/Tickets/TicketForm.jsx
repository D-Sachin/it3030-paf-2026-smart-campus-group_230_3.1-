import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    resourceLocation: '',
    preferredContactDetails: '',
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
    if (!formData.resourceLocation.trim()) {
      setError('Resource Location is required.');
      return;
    }
    if (!formData.preferredContactDetails.trim()) {
      setError('Preferred Contact is required.');
      return;
    }
    
    onSubmit(formData, attachments);
  };

  // Render modal using Portal to avoid clipping by parent layouts
  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] overflow-y-auto overflow-x-hidden p-4 md:p-10 animate-fade-in flex flex-col items-center">
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-4xl min-h-fit max-h-none flex flex-col animate-scale-in border border-slate-100 overflow-hidden my-auto">
        {/* Professional Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-white flex-shrink-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Report New Incident</h2>
              <p className="text-sm font-medium text-slate-400 mt-2">Please provide detailed information to help us resolve it quickly.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 group"
            disabled={isLoading}
            aria-label="Close"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Form Body - NON-overflowing content will keep button visible */}
        <form onSubmit={handleSubmit} className="flex-1 p-10">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-700 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Type className="w-3 h-3" /> Incident Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="e.g., Water leakage in Room 402"
                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Flag className="w-3 h-3" /> Priority Level
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                        <option value="CRITICAL">Critical Issue</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Tag className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Resource Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="resourceLocation"
                      value={formData.resourceLocation}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="e.g., Block B, Lab 402"
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Preferred Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="preferredContactDetails"
                      value={formData.preferredContactDetails}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="e.g., +94 77 123 4567"
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Incident Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows="6"
                    placeholder="Describe exactly what happened, the location, and any other relevant details..."
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-medium text-slate-600 resize-none leading-relaxed placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Attachments & Info */}
            <div className="space-y-10">
              <div className="space-y-5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Paperclip className="w-3 h-3" /> Supporting Evidence
                </label>
                
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group relative overflow-hidden bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-primary-500 transition-all">
                      <ImageIcon className="w-7 h-7 text-slate-400 transition-colors" />
                    </div>
                    <p className="text-[13px] font-bold text-slate-600 group-hover:text-primary-700 transition-colors">
                      Upload Images
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">PNG, JPG up to 3 files</p>
                  </div>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    multiple 
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 group animate-slide-in shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[32px] border border-slate-800 space-y-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
                <h4 className="font-bold text-white text-base flex items-center gap-2 relative z-10">
                  <Info className="w-5 h-5 text-primary-400" />
                  Quick Tips
                </h4>
                <ul className="space-y-5 relative z-10">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Mention precise block or room numbers for faster response.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Photos of the issue help technicians prepare the right tools.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-end gap-10">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors underline-offset-4 hover:underline"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="premium-button premium-button-primary min-w-[240px] py-4.5 flex items-center justify-center gap-3 text-sm font-bold group shadow-xl shadow-primary-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {isLoading ? 'Processing...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TicketForm;
