import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import bookingService from "../../services/bookingService";
import { formatBookingSlot, getBookingStatusColor } from "../../utils/bookingUtils";
import { getApiErrorMessage } from "../../utils/apiError";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await bookingService.getBookingById(id);
      setBooking(response.data?.data || null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to fetch booking details."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const withAction = async (action) => {
    setActionLoading(true);
    setError("");
    try {
      await action();
      await loadBooking();
    } catch (err) {
      setError(getApiErrorMessage(err, "Booking action failed."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => {
    const note = window.prompt("Approval note (optional):", "Approved by admin") || "Approved by admin";
    withAction(() => bookingService.approveBooking(id, note));
  };

  const handleReject = () => {
    const reason = window.prompt("Rejection reason (required):");
    if (!reason) {
      return;
    }
    withAction(() => bookingService.rejectBooking(id, reason));
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this booking? This maps to booking cancellation.")) {
      return;
    }
    withAction(() => bookingService.deleteBooking(id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1c4f78' }} />
        <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: '#4A5C6A' }}>Retrieving Reservation Details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="rounded-2xl p-6 flex flex-col items-center gap-4 text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="font-bold" style={{ color: '#ef4444' }}>{error || "Booking not found."}</p>
          <button onClick={() => navigate('/bookings/my')} className="premium-button" style={{ backgroundColor: '#11212D', color: '#CCD0CF' }}>
            <ArrowLeft className="w-4 h-4" />
            Return to Ledger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <Link to="/bookings/my" className="flex items-center gap-2 font-medium transition-colors" style={{ color: '#9BA8AB' }} onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'} onMouseLeave={e => e.currentTarget.style.color = '#9BA8AB'}>
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>
      </div>

      <div className="rounded-[32px] overflow-hidden shadow-2xl border" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
        {/* Header */}
        <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: '#4A5C6A' }}>
          <div>
            <h1 className="text-2xl font-black" style={{ color: '#CCD0CF' }}>Reservation #{booking.id}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#4A5C6A' }}>Global Facility Management</p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-inner ${getBookingStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: '#4A5C6A' }}>Target Asset</p>
              <div className="p-4 rounded-2xl border flex items-center" style={{ backgroundColor: '#11212D', borderColor: '#253745' }}>
                <p className="font-black text-lg" style={{ color: '#CCD0CF' }}>{booking.resourceName}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: '#4A5C6A' }}>Primary User</p>
              <div className="p-4 rounded-2xl border flex items-center" style={{ backgroundColor: '#11212D', borderColor: '#253745' }}>
                <p className="font-bold" style={{ color: '#CCD0CF' }}>{booking.userName}</p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: '#4A5C6A' }}>Scheduled Window</p>
              <div className="p-4 rounded-2xl border flex items-center" style={{ backgroundColor: '#11212D', borderColor: '#253745' }}>
                <p className="font-bold text-lg" style={{ color: '#CCD0CF' }}>{formatBookingSlot(booking.bookingDate, booking.startTime, booking.endTime)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: '#4A5C6A' }}>Operational Purpose</p>
            <div className="p-6 rounded-2xl border leading-relaxed" style={{ backgroundColor: 'rgba(6, 20, 27, 0.4)', borderColor: '#4A5C6A', color: '#CCD0CF' }}>
              <p>{booking.purpose}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: '#4A5C6A' }}>Attendee Threshold</p>
              <p className="font-black text-xl ml-2" style={{ color: '#CCD0CF' }}>{booking.expectedAttendees}</p>
            </div>
            <div className="space-y-1">
              <p className="uppercase text-[10px] font-black tracking-[0.2em]" style={{ color: '#4A5C6A' }}>System Decision Note</p>
              <p className="font-medium italic ml-2" style={{ color: '#9BA8AB' }}>{booking.decisionReason || "Awaiting verification..."}</p>
            </div>
          </div>
        </div>

        {/* Action Tray */}
        <div className="px-8 py-6 border-t flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A' }}>
          <div className="flex gap-3">
            {booking.status === "PENDING" && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.color = '#11212D'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = '#10b981'; }}
                  disabled={actionLoading}
                >
                  Authorize
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#CCD0CF'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                  disabled={actionLoading}
                >
                  Decline
                </button>
              </>
            )}

            {booking.status === "APPROVED" && (
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#CCD0CF'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                disabled={actionLoading}
              >
                Nullify Reservation
              </button>
            )}
          </div>

          <button
            onClick={() => navigate("/bookings/my")}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
            style={{ backgroundColor: '#253745', color: '#CCD0CF', border: '1px solid #4A5C6A' }}
            disabled={actionLoading}
          >
            Ledger View
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
