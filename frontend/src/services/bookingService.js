import apiClient from "./apiClient";

const bookingService = {
  createBooking: (bookingData) => apiClient.post("/bookings", bookingData),

  getMyBookings: (status) =>
    apiClient.get("/bookings/my", {
      params: status ? { status } : {},
    }),

  getAdminBookings: (status) =>
    apiClient.get("/bookings/admin", {
      params: status ? { status } : {},
    }),

  getBookingById: (id) => apiClient.get(`/bookings/${id}`),

  approveBooking: (id, reason) =>
    apiClient.put(`/bookings/${id}/approve`, {
      reason,
    }),

  rejectBooking: (id, reason) =>
    apiClient.put(`/bookings/${id}/reject`, {
      reason,
    }),

  cancelBooking: (id) => apiClient.put(`/bookings/${id}/cancel`),

  // UI-level delete behavior is mapped to cancel based on project decision.
  deleteBooking: (id) => apiClient.put(`/bookings/${id}/cancel`),
};

export default bookingService;
