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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#4A5C6A' }} />
          <input
            type="text"
            placeholder="Search campus resources by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition-all font-medium border"
            style={{ 
              backgroundColor: '#06141B', 
              borderColor: '#253745', 
              color: '#CCD0CF' 
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#1c4f78'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(28, 79, 120, 0.1)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#253745'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </form>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all border"
            style={{ 
              backgroundColor: showAdvanced ? '#1c4f78' : '#253745', 
              color: '#CCD0CF',
              borderColor: '#4A5C6A'
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              title="Reset all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div 
          className="p-6 rounded-[32px] border animate-fade-in-up" 
          style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#4A5C6A' }}>
                <LayoutGrid className="w-3 h-3" /> Asset Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-xl outline-none font-bold text-sm appearance-none"
                style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value} style={{ backgroundColor: '#11212D' }}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#4A5C6A' }}>
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Building Name..."
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-xl outline-none font-bold text-sm"
                style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#4A5C6A' }}>
                <Users className="w-3 h-3" /> Capacity
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minCapacity"
                  placeholder="Min"
                  value={filters.minCapacity}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 rounded-xl outline-none font-bold text-xs"
                  style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
                />
                <span style={{ color: '#4A5C6A' }}>-</span>
                <input
                  type="number"
                  name="maxCapacity"
                  placeholder="Max"
                  value={filters.maxCapacity}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 rounded-xl outline-none font-bold text-xs"
                  style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#4A5C6A' }}>
                <Filter className="w-3 h-3" /> Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-xl outline-none font-bold text-sm appearance-none"
                style={{ backgroundColor: '#06141B', border: '1px solid #4A5C6A', color: '#CCD0CF' }}
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value} style={{ backgroundColor: '#11212D' }}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: '#4A5C6A' }}>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 font-bold transition-colors"
              style={{ color: '#4A5C6A' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'}
            >
              Reset Filters
            </button>
            <button
              onClick={handleApplyFilters}
              className="premium-button px-8"
              style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
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
