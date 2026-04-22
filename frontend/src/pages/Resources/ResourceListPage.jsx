import React, { useState, useEffect } from "react";
import {
  Plus,
  AlertCircle,
  Loader,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import resourceService from "../../services/resourceService";
import ResourceCard from "../../components/Resources/ResourceCard";
import ResourceForm from "../../components/Resources/ResourceForm";
import ResourceFilterBar from "../../components/Resources/FilterBar";
import ResourceSearchBar from "../../components/Resources/ResourceSearchBar";
import { useUser } from "../../context/UserContext";

/**
 * ResourceList Page
 * Main page for viewing, searching, filtering, and managing resources
 */
const ResourceList = () => {
  const { user } = useUser();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    type: "",
    status: "",
    location: "",
    minCapacity: "",
    maxCapacity: "",
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const isAdmin = user?.role === "ADMIN";

  // Load resources on mount and when pagination changes
  useEffect(() => {
    fetchResources();
  }, [currentPage, pageSize]);

  const fetchResources = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await resourceService.getAllResources(
        currentPage,
        pageSize,
      );
      let data = response.data.data;

      // For non-admin users, filter to show only ACTIVE resources
      if (!isAdmin) {
        data = data.filter((resource) => resource.status === "ACTIVE");
      }

      setResources(data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError("Failed to load resources. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setLoading(true);
    setError("");
    setCurrentPage(0);
    setSearchTerm(term);
    try {
      // Use advanced search with both term and current filters
      const response = await resourceService.advancedSearch(
        { ...activeFilters, term },
        0,
        pageSize,
      );
      setResources(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filters) => {
    setLoading(true);
    setError("");
    setCurrentPage(0);
    setActiveFilters(filters);
    try {
      // Use advanced search with both filters and current search term
      const response = await resourceService.advancedSearch(
        { ...filters, term: searchTerm },
        0,
        pageSize,
      );
      setResources(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError("Filter failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingResource(null);
    setShowForm(true);
  };

  const handleEditClick = (resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      if (editingResource) {
        await resourceService.updateResource(editingResource.id, formData);
        setSuccess("Resource updated successfully!");
      } else {
        await resourceService.createResource(formData);
        setSuccess("Resource created successfully!");
      }
      setShowForm(false);
      setEditingResource(null);
      fetchResources();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        editingResource
          ? "Failed to update resource"
          : "Failed to create resource",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      setLoading(true);
      setError("");
      try {
        await resourceService.deleteResource(resourceId);
        setSuccess("Resource deleted successfully!");
        fetchResources();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to delete resource");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#CCD0CF" }}>
            {isAdmin
              ? "Campus Resources Management"
              : "Available Campus Resources"}
          </h1>
          <p className="mt-1 font-medium text-sm" style={{ color: "#9BA8AB" }}>
            {isAdmin
              ? "Manage facilities, laboratories, and operational equipment catalogue."
              : "Browse and book available resources for your campus needs."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleCreateClick}
              disabled={loading}
              className="premium-button"
              style={{ backgroundColor: "#1c4f78", color: "#CCD0CF" }}
            >
              <Plus className="w-4 h-4" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar - Admin Only */}
      {isAdmin && (
        <ResourceFilterBar
          onFilter={handleFilter}
          onSearch={handleSearch}
          isLoading={loading}
        />
      )}

      {/* Search Bar - Non-Admin Only */}
      {!isAdmin && (
        <ResourceSearchBar
          onSearch={handleSearch}
          isLoading={loading}
        />
      )}

      {/* Messages */}
      {success && (
        <div
          className="p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-fade-in"
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            color: "#10b981",
          }}
        >
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-shake"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
          }}
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Content Area */}
      {loading && resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader
            className="w-10 h-10 animate-spin mb-4"
            style={{ color: "#1c4f78" }}
          />
          <p
            className="font-bold uppercase tracking-widest text-[10px]"
            style={{ color: "#4A5C6A" }}
          >
            Synchronizing Campus Assets...
          </p>
        </div>
      ) : (
        <>
          {resources.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pb-8">
                  <div
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: "#4A5C6A" }}
                  >
                    Page{" "}
                    <span style={{ color: "#CCD0CF" }}>{currentPage + 1}</span>{" "}
                    of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0 || loading}
                      className="p-3 rounded-xl border disabled:opacity-30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#253745",
                        borderColor: "#4A5C6A",
                        color: "#CCD0CF",
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div
                      className="flex items-center gap-1 p-1 rounded-xl border shadow-inner"
                      style={{
                        backgroundColor: "#11212D",
                        borderColor: "#253745",
                      }}
                    >
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                            currentPage === i
                              ? "shadow-sm"
                              : "hover:text-white/80"
                          }`}
                          style={{
                            backgroundColor:
                              currentPage === i ? "#1c4f78" : "transparent",
                            color: currentPage === i ? "#CCD0CF" : "#4A5C6A",
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(totalPages - 1, currentPage + 1),
                        )
                      }
                      disabled={currentPage >= totalPages - 1 || loading}
                      className="p-3 rounded-xl border disabled:opacity-30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#253745",
                        borderColor: "#4A5C6A",
                        color: "#CCD0CF",
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(0);
                    }}
                    className="text-xs font-bold rounded-xl px-3 py-2 outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "#11212D",
                      border: "1px solid #253745",
                      color: "#CCD0CF",
                    }}
                  >
                    <option value="5" style={{ backgroundColor: "#11212D" }}>
                      5 / Page
                    </option>
                    <option value="10" style={{ backgroundColor: "#11212D" }}>
                      10 / Page
                    </option>
                    <option value="20" style={{ backgroundColor: "#11212D" }}>
                      20 / Page
                    </option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <div
              className="rounded-[32px] p-20 flex flex-col items-center text-center shadow-xl"
              style={{
                backgroundColor: "#253745",
                border: "1px solid #4A5C6A",
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "#11212D", color: "#4A5C6A" }}
              >
                <Building2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#CCD0CF" }}>
                No resources found
              </h3>
              <p
                className="mt-2 max-w-sm font-medium"
                style={{ color: "#9BA8AB" }}
              >
                We couldn't find any campus assets matching your current search
                or filter criteria.
              </p>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <ResourceForm
          resource={editingResource}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingResource(null);
          }}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ResourceList;
