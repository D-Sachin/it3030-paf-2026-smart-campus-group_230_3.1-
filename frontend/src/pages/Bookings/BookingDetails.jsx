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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <Link to="/bookings/my" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>
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
          <p className="text-slate-400 text-sm mt-2">Loading booking details...</p>
        </div>
      ) : !booking ? (
        <div className="premium-card p-12 text-center text-slate-500">Booking not found.</div>
      ) : (
        <div className="premium-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Booking #{booking.id}</h1>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getBookingStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider">Resource</p>
              <p className="text-slate-900 font-semibold mt-1">{booking.resourceName}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider">Requester</p>
              <p className="text-slate-900 font-semibold mt-1">{booking.userName}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider">Schedule</p>
              <p className="text-slate-900 font-semibold mt-1">{formatBookingSlot(booking.bookingDate, booking.startTime, booking.endTime)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider">Purpose</p>
              <p className="text-slate-700 mt-1">{booking.purpose}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider">Expected Attendees</p>
              <p className="text-slate-900 font-semibold mt-1">{booking.expectedAttendees}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider">Decision Note</p>
              <p className="text-slate-700 mt-1">{booking.decisionReason || "-"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {booking.status === "PENDING" && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 disabled:opacity-60"
                  disabled={actionLoading}
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 disabled:opacity-60"
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </>
            )}

            {booking.status === "APPROVED" && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 disabled:opacity-60"
                disabled={actionLoading}
              >
                Delete (Cancel)
              </button>
            )}

            <button
              onClick={() => navigate("/bookings/my")}
              className="px-4 py-2 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100"
              disabled={actionLoading}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
