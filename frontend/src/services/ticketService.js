import apiClient from "./apiClient";
import axios from "axios";

const TICKETS_PATH = "/tickets";

const ticketService = {
  // GET all tickets with enhanced filtering
  getAllTickets: (params = {}) => {
    return apiClient.get(TICKETS_PATH, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || "createdAt",
        sortDirection: params.sortDirection || "desc",
        status: params.status,
        priority: params.priority,
        category: params.category,
        searchTerm: params.searchTerm,
        technicianId: params.technicianId,
      },
    });
  },

  // GET users by role (for technician assignment)
  getUsersByRole: (role) => {
    return apiClient.get(`/users/role/${role}`);
  },

  // GET tickets by User ID (for Students)
  getTicketsByUserId: (userId) => {
    return apiClient.get(`${TICKETS_PATH}/user/${userId}`);
  },

  // GET ticket by ID
  getTicketById: (id) => {
    return apiClient.get(`${TICKETS_PATH}/${id}`);
  },

  // POST create a new ticket
  createTicket: (ticketData) => {
    return apiClient.post(TICKETS_PATH, ticketData);
  },

  // PUT update a ticket
  updateTicket: (id, ticketData) => {
    return apiClient.put(`${TICKETS_PATH}/${id}`, ticketData);
  },

  // PUT update ticket status
  updateTicketStatus: (id, status) => {
    return apiClient.put(`${TICKETS_PATH}/${id}/status`, { status });
  },

  // PUT update resolution notes
  updateResolutionNotes: (id, notes) => {
    return apiClient.put(`${TICKETS_PATH}/${id}/resolution`, notes, {
      headers: { "Content-Type": "text/plain" },
    });
  },

  // POST attach a single file to a ticket
  uploadAttachment: (ticketId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`${TICKETS_PATH}/${ticketId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // PUT assign technician
  assignTechnician: (id, technicianId) => {
    return apiClient.put(`${TICKETS_PATH}/${id}/assign`, { technicianId });
  },

  // POST add a comment
  addComment: (ticketId, content, userId) => {
    return apiClient.post(`${TICKETS_PATH}/${ticketId}/comments`, {
      content,
      userId,
    });
  },

  // PUT update a comment
  updateComment: (commentId, content) => {
    return apiClient.put(`/comments/${commentId}`, { content });
  },

  // DELETE a comment
  deleteComment: (commentId) => {
    return apiClient.delete(`/comments/${commentId}`);
  },

  // GET download attachment
  downloadAttachment: (fileName) => {
    return apiClient.get(`/files/uploads/${fileName}`, {
      responseType: "blob",
    });
  },

  // DELETE an attachment from a ticket
  deleteAttachment: (ticketId, attachmentId) => {
    return apiClient.delete(`${TICKETS_PATH}/${ticketId}/attachments/${attachmentId}`);
  },

  // UPDATE a comment
  updateComment: (commentId, content) => {
    return apiClient.put(`${TICKETS_PATH}/comments/${commentId}`, { content });
  },

  // DELETE a comment
  deleteComment: (commentId) => {
    return apiClient.delete(`${TICKETS_PATH}/comments/${commentId}`);
  },
};

export default ticketService;
