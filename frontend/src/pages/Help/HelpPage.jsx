import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, HelpCircle, Mail, MessageSquareText, Plus, Trash2, User, X, Loader2 } from "lucide-react";
import supportService from "../../services/supportService";
import { useUser } from "../../context/UserContext";

const HelpPage = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [faqs, setFAQs] = useState([]);
  const [loadingFAQs, setLoadingFAQs] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [messageError, setMessageError] = useState("");
  const [formStatus, setFormStatus] = useState({ type: "", text: "" });
  const [showAddFAQModal, setShowAddFAQModal] = useState(false);
  const [faqFormData, setFAQFormData] = useState({ question: "", answer: "" });
  const [faqFormError, setFAQFormError] = useState("");
  const [submittingFAQ, setSubmittingFAQ] = useState(false);
  const [deletingFAQId, setDeletingFAQId] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoadingFAQs(true);
      try {
        const response = await supportService.getFAQs();
        setFAQs(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load FAQs");
      } finally {
        setLoadingFAQs(false);
      }
    };

    fetchFAQs();
  }, []);

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

  useEffect(() => {
    if (!showAddFAQModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAddFAQModal]);

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

  const handleDeleteMessage = async (messageId) => {
    const confirmed = window.confirm("Are you sure you want to delete this support message?");
    if (!confirmed) {
      return;
    }

    setDeletingMessageId(messageId);
    setMessageError("");

    try {
      await supportService.deleteSupportMessage(messageId);
      setAdminMessages((prev) => prev.filter((message) => message.id !== messageId));
    } catch (error) {
      setMessageError("Failed to delete support message.");
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleAddFAQChange = (event) => {
    const { name, value } = event.target;
    setFAQFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFAQSubmit = async (event) => {
    event.preventDefault();
    setFAQFormError("");

    if (!faqFormData.question.trim() || !faqFormData.answer.trim()) {
      setFAQFormError("Both question and answer are required.");
      return;
    }

    setSubmittingFAQ(true);

    try {
      await supportService.createFAQ(faqFormData);
      const response = await supportService.getFAQs();
      setFAQs(response.data?.data || []);
      setFAQFormData({ question: "", answer: "" });
      setShowAddFAQModal(false);
    } catch (error) {
      setFAQFormError("Failed to create FAQ. Please try again.");
    } finally {
      setSubmittingFAQ(false);
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    const confirmed = window.confirm("Are you sure you want to delete this FAQ?");
    if (!confirmed) {
      return;
    }

    setDeletingFAQId(faqId);

    try {
      await supportService.deleteFAQ(faqId);
      setFAQs((prev) => prev.filter((faq) => faq.id !== faqId));
    } catch (error) {
      alert("Failed to delete FAQ.");
    } finally {
      setDeletingFAQId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="pb-2">
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#CCD0CF' }}>Help and Support</h1>
        <p className="mt-2 text-base font-medium" style={{ color: '#9BA8AB' }}>
          Need assistance with resources, bookings, or incident management? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Contact Support Form */}
        <section 
          className="xl:col-span-3 rounded-2xl p-8 border"
          style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(28, 79, 120, 0.2)' }}>
              <Mail className="w-6 h-6" style={{ color: '#1c4f78' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#CCD0CF' }}>Contact Support</h2>
          </div>

          <div 
            className="w-full h-px mb-8" 
            style={{ backgroundColor: '#253745' }}
          ></div>

          {submitted ? (
            <div 
              className="rounded-2xl border p-6 flex items-start gap-4"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-400 text-lg">Message Submitted Successfully</p>
                <p className="text-emerald-400/80 mt-1">
                  We've received your request and our support team will get back to you within one business day.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-emerald-400 font-bold hover:underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9BA8AB' }}>
                    Name
                  </label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: '#4A5C6A' }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border outline-none transition-all duration-200 font-medium placeholder:text-[#4A5C6A]"
                      style={{ 
                        backgroundColor: '#06141B', 
                        borderColor: '#253745',
                        color: '#CCD0CF'
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9BA8AB' }}>
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: '#4A5C6A' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border outline-none transition-all duration-200 font-medium placeholder:text-[#4A5C6A]"
                      style={{ 
                        backgroundColor: '#06141B', 
                        borderColor: '#253745',
                        color: '#CCD0CF'
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9BA8AB' }}>
                  Your Message
                </label>
                <div className="relative group">
                  <MessageSquareText className="w-5 h-5 absolute left-4 top-5 transition-colors duration-200" style={{ color: '#4A5C6A' }} />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the issue or question..."
                    rows={6}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border outline-none transition-all duration-200 font-medium resize-none placeholder:text-[#4A5C6A]"
                    style={{ 
                      backgroundColor: '#06141B', 
                      borderColor: '#253745',
                      color: '#CCD0CF'
                    }}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="premium-button flex items-center gap-3 px-8 py-4 text-lg"
                  style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
                >
                  <HelpCircle className="w-5 h-5" />
                  Submit Inquiry
                </button>
              </div>

              {formStatus.text && (
                <div 
                  className="rounded-2xl border p-4 flex items-start gap-4 text-sm font-medium animate-fade-in"
                  style={formStatus.type === "success" 
                    ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }
                    : { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
                  }
                >
                  {formStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <span>{formStatus.text}</span>
                </div>
              )}
            </form>
          )}
        </section>

        {/* General FAQ Sidebar */}
        <section 
          className="rounded-2xl p-6 border flex flex-col h-fit"
          style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
        >
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(155, 168, 171, 0.1)' }}>
                <HelpCircle className="w-5 h-5" style={{ color: '#9BA8AB' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#CCD0CF' }}>General FAQ</h2>
            </div>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setShowAddFAQModal(true)}
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
                title="Add FAQ"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {loadingFAQs ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1c4f78' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Loading FAQs...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium" style={{ color: '#4A5C6A' }}>
                No FAQs available yet.
              </div>
            ) : (
              faqs.map((item) => (
                <article
                  key={item.id}
                  className="group rounded-xl border p-5 transition-all duration-300 hover:shadow-lg"
                  style={{ 
                    backgroundColor: '#06141B', 
                    borderColor: '#253745'
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold leading-snug" style={{ color: '#CCD0CF' }}>{item.question}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#9BA8AB' }}>{item.answer}</p>
                    </div>
                    {user?.role === "ADMIN" && (
                      <button
                        onClick={() => handleDeleteFAQ(item.id)}
                        disabled={deletingFAQId === item.id}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Admin Message Queue Section */}
      {user?.role === "ADMIN" && (
        <section 
          className="rounded-2xl p-8 border mt-8"
          style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
        >
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(28, 79, 120, 0.2)' }}>
                <MessageSquareText className="w-6 h-6" style={{ color: '#1c4f78' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#CCD0CF' }}>Support Inbox</h2>
                <p className="text-sm font-medium mt-1" style={{ color: '#9BA8AB' }}>Manage incoming user inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: '#253745', backgroundColor: '#06141B' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9BA8AB' }}>Live Queue</span>
            </div>
          </div>

          {messageError && (
            <div className="p-4 rounded-xl border mb-8 flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold">{messageError}</span>
            </div>
          )}

          {loadingMessages ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#1c4f78' }} />
              <p className="font-bold uppercase tracking-widest text-sm" style={{ color: '#4A5C6A' }}>Syncing Inbox...</p>
            </div>
          ) : adminMessages.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-[#06141B] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" style={{ color: '#253745' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#CCD0CF' }}>Inbox Cleared</h3>
              <p className="text-sm font-medium mt-2" style={{ color: '#9BA8AB' }}>There are no pending support messages at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminMessages.map((item) => (
                <article 
                  key={item.id} 
                  className="rounded-2xl border p-6 flex flex-col justify-between"
                  style={{ backgroundColor: '#06141B', borderColor: '#253745' }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg" style={{ color: '#CCD0CF' }}>{item.name}</h3>
                        <p className="text-xs font-bold" style={{ color: '#9BA8AB' }}>{item.email}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(item.id)}
                        disabled={deletingMessageId === item.id}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#CCD0CF' }}>{item.message}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t" style={{ borderColor: '#253745' }}>
                    <div className="flex items-center gap-2" style={{ color: '#4A5C6A' }}>
                      <Clock3 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Received Just Now"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* FAQ Modal Section */}
      {showAddFAQModal && user?.role === "ADMIN" && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm px-4 py-12"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddFAQModal(false);
              setFAQFormError("");
            }
          }}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="rounded-2xl shadow-2xl max-w-xl w-full p-8 border" style={{ backgroundColor: '#11212D', borderColor: '#253745' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold" style={{ color: '#CCD0CF' }}>Add New FAQ</h3>
                <button
                  onClick={() => {
                    setShowAddFAQModal(false);
                    setFAQFormError("");
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: '#9BA8AB' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddFAQSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9BA8AB' }}>Question</label>
                  <input
                    type="text"
                    name="question"
                    autoComplete="off"
                    value={faqFormData.question}
                    onChange={handleAddFAQChange}
                    placeholder="Enter the FAQ question..."
                    className="w-full px-5 py-4 rounded-xl border outline-none transition-all duration-200 font-medium placeholder:text-[#4A5C6A]"
                    style={{ backgroundColor: '#06141B', borderColor: '#253745', color: '#CCD0CF' }}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9BA8AB' }}>Answer</label>
                  <textarea
                    name="answer"
                    autoComplete="off"
                    value={faqFormData.answer}
                    onChange={handleAddFAQChange}
                    placeholder="Enter the FAQ answer..."
                    rows={6}
                    className="w-full px-5 py-4 rounded-xl border outline-none transition-all duration-200 font-medium resize-none placeholder:text-[#4A5C6A]"
                    style={{ backgroundColor: '#06141B', borderColor: '#253745', color: '#CCD0CF' }}
                    required
                  />
                </div>

                {faqFormError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{faqFormError}</span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFAQModal(false);
                      setFAQFormError("");
                    }}
                    className="flex-1 px-8 py-4 rounded-xl border font-bold text-sm transition-all duration-200 hover:bg-white/5"
                    style={{ borderColor: '#253745', color: '#9BA8AB' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFAQ}
                    className="flex-1 px-8 py-4 rounded-xl bg-[#1c4f78] text-[#CCD0CF] font-bold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  >
                    {submittingFAQ ? "Creating..." : "Create FAQ Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
