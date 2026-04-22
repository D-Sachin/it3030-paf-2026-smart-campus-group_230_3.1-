import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import bookingService from "../../services/bookingService";
import resourceService from "../../services/resourceService";
import { getApiErrorMessage } from "../../utils/apiError";
import NotificationPopup from "../../components/Shared/NotificationPopup";

const CreateBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  // Pre-select resource from URL query parameter
  useEffect(() => {
    const resourceId = searchParams.get("resourceId");
    if (resourceId) {
      setFormData((prev) => ({
        ...prev,
        resourceId: resourceId,
      }));
    }
  }, [searchParams]);

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
        <Link 
          to="/bookings/my" 
          className="flex items-center gap-2 font-medium transition-colors" 
          style={{ color: '#9BA8AB' }}
          onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
          onMouseLeave={e => e.currentTarget.style.color = '#9BA8AB'}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#4A5C6A' }}>NEW RESERVATION REQUEST</span>
      </div>

      <div className="rounded-[32px] overflow-hidden shadow-2xl border" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
        {/* Header */}
        <div className="p-8 border-b" style={{ borderColor: '#4A5C6A' }}>
          <h1 className="text-2xl font-black" style={{ color: '#CCD0CF' }}>Initiate Booking</h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#9BA8AB' }}>Request a resource by selecting date, time slot, and operational purpose.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {!fetchingResources && resources.length === 0 && (
            <div className="p-4 rounded-xl flex items-center justify-between gap-3 border" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
              <p className="text-sm font-bold uppercase tracking-wide">No active resources are currently available.</p>
              <button type="button" onClick={loadResources} className="text-xs font-black underline tracking-widest" disabled={fetchingResources}>
                RE-SYNC
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl flex items-center gap-3 border animate-shake" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>Target Resource</label>
              <select
                name="resourceId"
                value={formData.resourceId}
                onChange={handleInputChange}
                disabled={fetchingResources}
                className="w-full px-5 py-3.5 rounded-2xl outline-none font-bold transition-all border appearance-none"
                style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
              >
                <option value="" style={{ backgroundColor: '#06141B' }}>Select Asset</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id} style={{ backgroundColor: '#06141B' }}>
                    {resource.name} ({resource.location}) - Capacity {resource.capacity}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>Reservation Date</label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold border"
                style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1c4f78'}
                onBlur={e => e.currentTarget.style.borderColor = '#4A5C6A'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>Expected Attendees</label>
              <input
                type="number"
                min="1"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold border"
                style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1c4f78'}
                onBlur={e => e.currentTarget.style.borderColor = '#4A5C6A'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold border"
                style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1c4f78'}
                onBlur={e => e.currentTarget.style.borderColor = '#4A5C6A'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-bold border"
                style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1c4f78'}
                onBlur={e => e.currentTarget.style.borderColor = '#4A5C6A'}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>Operational Purpose</label>
              <textarea
                name="purpose"
                rows="4"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl outline-none transition-all font-medium border resize-none leading-relaxed"
                style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                placeholder="Describe why this resource is needed..."
                onFocus={e => e.currentTarget.style.borderColor = '#1c4f78'}
                onBlur={e => e.currentTarget.style.borderColor = '#4A5C6A'}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-6 border-t" style={{ borderColor: '#4A5C6A' }}>
            <button
              type="button"
              onClick={() => navigate("/bookings/my")}
              className="text-sm font-black uppercase tracking-widest transition-all"
              style={{ color: '#4A5C6A' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'}
              disabled={loading}
            >
              Discard Request
            </button>
            <button 
              type="submit" 
              className="px-10 py-4.5 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all" 
              style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Transmitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;
