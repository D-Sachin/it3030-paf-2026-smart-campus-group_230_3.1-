import apiClient from "./apiClient";

const supportService = {
  submitSupportMessage: (payload) => apiClient.post("/support-messages", payload),
  getSupportMessages: () => apiClient.get("/support-messages"),
};

export default supportService;