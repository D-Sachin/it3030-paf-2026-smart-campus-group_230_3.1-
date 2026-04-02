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
  // GET all tickets
  getAllTickets: (page = 0, size = 10, sortBy = "createdAt", sortDirection = "desc") => {
    return apiClient.get("", {
      params: { page, size, sortBy, sortDirection },
    });
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

  // PATCH update ticket status
  updateTicketStatus: (id, status, resolutionNotes = "") => {
    return apiClient.patch(`/${id}/status`, null, {
      params: { status, resolutionNotes },
    });
  },

  // POST attach files to a ticket
  uploadAttachments: (ticketId, files) => {
    const formData = new FormData();
    // Assuming backend takes a List of MultipartFile named 'files'
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    return apiClient.post(`/${ticketId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // POST add a comment
  addComment: (ticketId, commentData) => {
    return apiClient.post(`/${ticketId}/comments`, commentData);
  },

  // GET download attachment
  downloadAttachment: (ticketId, attachmentId) => {
    return apiClient.get(`/${ticketId}/attachments/${attachmentId}`, {
      responseType: "blob",
    });
  },
};

export default ticketService;
