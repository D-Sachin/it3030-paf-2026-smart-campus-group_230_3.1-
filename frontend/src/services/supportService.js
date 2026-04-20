import apiClient from "./apiClient";

const supportService = {
  submitSupportMessage: (payload) => apiClient.post("/support-messages", payload),
  getSupportMessages: () => apiClient.get("/support-messages"),
  deleteSupportMessage: (id) => apiClient.delete(`/support-messages/${id}`),
  getFAQs: () => apiClient.get("/faqs"),
  createFAQ: (payload) => apiClient.post("/faqs", payload),
  deleteFAQ: (id) => apiClient.delete(`/faqs/${id}`),
};

export default supportService;
