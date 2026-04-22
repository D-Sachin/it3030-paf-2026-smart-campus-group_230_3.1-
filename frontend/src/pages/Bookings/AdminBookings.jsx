import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AlertCircle, Loader2, Search, Clock, CheckCircle2, XCircle } from "lucide-react";
import bookingService from "../../services/bookingService";
import { formatBookingSlot, getBookingStatusColor } from "../../utils/bookingUtils";
import { getApiErrorMessage } from "../../utils/apiError";
import { useUser } from "../../context/UserContext";

const getStatusCardClasses = (statusFilter, targetStatus) => {
  const isActive = statusFilter === targetStatus;

  if (targetStatus === "PENDING") {
    return isActive
      ? "ring-2 ring-amber-300 shadow-amber-100/70 scale-[1.01] status-card-active-amber"
      : "hover:ring-1 hover:ring-amber-200";
  }

  if (targetStatus === "APPROVED") {
    return isActive
      ? "ring-2 ring-green-300 shadow-green-100/70 scale-[1.01] status-card-active-green"
      : "hover:ring-1 hover:ring-green-200";
  }

  return isActive
    ? "ring-2 ring-red-300 shadow-red-100/70 scale-[1.01] status-card-active-red"
    : "hover:ring-1 hover:ring-red-200";
};

const AdminBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bookingService.getAdminBookings(statusFilter || undefined);
      setBookings(response.data?.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load admin bookings."));
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const pendingRes = await bookingService.getAdminBookings("PENDING");
      const approvedRes = await bookingService.getAdminBookings("APPROVED");
      const rejectedRes = await bookingService.getAdminBookings("REJECTED");

      setCounts({
        pending: pendingRes.data?.data?.length || 0,
        approved: approvedRes.data?.data?.length || 0,
        rejected: rejectedRes.data?.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCounts();
  }, [statusFilter]);

  const handleApprove = async (bookingId) => {
    const note = window.prompt("Approval note (optional):", "Approved by admin") || "Approved by admin";
    try {
      await bookingService.approveBooking(bookingId, note);
      fetchBookings();
    } catch (err) {
      setError(getApiErrorMessage(err, "Approval failed."));
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt("Rejection reason (required):");
    if (!reason) {
      return;
    }

    try {
      await bookingService.rejectBooking(bookingId, reason);
      fetchBookings();
    } catch (err) {
      setError(getApiErrorMessage(err, "Rejection failed."));
    }
  };

  const handleCardFilter = (status) => {
    setStatusFilter(status);
    setSearchTerm("");
  };

  if (user?.role !== "ADMIN") {
    return <Navigate to="/bookings/my" replace />;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBookings = normalizedSearch
    ? bookings.filter((booking) => {
        const searchableText = [
          booking.resourceName,
          booking.userName,
          booking.purpose,
          booking.status,
          booking.bookingDate,
          booking.startTime,
          booking.endTime,
        ]
          .filter(Boolean)
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

    if (sortBy === "requesterAsc") {
      const requesterCompare = (a.userName || "").localeCompare(b.userName || "");
      return requesterCompare !== 0 ? requesterCompare : getBookingDateTime(b) - getBookingDateTime(a);
    }

    return getBookingDateTime(b) - getBookingDateTime(a);
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Booking Management</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Review and process booking requests.</p>
      </div>

      {/* Booking Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Card */}
        <button
          type="button"
          onClick={() => handleCardFilter("PENDING")}
          className={`premium-card p-6 border-l-4 border-l-amber-500 text-left transition-all duration-300 hover:scale-[1.01] ${getStatusCardClasses(statusFilter, "PENDING")}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Bookings</p>
              <h2 className="text-4xl font-bold text-amber-600 mt-2">{counts.pending}</h2>
            </div>
            <Clock className="w-12 h-12 text-amber-200" />
          </div>
        </button>

        {/* Approved Card */}
        <button
          type="button"
          onClick={() => handleCardFilter("APPROVED")}
          className={`premium-card p-6 border-l-4 border-l-green-500 text-left transition-all duration-300 hover:scale-[1.01] ${getStatusCardClasses(statusFilter, "APPROVED")}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Approved Bookings</p>
              <h2 className="text-4xl font-bold text-green-600 mt-2">{counts.approved}</h2>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-200" />
          </div>
        </button>

        {/* Rejected Card */}
        <button
          type="button"
          onClick={() => handleCardFilter("REJECTED")}
          className={`premium-card p-6 border-l-4 border-l-red-500 text-left transition-all duration-300 hover:scale-[1.01] ${getStatusCardClasses(statusFilter, "REJECTED")}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rejected Bookings</p>
              <h2 className="text-4xl font-bold text-red-600 mt-2">{counts.rejected}</h2>
            </div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
        </button>
      </div>

      <div className="premium-card p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Bookings</label>
          <div className="relative mt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resource, requester, purpose, status, or date"
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
            <option value="requesterAsc">Requester name (A-Z)</option>
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
          <p className="text-slate-400 text-sm mt-2">Loading booking queue...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div key={`empty-${statusFilter}`} className="premium-card p-12 text-center text-slate-500 animate-booking-filter-switch">
          {searchTerm ? "No bookings match your search." : "No bookings found for selected filter."}
        </div>
      ) : (
        <div key={`list-${statusFilter}`} className="grid grid-cols-1 gap-4 animate-booking-filter-switch">
          {sortedBookings.map((booking) => (
            <div key={booking.id} className="premium-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{booking.resourceName}</h3>
                <p className="text-sm text-slate-500">Requester: {booking.userName}</p>
                <p className="text-sm text-slate-500">{formatBookingSlot(booking.bookingDate, booking.startTime, booking.endTime)}</p>
                <p className="text-sm text-slate-600">Purpose: {booking.purpose}</p>
                <p className="text-sm text-slate-600">Expected attendees: {booking.expectedAttendees}</p>
                {booking.decisionReason && <p className="text-sm text-slate-500">Decision note: {booking.decisionReason}</p>}
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
                {booking.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(booking.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
