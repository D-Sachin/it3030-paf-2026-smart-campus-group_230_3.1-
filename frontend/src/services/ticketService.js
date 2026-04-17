import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/tickets";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for auth token if needed
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ticketService = {
  // GET all tickets with enhanced filtering
  getAllTickets: (params = {}) => {
    return apiClient.get("", {
      params: { 
        page: params.page || 0, 
        size: params.size || 10, 
        sortBy: params.sortBy || "createdAt", 
        sortDirection: params.sortDirection || "desc",
        status: params.status,
        priority: params.priority,
        category: params.category,
        searchTerm: params.searchTerm
      },
    });
  },

  // GET users by role (for technician assignment)
  getUsersByRole: (role) => {
    return axios.get(`http://localhost:8080/api/users/role/${role}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    });
  },


  // GET tickets by User ID (for Students)
  getTicketsByUserId: (userId) => {
    return apiClient.get(`/user/${userId}`);
  },

  // GET ticket by ID
  getTicketById: (id) => {
    return apiClient.get(`/${id}`);
  },

  // POST create a new ticket
  createTicket: (ticketData) => {
    return apiClient.post("", ticketData);
  },

  // PUT update a ticket
  updateTicket: (id, ticketData) => {
    return apiClient.put(`/${id}`, ticketData);
  },

  // PUT update ticket status
  updateTicketStatus: (id, status) => {
    return apiClient.put(`/${id}/status`, { status });
  },

  // PUT update resolution notes
  updateResolutionNotes: (id, notes) => {
    return apiClient.put(`/${id}/resolution`, notes, {
      headers: { "Content-Type": "text/plain" }
    });
  },

  // POST attach a single file to a ticket (Backend expects singular 'file')
  uploadAttachment: (ticketId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(`/${ticketId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // PUT assign technician
  assignTechnician: (id, technicianId) => {
    return apiClient.put(`/${id}/assign`, { technicianId });
  },

  // POST add a comment (Backend expects { content: "..." })
  addComment: (ticketId, content) => {
    return apiClient.post(`/${ticketId}/comments`, { content });
  },

  // Comment Management (PUT and DELETE)
  updateComment: (commentId, content) => {
    return axios.put(`http://localhost:8080/api/comments/${commentId}`, { content }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    });
  },

  deleteComment: (commentId) => {
    return axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    });
  },

  // GET download attachment (matches FileController)
  downloadAttachment: (fileName) => {
    return apiClient.get(`/uploads/${fileName}`, {
      baseURL: "http://localhost:8080/api/files", // Custom base for FileController
      responseType: "blob",
    });
  },
};

export default ticketService;
