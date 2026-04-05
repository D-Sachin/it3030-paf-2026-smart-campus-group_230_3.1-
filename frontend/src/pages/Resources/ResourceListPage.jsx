import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, Loader, Building2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import resourceService from "../../services/resourceService";
import ResourceCard from "../../components/Resources/ResourceCard";
import ResourceForm from "../../components/Resources/ResourceForm";
import ResourceFilterBar from "../../components/Resources/FilterBar";

/**
 * ResourceList Page
 * Main page for viewing, searching, filtering, and managing resources
 */
const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Check if user is admin (would come from auth context in real app)
  const [isAdmin, setIsAdmin] = useState(true); // TODO: Get from Auth Context

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
      setResources(response.data.data);
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
    try {
      const response = await resourceService.searchResources(
        term,
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
    try {
      const response = await resourceService.advancedSearch(
        filters,
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
        // Update existing resource
        await resourceService.updateResource(
          editingResource.id,
          formData,
        );
        setSuccess("Resource updated successfully!");
      } else {
        // Create new resource
        await resourceService.createResource(formData);
        setSuccess("Resource created successfully!");
      }
      setShowForm(false);
      setEditingResource(null);
      fetchResources();
      // Clear success message after 3 seconds
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
          <h1 className="text-3xl font-bold text-slate-900">Campus Resources</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Manage facilities, laboratories, and operational equipment catalogue.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleCreateClick}
              disabled={loading}
              className="premium-button premium-button-primary"
            >
              <Plus className="w-4 h-4" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <ResourceFilterBar
        onFilter={handleFilter}
        onSearch={handleSearch}
        isLoading={loading}
      />

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 font-bold text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Content Area */}
      {loading && resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-10 h-10 text-primary-500 animate-spin mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Campus Assets...</p>
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
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Page <span className="text-slate-900">{currentPage + 1}</span> of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0 || loading}
                      className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm disabled:opacity-30 hover:border-primary-200 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                            currentPage === i 
                            ? 'bg-white text-primary-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1 || loading}
                      className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm disabled:opacity-30 hover:border-primary-200 transition-all"
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
                    className="bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-primary-500"
                  >
                    <option value="5">5 / Page</option>
                    <option value="10">10 / Page</option>
                    <option value="20">20 / Page</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="premium-card p-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                <Building2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No resources found</h3>
              <p className="text-slate-400 mt-2 max-w-sm font-medium">
                We couldn't find any campus assets matching your current search or filter criteria.
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
