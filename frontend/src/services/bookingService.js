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

  deleteBooking: (id) => apiClient.delete(`/bookings/${id}`),
};

export default bookingService;
