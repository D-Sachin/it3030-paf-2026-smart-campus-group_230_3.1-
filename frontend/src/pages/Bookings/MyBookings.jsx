import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarPlus, Loader2 } from "lucide-react";
import bookingService from "../../services/bookingService";
import { formatBookingSlot, getBookingStatusColor } from "../../utils/bookingUtils";
import { getApiErrorMessage } from "../../utils/apiError";
import { useUser } from "../../context/UserContext";

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bookingService.getMyBookings(statusFilter || undefined);
      setBookings(response.data?.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to fetch your bookings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this approved booking?")) {
      return;
    }

    try {
      await bookingService.deleteBooking(bookingId);
      fetchBookings();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to cancel booking."));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Track and manage your booking requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/bookings/new" className="premium-button premium-button-primary">
            <CalendarPlus className="w-4 h-4" />
            New Booking
          </Link>
          {user?.role === "ADMIN" && (
            <Link to="/bookings/admin" className="premium-button">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="premium-card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Filter</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-medium"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-400 text-sm mt-2">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="premium-card p-12 text-center text-slate-500">No bookings found for selected filter.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="premium-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{booking.resourceName}</h3>
                <p className="text-sm text-slate-500">{formatBookingSlot(booking.bookingDate, booking.startTime, booking.endTime)}</p>
                <p className="text-sm text-slate-600">Purpose: {booking.purpose}</p>
                <p className="text-sm text-slate-600">Expected attendees: {booking.expectedAttendees}</p>
                {booking.decisionReason && <p className="text-sm text-slate-500">Admin note: {booking.decisionReason}</p>}
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getBookingStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <Link
                  to={`/bookings/${booking.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100"
                >
                  View
                </Link>
                {booking.status === "APPROVED" && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
