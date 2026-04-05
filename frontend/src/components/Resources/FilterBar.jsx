import React, { useState } from "react";
import { Search, Filter, X, LayoutGrid, MapPin, Users, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

/**
 * ResourceFilterBar Component
 * Allows users to search and filter resources
 */
const ResourceFilterBar = ({ onFilter, onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    location: "",
    minCapacity: "",
    maxCapacity: "",
  });

  const resourceTypes = [
    { value: "", label: "All Asset Types" },
    { value: "LECTURE_HALL", label: "Lecture Hall" },
    { value: "LAB", label: "Laboratory" },
    { value: "MEETING_ROOM", label: "Meeting Room" },
    { value: "EQUIPMENT", label: "System Equipment" },
  ];

  const statuses = [
    { value: "", label: "All Operational Status" },
    { value: "ACTIVE", label: "Operational (Active)" },
    { value: "OUT_OF_SERVICE", label: "Under Maintenance" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
    setShowAdvanced(false);
  };

  const handleClearFilters = () => {
    const cleared = {
      type: "",
      status: "",
      location: "",
      minCapacity: "",
      maxCapacity: "",
    };
    setFilters(cleared);
    setSearchTerm("");
    onSearch("");
    onFilter(cleared);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "") || searchTerm !== "";

  return (
    <div className="space-y-4 mb-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search campus resources by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </form>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all ${
              showAdvanced 
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
              : 'bg-white text-slate-600 border border-slate-100 hover:border-primary-200 shadow-sm'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
              title="Reset all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="premium-card p-6 bg-white/60 backdrop-blur-md border-primary-100 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <LayoutGrid className="w-3 h-3" /> Asset Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-700 text-sm"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Building Name..."
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-700 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Capacity
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minCapacity"
                  placeholder="Min"
                  value={filters.minCapacity}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-700 text-xs"
                />
                <span className="text-slate-300 font-bold">-</span>
                <input
                  type="number"
                  name="maxCapacity"
                  placeholder="Max"
                  value={filters.maxCapacity}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Filter className="w-3 h-3" /> Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-slate-700 text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-50">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={handleApplyFilters}
              className="premium-button premium-button-primary px-8"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFilterBar;
