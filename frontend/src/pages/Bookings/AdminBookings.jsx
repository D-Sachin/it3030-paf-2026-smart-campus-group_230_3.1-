import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AlertCircle, Loader2, Search, Clock, CheckCircle2, XCircle, Check, X, ShieldAlert } from "lucide-react";
import bookingService from "../../services/bookingService";
import { formatBookingSlot, getBookingStatusColor } from "../../utils/bookingUtils";
import { getApiErrorMessage } from "../../utils/apiError";
import { useUser } from "../../context/UserContext";

const getStatusCardClasses = (statusFilter, targetStatus) => {
  const isActive = statusFilter === targetStatus;

  if (targetStatus === "PENDING") {
    return isActive
      ? "ring-2 ring-amber-300 shadow-amber-100/70 scale-[1.01]"
      : "hover:ring-1 hover:ring-amber-200";
  }

  if (targetStatus === "APPROVED") {
    return isActive
      ? "ring-2 ring-green-300 shadow-green-100/70 scale-[1.01]"
      : "hover:ring-1 hover:ring-green-200";
  }

  return isActive
    ? "ring-2 ring-red-300 shadow-red-100/70 scale-[1.01]"
    : "hover:ring-1 hover:ring-red-200";
};

const AdminBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
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
      fetchCounts();
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
      fetchCounts();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#CCD0CF' }}>Reservation Queue</h1>
          <p className="mt-1 font-medium text-sm" style={{ color: '#9BA8AB' }}>System-wide verification and processing of campus facility requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border shadow-inner" style={{ backgroundColor: 'rgba(28, 79, 120, 0.1)', color: '#1c4f78', borderColor: '#4A5C6A' }}>
            <ShieldAlert className="w-4 h-4" />
            Admin Authority
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => handleCardFilter("PENDING")}
          className={`p-6 rounded-[24px] border-l-4 text-left transition-all duration-300 hover:scale-[1.01] ${getStatusCardClasses(statusFilter, "PENDING")}`}
          style={{ backgroundColor: '#253745', borderColor: '#4A5C6A', borderLeftColor: '#fbbf24' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9BA8AB' }}>Pending</p>
              <h2 className="text-4xl font-black mt-2" style={{ color: '#fbbf24' }}>{counts.pending}</h2>
            </div>
            <Clock className="w-12 h-12 opacity-20" style={{ color: '#fbbf24' }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleCardFilter("APPROVED")}
          className={`p-6 rounded-[24px] border-l-4 text-left transition-all duration-300 hover:scale-[1.01] ${getStatusCardClasses(statusFilter, "APPROVED")}`}
          style={{ backgroundColor: '#253745', borderColor: '#4A5C6A', borderLeftColor: '#10b981' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9BA8AB' }}>Authorized</p>
              <h2 className="text-4xl font-black mt-2" style={{ color: '#10b981' }}>{counts.approved}</h2>
            </div>
            <CheckCircle2 className="w-12 h-12 opacity-20" style={{ color: '#10b981' }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleCardFilter("REJECTED")}
          className={`p-6 rounded-[24px] border-l-4 text-left transition-all duration-300 hover:scale-[1.01] ${getStatusCardClasses(statusFilter, "REJECTED")}`}
          style={{ backgroundColor: '#253745', borderColor: '#4A5C6A', borderLeftColor: '#ef4444' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9BA8AB' }}>Declined</p>
              <h2 className="text-4xl font-black mt-2" style={{ color: '#ef4444' }}>{counts.rejected}</h2>
            </div>
            <XCircle className="w-12 h-12 opacity-20" style={{ color: '#ef4444' }} />
          </div>
        </button>
      </div>

      <div className="p-6 rounded-[24px] border flex flex-col md:flex-row md:items-center gap-6" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#11212D', color: '#4A5C6A' }}>
                <Search className="w-4 h-4" />
              </div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#CCD0CF' }}>Search Queue</label>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by resource, user..."
              className="w-full rounded-xl px-5 py-2.5 text-sm font-bold outline-none transition-all border"
              style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#11212D', color: '#4A5C6A' }}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#CCD0CF' }}>Queue State</label>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl px-5 py-2.5 text-sm font-bold outline-none transition-all appearance-none border cursor-pointer"
              style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
            >
              <option value="">Full Archive</option>
              <option value="PENDING">Awaiting Verification</option>
              <option value="APPROVED">Authorized Only</option>
              <option value="REJECTED">Declined Inquiries</option>
              <option value="CANCELLED">Voided Ledger</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#11212D', color: '#4A5C6A' }}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#CCD0CF' }}>Sort Sequence</label>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl px-5 py-2.5 text-sm font-bold outline-none transition-all appearance-none border cursor-pointer"
              style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
            >
              <option value="dateDesc">Date (Newest)</option>
              <option value="dateAsc">Date (Oldest)</option>
              <option value="statusAsc">Status Hierarchy</option>
              <option value="resourceAsc">Resource Name</option>
              <option value="requesterAsc">Requester Name</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl flex items-center gap-3 border animate-shake" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1c4f78' }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Synchronizing Request Queue...</p>
        </div>
      ) : sortedBookings.length === 0 ? (
        <div className="py-24 text-center rounded-[32px] border" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
          <p className="font-bold italic" style={{ color: '#4A5C6A' }}>{searchTerm ? "No records match your search." : "The queue is currently clear."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="p-6 rounded-[32px] border flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all hover:shadow-2xl group" 
              style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: '#1c4f78' }} />
                  <h3 className="text-xl font-black" style={{ color: '#CCD0CF' }}>{booking.resourceName}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Requester:</span>
                    {booking.userName}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Schedule:</span>
                    {formatBookingSlot(booking.bookingDate, booking.startTime, booking.endTime)}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Attendees:</span>
                    {booking.expectedAttendees}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>ID:</span>
                    #{booking.id}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Purpose:</span>
                    <span className="truncate max-w-md">{booking.purpose}</span>
                  </div>
                </div>

                {booking.decisionReason && (
                    <div className="mt-2 p-3 rounded-xl text-xs italic border" style={{ backgroundColor: '#11212D', borderColor: '#253745', color: '#4A5C6A' }}>
                        System Log: {booking.decisionReason}
                    </div>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-inner ${getBookingStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <Link
                  to={`/bookings/${booking.id}`}
                  className="px-4 py-2 rounded-xl transition-all border font-bold text-sm"
                  style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                >
                  Review
                </Link>
                {booking.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      className="p-2.5 rounded-xl transition-all border"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.color = '#11212D'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = '#10b981'; }}
                      title="Authorize"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      className="p-2.5 rounded-xl transition-all border"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#CCD0CF'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      title="Decline"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
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
