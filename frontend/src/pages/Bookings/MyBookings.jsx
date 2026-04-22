import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { AlertCircle, CalendarPlus, Loader2, ChevronRight } from "lucide-react";
=======
import { AlertCircle, CalendarPlus, Loader2, Search } from "lucide-react";
>>>>>>> origin/oshada
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
    if (!window.confirm("Remove this booking?")) {
      return;
    }

    try {
      await bookingService.deleteBooking(bookingId);
      fetchBookings();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to remove booking."));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#CCD0CF' }}>My Reservations</h1>
          <p className="mt-1 font-medium text-sm" style={{ color: '#9BA8AB' }}>Track and manage your scheduled campus facility requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/bookings/new" 
            className="px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg"
            style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
          >
            <CalendarPlus className="w-4 h-4" />
            New Reservation
          </Link>
          {user?.role === "ADMIN" && (
            <Link 
              to="/bookings/admin" 
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border"
              style={{ backgroundColor: '#253745', borderColor: '#4A5C6A', color: '#CCD0CF' }}
            >
              Admin Central
            </Link>
          )}
        </div>
      </div>

<<<<<<< HEAD
      <div className="p-6 rounded-[24px] border flex flex-col md:flex-row md:items-center gap-6" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#11212D', color: '#4A5C6A' }}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#CCD0CF' }}>Filtering status</label>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl px-5 py-2.5 text-sm font-bold outline-none transition-all appearance-none border cursor-pointer"
          style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
        >
          <option value="">Full History</option>
          <option value="PENDING">Pending Verification</option>
          <option value="APPROVED">Authorized Only</option>
          <option value="REJECTED">Declined Requests</option>
          <option value="CANCELLED">Voided Ledger</option>
        </select>
=======
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
>>>>>>> origin/oshada
      </div>

      {error && (
        <div className="p-4 rounded-2xl flex items-center gap-3 border animate-shake" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1c4f78' }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Retrieving Ledger Entries...</p>
        </div>
      ) : bookings.length === 0 ? (
<<<<<<< HEAD
        <div className="py-24 text-center rounded-[32px] border" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
          <p className="font-bold italic" style={{ color: '#4A5C6A' }}>No reservations found for the selected parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
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
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Schedule:</span>
                    {formatBookingSlot(booking.bookingDate, booking.startTime, booking.endTime)}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Attendees:</span>
                    {booking.expectedAttendees}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 text-sm font-medium" style={{ color: '#9BA8AB' }}>
                    <span className="text-[10px] uppercase font-black" style={{ color: '#4A5C6A' }}>Objective:</span>
                    <span className="truncate max-w-md">{booking.purpose}</span>
                  </div>
                </div>

                {booking.decisionReason && (
                    <div className="mt-2 p-3 rounded-xl text-xs italic border" style={{ backgroundColor: '#11212D', borderColor: '#253745', color: '#4A5C6A' }}>
                        Admin response: {booking.decisionReason}
                    </div>
                )}
=======
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
>>>>>>> origin/oshada
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-inner ${getBookingStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <Link
                  to={`/bookings/${booking.id}`}
                  className="p-3 rounded-xl transition-all border group-hover:scale-110"
                  style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
                {(booking.status === "APPROVED" || booking.status === "REJECTED") && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="p-3 rounded-xl transition-all border group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                    title="Nullify Reservation"
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
