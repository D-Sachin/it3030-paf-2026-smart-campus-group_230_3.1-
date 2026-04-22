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
  Tag,
  ChevronDown
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

  return createPortal(
    <div 
      className="fixed inset-0 backdrop-blur-sm z-[9999] overflow-y-auto overflow-x-hidden p-4 md:p-10 animate-fade-in flex flex-col items-center"
      style={{ backgroundColor: 'rgba(6, 20, 27, 0.85)' }}
    >
      <div 
        className="relative rounded-[32px] shadow-2xl w-full max-w-4xl min-h-fit max-h-none flex flex-col animate-scale-in overflow-hidden my-auto"
        style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-10 py-8 flex-shrink-0 z-10"
          style={{ backgroundColor: '#11212D', borderBottom: '1px solid #253745' }}
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: 'rgba(45, 112, 163, 0.15)', color: '#2d70a3' }}>
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-none" style={{ color: '#CCD0CF' }}>Report New Incident</h2>
              <p className="text-sm font-medium mt-2" style={{ color: '#9BA8AB' }}>Please provide detailed information to help us resolve it quickly.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all border border-transparent group"
            style={{ color: '#9BA8AB' }}
            disabled={isLoading}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#253745'; e.currentTarget.style.color = '#CCD0CF'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9BA8AB'; }}
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-10">
          {error && (
            <div 
              className="mb-8 rounded-2xl p-5 flex items-center gap-4 animate-shake"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Fields */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                    <Type className="w-3 h-3" /> Incident Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="e.g., Water leakage in Room 402"
                    className="w-full px-6 py-4.5 rounded-2xl outline-none transition-all font-bold"
                    style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
                    onBlur={e => e.currentTarget.style.borderColor = '#253745'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                      <Flag className="w-3 h-3" /> Priority Level
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full px-6 py-4.5 rounded-2xl outline-none transition-all font-bold appearance-none cursor-pointer"
                        style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
                        onBlur={e => e.currentTarget.style.borderColor = '#253745'}
                      >
                        <option value="LOW" style={{ backgroundColor: '#11212D' }}>Low Priority</option>
                        <option value="MEDIUM" style={{ backgroundColor: '#11212D' }}>Medium Priority</option>
                        <option value="HIGH" style={{ backgroundColor: '#11212D' }}>High Priority</option>
                        <option value="CRITICAL" style={{ backgroundColor: '#11212D' }}>Critical Issue</option>
                      </select>
                      <Tag className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#4A5C6A' }} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                      <Tag className="w-3 h-3" /> Resource Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="resourceLocation"
                      value={formData.resourceLocation}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="e.g., Block B, Lab 402"
                      className="w-full px-6 py-4.5 rounded-2xl outline-none transition-all font-bold"
                      style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
                      onBlur={e => e.currentTarget.style.borderColor = '#253745'}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                      <Tag className="w-3 h-3" /> Preferred Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="preferredContactDetails"
                      value={formData.preferredContactDetails}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="e.g., +94 77 123 4567"
                      className="w-full px-6 py-4.5 rounded-2xl outline-none transition-all font-bold"
                      style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
                      onBlur={e => e.currentTarget.style.borderColor = '#253745'}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                      <Tag className="w-3 h-3" /> Incident Category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full px-6 py-4.5 rounded-2xl outline-none transition-all font-bold appearance-none cursor-pointer"
                        style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
                        onBlur={e => e.currentTarget.style.borderColor = '#253745'}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} style={{ backgroundColor: '#11212D' }}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" style={{ color: '#4A5C6A' }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                    <FileText className="w-3 h-3" /> Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows="6"
                    placeholder="Describe exactly what happened..."
                    className="w-full px-6 py-5 rounded-2xl outline-none transition-all font-medium resize-none leading-relaxed"
                    style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#2d70a3'}
                    onBlur={e => e.currentTarget.style.borderColor = '#253745'}
                  />
                </div>
              </div>
            </div>

            {/* Evidence & Tips */}
            <div className="space-y-10">
              <div className="space-y-5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: '#9BA8AB' }}>
                  <Paperclip className="w-3 h-3" /> Supporting Evidence
                </label>
                
                <label 
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[32px] cursor-pointer transition-all group relative overflow-hidden"
                  style={{ backgroundColor: 'rgba(6, 20, 27, 0.4)', borderColor: '#253745' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2d70a3'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#253745'}
                >
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ backgroundColor: '#11212D', color: '#2d70a3' }}>
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-[13px] font-bold" style={{ color: '#CCD0CF' }}>Upload Images</p>
                    <p className="text-[11px] mt-2 font-medium" style={{ color: '#4A5C6A' }}>PNG, JPG up to 3 files</p>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" multiple onChange={handleFileChange} disabled={isLoading} />
                </label>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl animate-slide-in shadow-sm" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0" style={{ backgroundColor: '#06141B', color: '#2d70a3' }}>
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold truncate" style={{ color: '#CCD0CF' }}>{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(index)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-red-500 transition-all" style={{ color: '#4A5C6A' }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div 
                className="p-8 rounded-[32px] space-y-6 shadow-xl relative overflow-hidden group"
                style={{ backgroundColor: '#06141B', border: '1px solid #253745' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
                <h4 className="font-bold text-base flex items-center gap-2 relative z-10" style={{ color: '#CCD0CF' }}>
                  <Info className="w-5 h-5" style={{ color: '#2d70a3' }} />
                  Quick Tips
                </h4>
                <ul className="space-y-5 relative z-10">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(45, 112, 163, 0.2)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                    </div>
                    <p className="text-xs leading-relaxed font-medium" style={{ color: '#9BA8AB' }}>Mention precise block or room numbers for faster response.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(45, 112, 163, 0.2)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                    </div>
                    <p className="text-xs leading-relaxed font-medium" style={{ color: '#9BA8AB' }}>Photos of the issue help technicians prepare the right tools.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t flex items-center justify-end gap-10" style={{ borderTopColor: '#253745' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="text-sm font-bold transition-colors underline-offset-4 hover:underline"
              style={{ color: '#4A5C6A' }}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="premium-button min-w-[240px] py-4.5 flex items-center justify-center gap-3 text-sm font-bold group shadow-xl"
              style={{ backgroundColor: '#1c4f78', color: '#CCD0CF', boxShadow: '0 8px 24px rgba(6, 20, 27, 0.4)' }}
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
