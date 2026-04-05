import React, { useState, useEffect } from "react";
import { X, Save, Building2, Microscope, Users2, Wrench, Box, MapPin, Users, Clock, CheckCircle2, LayoutGrid } from "lucide-react";

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
    { value: "LECTURE_HALL", label: "Lecture Hall", icon: Building2 },
    { value: "LAB", label: "Laboratory", icon: Microscope },
    { value: "MEETING_ROOM", label: "Meeting Room", icon: Users2 },
    { value: "EQUIPMENT", label: "Equipment", icon: Wrench },
  ];

  const statuses = [
    { value: "ACTIVE", label: "Active / Operational", color: "text-success" },
    { value: "OUT_OF_SERVICE", label: "Out of Service / Maintenance", color: "text-error" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Resource name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.capacity < 1) newErrors.capacity = "Min capacity is 1";
    
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
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {resource ? "Update Resource" : "New Resource"}
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {resource ? `Edit details for ${resource.name}` : "Configure a new campus asset"}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* General Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Box className="w-3 h-3" /> Asset Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-700 ${
                  errors.name ? "border-red-500" : "border-slate-100 focus:border-primary-500"
                }`}
                placeholder="e.g., Auditorium Main Gate"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutGrid className="w-3 h-3" /> Resource Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-bold text-slate-700 transition-all"
                >
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" /> Max Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-700 ${
                    errors.capacity ? "border-red-500" : "border-slate-100 focus:border-primary-500"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Global Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-slate-700 ${
                  errors.location ? "border-red-500" : "border-slate-100 focus:border-primary-500"
                }`}
                placeholder="e.g., Level 04, Block C"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Internal Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows="3"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary-500 font-medium text-slate-600 transition-all resize-none"
                placeholder="Details about equipment, access rules, etc."
              />
            </div>
          </div>

          {/* Operational Status */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" /> Availability & Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Current Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-700 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Operational Hours
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold"
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="time"
                    name="availableTo"
                    value={formData.availableTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
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
              className="premium-button premium-button-primary px-10 py-3 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4" /> {resource ? "Save Changes" : "Register Resource"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;
