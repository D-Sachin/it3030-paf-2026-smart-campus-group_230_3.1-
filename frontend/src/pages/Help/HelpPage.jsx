import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, HelpCircle, Mail, MessageSquareText, User, Loader2 } from "lucide-react";
import supportService from "../../services/supportService";
import { useUser } from "../../context/UserContext";

const faqs = [
  {
    question: "How quickly will support respond?",
    answer: "Most questions receive a response within one business day. Urgent campus service issues are prioritized.",
  },
  {
    question: "What details should I include in my message?",
    answer: "Include the feature/page name, what happened, and any error text you saw. Clear details help us resolve issues faster.",
  },
  {
    question: "Can I request booking or ticketing guidance here?",
    answer: "Yes. Use this page for help with resources, bookings, incidents, and general SmartCampus Hub workflows.",
  },
  {
    question: "Is this form available to all users?",
    answer: "Yes. The Help and Support page is available for all logged-in users.",
  },
];

const HelpPage = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [formStatus, setFormStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessageError("");

      try {
        const response = await supportService.getSupportMessages();
        setAdminMessages(response.data?.data || []);
      } catch (error) {
        setMessageError("Failed to load support messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [user?.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormStatus({ type: "", text: "" });

    try {
      await supportService.submitSupportMessage(formData);
      setSubmitted(true);
      setFormStatus({ type: "success", text: "Support message submitted successfully." });
      setFormData({ name: "", email: "", message: "" });

      if (user?.role === "ADMIN") {
        const response = await supportService.getSupportMessages();
        setAdminMessages(response.data?.data || []);
      }
    } catch (error) {
      setFormStatus({ type: "error", text: "Unable to submit your message right now." });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#CCD0CF' }}>Help and Support</h1>
        <p className="mt-1 font-medium text-sm" style={{ color: '#9BA8AB' }}>
          Need assistance with resources, bookings, or incident management? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="p-8 xl:col-span-2 rounded-[32px] shadow-xl border" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
          <div className="flex items-center gap-2 mb-8 pb-4 border-b" style={{ borderColor: '#4A5C6A' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 112, 163, 0.15)', color: '#1c4f78' }}>
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#CCD0CF' }}>Contact Support</h2>
          </div>

          {submitted ? (
            <div className="rounded-2xl border p-6 flex flex-col items-center gap-4 text-center animate-fade-in" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#11212D', color: '#10b981' }}>
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#10b981' }}>Inquiry Transmitted</h3>
              <p className="max-w-md font-medium" style={{ color: '#CCD0CF' }}>
                Your support message has been successfully logged. Our campus operations team will review it and respond shortly.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 px-8 py-2.5 rounded-xl font-bold transition-all"
                style={{ backgroundColor: '#11212D', color: '#CCD0CF', border: '1px solid #253745' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: '#4A5C6A' }}>Name</span>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4A5C6A' }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl outline-none transition-all font-medium border"
                      style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: '#4A5C6A' }}>Email Address</span>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4A5C6A' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl outline-none transition-all font-medium border"
                      style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: '#4A5C6A' }}>Your Message</span>
                <div className="relative">
                  <MessageSquareText className="w-4 h-4 absolute left-4 top-4" style={{ color: '#4A5C6A' }} />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the issue or question..."
                    rows={6}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl outline-none transition-all font-medium border resize-none leading-relaxed"
                    style={{ backgroundColor: '#11212D', borderColor: '#4A5C6A', color: '#CCD0CF' }}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                {formStatus.text && formStatus.type === "error" ? (
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#ef4444' }}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{formStatus.text}</span>
                  </div>
                ) : <div />}
                
                <button 
                  type="submit" 
                  className="premium-button px-10 py-3.5 flex items-center gap-2"
                  style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
                >
                  <HelpCircle className="w-4 h-4" />
                  Submit Inquiry
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="p-8 rounded-[32px] shadow-xl border h-fit" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
          <div className="flex items-center gap-2 mb-8 pb-4 border-b" style={{ borderColor: '#4A5C6A' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#CCD0CF' }}>General FAQ</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
              >
                <h3 className="text-sm font-bold transition-colors group-hover:text-amber-400" style={{ color: '#CCD0CF' }}>{item.question}</h3>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: '#9BA8AB' }}>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {user?.role === "ADMIN" && (
        <section className="p-8 rounded-[32px] shadow-xl border overflow-hidden" style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}>
          <div className="flex items-center justify-between gap-3 mb-8 pb-4 border-b" style={{ borderColor: '#4A5C6A' }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#CCD0CF' }}>Support Inbox</h2>
              <p className="text-sm mt-1" style={{ color: '#9BA8AB' }}>Recent help messages from users.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#4A5C6A' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Queue
            </div>
          </div>

          {messageError && (
            <div className="p-4 rounded-2xl font-bold text-sm mb-4 border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              {messageError}
            </div>
          )}

          {loadingMessages ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1c4f78' }} />
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Synchronizing Inbox...</p>
            </div>
          ) : adminMessages.length === 0 ? (
            <div className="py-20 text-center rounded-3xl" style={{ backgroundColor: '#11212D' }}>
              <p className="italic font-medium" style={{ color: '#4A5C6A' }}>No support messages detected in queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {adminMessages.map((item) => (
                <article 
                  key={item.id} 
                  className="rounded-2xl border p-6 transition-all hover:shadow-xl" 
                  style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="font-bold" style={{ color: '#CCD0CF' }}>{item.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest" style={{ backgroundColor: 'rgba(45, 112, 163, 0.2)', color: '#1c4f78', border: '1px solid rgba(45, 112, 163, 0.3)' }}>NEW</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#4A5C6A' }}>{item.email}</p>
                    <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ backgroundColor: '#06141B', color: '#CCD0CF' }}>
                      <p className="whitespace-pre-line">{item.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase" style={{ color: '#4A5C6A' }}>
                      <Clock3 className="w-3 h-3" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default HelpPage;
