import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarPlus, Loader2, Search } from "lucide-react";
import bookingService from "../../services/bookingService";
import { formatBookingSlot, getBookingStatusColor } from "../../utils/bookingUtils";
import { getApiErrorMessage } from "../../utils/apiError";
import { useUser } from "../../context/UserContext";

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBookings = normalizedSearch
    ? bookings.filter((booking) => {
        const searchableText = [
          booking.resourceName,
          booking.purpose,
          booking.status,
          booking.bookingDate,
          booking.startTime,
          booking.endTime,
          booking.decisionReason,
          booking.expectedAttendees,
        ]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
    : bookings;

  const getBookingDateTime = (booking) => {
    const date = booking.bookingDate || "1970-01-01";
    const time = booking.startTime || "00:00:00";
    return new Date(`${date}T${time}`).getTime();
  };

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "dateDesc") {
      return getBookingDateTime(b) - getBookingDateTime(a);
    }

    if (sortBy === "dateAsc") {
      return getBookingDateTime(a) - getBookingDateTime(b);
    }

    if (sortBy === "statusAsc") {
      const statusCompare = (a.status || "").localeCompare(b.status || "");
      return statusCompare !== 0 ? statusCompare : getBookingDateTime(b) - getBookingDateTime(a);
    }

    if (sortBy === "resourceAsc") {
      const resourceCompare = (a.resourceName || "").localeCompare(b.resourceName || "");
      return resourceCompare !== 0 ? resourceCompare : getBookingDateTime(b) - getBookingDateTime(a);
    }

    if (sortBy === "attendeesDesc") {
      const attendeesA = Number(a.expectedAttendees) || 0;
      const attendeesB = Number(b.expectedAttendees) || 0;
      if (attendeesA !== attendeesB) {
        return attendeesB - attendeesA;
      }
      return getBookingDateTime(b) - getBookingDateTime(a);
    }

    return getBookingDateTime(b) - getBookingDateTime(a);
  });

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

      <div className="premium-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Bookings</label>
          <div className="relative mt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resource, purpose, status, or date"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full mt-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <option value="dateDesc">Date (newest first)</option>
            <option value="dateAsc">Date (oldest first)</option>
            <option value="statusAsc">Status (A-Z)</option>
            <option value="resourceAsc">Resource name (A-Z)</option>
            <option value="attendeesDesc">Expected attendees (high-low)</option>
          </select>
        </div>
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
      ) : filteredBookings.length === 0 ? (
        <div className="premium-card p-12 text-center text-slate-500">No bookings match your search.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedBookings.map((booking) => (
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
                    Cancel
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
