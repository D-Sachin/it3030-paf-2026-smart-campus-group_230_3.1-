import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarPlus, Loader2, ChevronRight } from "lucide-react";
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
                {booking.status === "APPROVED" && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="p-3 rounded-xl transition-all border group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                    title="Nullify Reservation"
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
