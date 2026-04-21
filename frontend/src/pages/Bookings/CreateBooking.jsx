import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import bookingService from "../../services/bookingService";
import resourceService from "../../services/resourceService";
import { getApiErrorMessage } from "../../utils/apiError";
import NotificationPopup from "../../components/Shared/NotificationPopup";

const CreateBooking = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingResources, setFetchingResources] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const redirectTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });

  const loadResources = async () => {
    setFetchingResources(true);
    try {
      const response = await resourceService.getActiveResources();
      setResources(response.data?.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load active resources."));
    } finally {
      setFetchingResources(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.resourceId || !formData.bookingDate || !formData.startTime || !formData.endTime || !formData.purpose) {
      return "All fields are required.";
    }

    if (formData.startTime >= formData.endTime) {
      return "Start time must be earlier than end time.";
    }

    if (Number(formData.expectedAttendees) < 1) {
      return "Expected attendees must be at least 1.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        resourceId: Number(formData.resourceId),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: Number(formData.expectedAttendees),
      };

      await bookingService.createBooking(payload);
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
      setPopup({
        isOpen: true,
        type: "success",
        title: "Booking Submitted",
        message: "Your booking request was submitted successfully. Redirecting to My Bookings...",
      });
      redirectTimerRef.current = window.setTimeout(() => {
        navigate("/bookings/my");
      }, 2000);
    } catch (err) {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      setPopup({
        isOpen: true,
        type: "error",
        title: "Booking Failed",
        message: getApiErrorMessage(err, "Failed to create booking."),
      });
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setPopup((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <NotificationPopup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
        autoDismissMs={2000}
        showProgressBar
        showCountdown={popup.type === "success"}
      />

      <div className="flex items-center justify-between">
        <Link to="/bookings/my" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>
        <span className="text-sm font-bold text-slate-400">NEW BOOKING REQUEST</span>
      </div>

      <form onSubmit={handleSubmit} className="premium-card p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Create Booking</h1>
        <p className="text-slate-500">Request a resource by selecting date, time slot, and purpose.</p>
        {!fetchingResources && resources.length === 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between gap-3 text-amber-800">
            <p className="text-sm font-medium">No active resources are currently available.</p>
            <button type="button" onClick={loadResources} className="text-sm font-bold underline" disabled={fetchingResources}>
              Retry
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Resource</label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleInputChange}
              disabled={fetchingResources}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500"
            >
              <option value="">Select Resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.location}) - Capacity {resource.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Date</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Expected Attendees</label>
            <input
              type="number"
              min="1"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Purpose</label>
            <textarea
              name="purpose"
              rows="4"
              value={formData.purpose}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/bookings/my")}
            className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="premium-button premium-button-primary px-8" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBooking;
