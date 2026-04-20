import apiClient from "./apiClient";

const notificationService = {
  getNotifications: () => apiClient.get("/notifications"),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put("/notifications/read-all"),
};

export default notificationService;