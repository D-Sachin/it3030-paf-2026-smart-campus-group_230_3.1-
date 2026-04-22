import React, { useState, useRef } from "react";
import { Search, X } from "lucide-react";

/**
 * ResourceSearchBar Component
 * Simplified search bar for non-admin users (technician/student)
 */
const ResourceSearchBar = ({ onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef(null);

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const handleClear = () => {
    setSearchTerm("");
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    onSearch("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    onSearch(searchTerm);
  };

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
          style={{ color: "#4A5C6A" }}
        />
        <input
          type="text"
          placeholder="Search resources by name, ID, or description..."
          value={searchTerm}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          disabled={isLoading}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl outline-none transition-all font-medium border"
          style={{
            backgroundColor: "#06141B",
            borderColor: searchTerm ? "#1c4f78" : "#253745",
            color: "#CCD0CF",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1c4f78";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(28, 79, 120, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = searchTerm ? "#1c4f78" : "#253745";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
            style={{ color: "#4A5C6A" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#CCD0CF";
              e.currentTarget.style.backgroundColor = "rgba(28, 79, 120, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#4A5C6A";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Active Search Indicator */}
      {searchTerm && (
        <div
          className="mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fade-in"
          style={{
            backgroundColor: "rgba(28, 79, 120, 0.1)",
            border: "1px solid rgba(28, 79, 120, 0.2)",
            color: "#1c4f78",
          }}
        >
          <Search className="w-3 h-3" />
          <span>
            Searching for: "<strong>{searchTerm}</strong>"
          </span>
        </div>
      )}
    </div>
  );
};

export default ResourceSearchBar;
