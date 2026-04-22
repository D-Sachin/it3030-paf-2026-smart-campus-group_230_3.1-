import React, { useState, useEffect } from "react";
import { X, Save, Box, MapPin, Users, Clock, LayoutGrid, Loader2 } from "lucide-react";

/**
 * ResourceForm Component
 * Form for creating and editing resources
 */
const ResourceForm = ({ resource, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "LECTURE_HALL",
    capacity: 30,
    location: "",
    description: "",
    status: "ACTIVE",
    availableFrom: "",
    availableTo: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || "",
        type: resource.type || "LECTURE_HALL",
        capacity: resource.capacity || 30,
        location: resource.location || "",
        description: resource.description || "",
        status: resource.status || "ACTIVE",
        availableFrom: resource.availableFrom || "",
        availableTo: resource.availableTo || "",
      });
    }
  }, [resource]);

  const resourceTypes = [
    { value: "LECTURE_HALL", label: "Lecture Hall" },
    { value: "LAB", label: "Laboratory" },
    { value: "MEETING_ROOM", label: "Meeting Room" },
    { value: "EQUIPMENT", label: "Equipment" },
  ];

  const statuses = [
    { value: "ACTIVE", label: "Active / Operational" },
    { value: "OUT_OF_SERVICE", label: "Out of Service / Maintenance" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Resource name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters";
    }

    if (formData.capacity < 1) newErrors.capacity = "Min capacity is 1";
    if (formData.capacity > 500) newErrors.capacity = "Max capacity cannot exceed 500";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Format time fields to include seconds as required by backend HH:mm:ss pattern
      const formattedData = {
        ...formData,
        availableFrom: formData.availableFrom ? `${formData.availableFrom}:00` : null,
        availableTo: formData.availableTo ? `${formData.availableTo}:00` : null,
      };
      
      // Handle empty description or other fields that might be empty strings
      if (!formattedData.description) formattedData.description = null;
      
      onSubmit(formattedData);
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(6, 20, 27, 0.85)' }}
    >
      <div 
        className="rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border" 
        style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b" style={{ borderColor: '#253745' }}>
          <div>
            <h2 className="text-2xl font-black" style={{ color: '#CCD0CF' }}>
              {resource ? "Update Resource" : "New Resource"}
            </h2>
            <p className="text-sm font-medium mt-1" style={{ color: '#9BA8AB' }}>
              {resource ? `Edit details for ${resource.name}` : "Configure a new campus asset"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl transition-all border"
            style={{ color: '#4A5C6A', backgroundColor: 'transparent', borderColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#CCD0CF'; e.currentTarget.style.backgroundColor = '#253745'; e.currentTarget.style.borderColor = '#4A5C6A'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4A5C6A'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* General Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#4A5C6A' }}>
                <Box className="w-3 h-3" /> Asset Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold"
                style={{ 
                  backgroundColor: '#06141B', 
                  border: `1px solid ${errors.name ? '#ef4444' : '#253745'}`, 
                  color: '#CCD0CF' 
                }}
                placeholder="e.g., Auditorium Main Gate"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#4A5C6A' }}>
                  <LayoutGrid className="w-3 h-3" /> Resource Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 rounded-2xl outline-none font-bold transition-all appearance-none"
                  style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                >
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value} style={{ backgroundColor: '#11212D' }}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#4A5C6A' }}>
                  <Users className="w-3 h-3" /> Max Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold"
                  style={{ 
                    backgroundColor: '#06141B', 
                    border: `1px solid ${errors.capacity ? '#ef4444' : '#253745'}`, 
                    color: '#CCD0CF' 
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#4A5C6A' }}>
                <MapPin className="w-3 h-3" /> Global Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold"
                style={{ 
                  backgroundColor: '#06141B', 
                  border: `1px solid ${errors.location ? '#ef4444' : '#253745'}`, 
                  color: '#CCD0CF' 
                }}
                placeholder="e.g., Level 04, Block C"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#4A5C6A' }}>
                Internal Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows="3"
                className="w-full px-5 py-3.5 rounded-2xl outline-none font-medium transition-all resize-none leading-relaxed"
                style={{ backgroundColor: '#06141B', border: '1px solid #253745', color: '#CCD0CF' }}
                placeholder="Details about equipment, access rules, etc."
              />
            </div>
          </div>

          {/* Operational Status */}
          <div className="p-6 rounded-3xl border space-y-6" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: '#CCD0CF' }}>
              <Clock className="w-4 h-4" style={{ color: '#1c4f78' }} /> Availability & Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>
                  Current Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-xl outline-none font-bold text-sm appearance-none"
                  style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value} style={{ backgroundColor: '#11212D' }}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>
                  Operational Hours
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl outline-none text-xs font-bold"
                    style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
                  />
                  <span style={{ color: '#4A5C6A' }}>-</span>
                  <input
                    type="time"
                    name="availableTo"
                    value={formData.availableTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl outline-none text-xs font-bold"
                    style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t" style={{ borderColor: '#253745' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-8 py-3 text-sm font-bold transition-colors"
              style={{ color: '#4A5C6A' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="premium-button px-10 py-3 flex items-center gap-2"
              style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Processing...' : (resource ? "Save Changes" : "Register Resource")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;
