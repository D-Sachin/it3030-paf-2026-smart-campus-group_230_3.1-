/**
 * API Service for Resource Management
 * Handles all API calls to the backend for resource operations
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/resources";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor for authentication token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const resourceService = {
  // GET - Fetch all resources with pagination
  getAllResources: (
    page = 0,
    size = 10,
    sortBy = "id",
    sortDirection = "desc",
  ) => {
    return apiClient.get("", {
      params: { page, size, sortBy, sortDirection },
    });
  },

  // GET - Fetch resource by ID
  getResourceById: (id) => {
    return apiClient.get(`/${id}`);
  },

  // GET - Get active resources
  getActiveResources: () => {
    return apiClient.get("/active");
  },

  // GET - Search resources by keyword
  searchResources: (term = "", page = 0, size = 10) => {
    return apiClient.get("/search", {
      params: { term, page, size },
    });
  },

  // GET - Advanced search with filters
  advancedSearch: (filters, page = 0, size = 10) => {
    return apiClient.get("/advanced-search", {
      params: { ...filters, page, size },
    });
  },

  // GET - Filter by type
  filterByType: (type, page = 0, size = 10) => {
    return apiClient.get("/filter/by-type", {
      params: { type, page, size },
    });
  },

  // GET - Filter by location
  filterByLocation: (location, page = 0, size = 10) => {
    return apiClient.get("/filter/by-location", {
      params: { location, page, size },
    });
  },

  // GET - Filter by capacity
  filterByCapacity: (capacity, page = 0, size = 10) => {
    return apiClient.get("/filter/by-capacity", {
      params: { capacity, page, size },
    });
  },

  // GET - Filter by status
  filterByStatus: (status, page = 0, size = 10) => {
    return apiClient.get("/filter/by-status", {
      params: { status, page, size },
    });
  },

  // GET - Get location suggestions
  getLocationSuggestions: (prefix) => {
    return apiClient.get("/suggestions/locations", {
      params: { prefix },
    });
  },

  // POST - Create new resource
  createResource: (resourceData) => {
    return apiClient.post("", resourceData);
  },

  // PUT - Update resource
  updateResource: (id, resourceData) => {
    return apiClient.put(`/${id}`, resourceData);
  },

  // PATCH - Update resource status
  updateResourceStatus: (id, status) => {
    return apiClient.patch(`/${id}/status`, null, {
      params: { status },
    });
  },

  // DELETE - Delete resource
  deleteResource: (id) => {
    return apiClient.delete(`/${id}`);
  },
};

export default resourceService;
