/**
 * API Service for Resource Management
 * Handles all API calls to the backend for resource operations
 */

import apiClient from "./apiClient";

const resourceService = {
  // GET - Fetch all resources with pagination
  getAllResources: (
    page = 0,
    size = 10,
    sortBy = "id",
    sortDirection = "desc",
  ) => {
    return apiClient.get("/resources", {
      params: { page, size, sortBy, sortDirection },
    });
  },

  // GET - Fetch resource by ID
  getResourceById: (id) => {
    return apiClient.get(`/resources/${id}`);
  },

  // GET - Get active resources
  getActiveResources: () => {
    return apiClient.get("/resources/active");
  },

  // GET - Search resources by keyword
  searchResources: (term = "", page = 0, size = 10) => {
    return apiClient.get("/resources/search", {
      params: { term, page, size },
    });
  },

  // GET - Advanced search with filters
  advancedSearch: (filters, page = 0, size = 10) => {
    return apiClient.get("/resources/advanced-search", {
      params: { ...filters, page, size },
    });
  },

  // GET - Filter by type
  filterByType: (type, page = 0, size = 10) => {
    return apiClient.get("/resources/filter/by-type", {
      params: { type, page, size },
    });
  },

  // GET - Filter by location
  filterByLocation: (location, page = 0, size = 10) => {
    return apiClient.get("/resources/filter/by-location", {
      params: { location, page, size },
    });
  },

  // GET - Filter by capacity
  filterByCapacity: (capacity, page = 0, size = 10) => {
    return apiClient.get("/resources/filter/by-capacity", {
      params: { capacity, page, size },
    });
  },

  // GET - Filter by status
  filterByStatus: (status, page = 0, size = 10) => {
    return apiClient.get("/resources/filter/by-status", {
      params: { status, page, size },
    });
  },

  // GET - Get location suggestions
  getLocationSuggestions: (prefix) => {
    return apiClient.get("/resources/suggestions/locations", {
      params: { prefix },
    });
  },

  // POST - Create new resource
  createResource: (resourceData) => {
    return apiClient.post("/resources", resourceData);
  },

  // PUT - Update resource
  updateResource: (id, resourceData) => {
    return apiClient.put(`/resources/${id}`, resourceData);
  },

  // PATCH - Update resource status
  updateResourceStatus: (id, status) => {
    return apiClient.patch(`/resources/${id}/status`, null, {
      params: { status },
    });
  },

  // DELETE - Delete resource
  deleteResource: (id) => {
    return apiClient.delete(`/resources/${id}`);
  },
};

export default resourceService;
