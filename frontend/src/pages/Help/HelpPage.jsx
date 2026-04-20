import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, HelpCircle, Mail, MessageSquareText, Plus, Trash2, User, X } from "lucide-react";
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Help and Support</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">
          Need assistance with resources, bookings, or incident management? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="premium-card p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">Contact Support</h2>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-700">Support request drafted</p>
                <p className="text-sm text-emerald-700/90 mt-1">
                  Your message is ready. API submission can be connected in the next step without changing this page layout.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</span>
                  <div className="relative mt-2">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</span>
                  <div className="relative mt-2">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                      required
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</span>
                <div className="relative mt-2">
                  <MessageSquareText className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the issue or question..."
                    rows={6}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                    required
                  />
                </div>
              </label>

              <button type="submit" className="premium-button premium-button-primary">
                <HelpCircle className="w-4 h-4" />
                Submit Message
              </button>

              {formStatus.text && (
                <div className={`rounded-2xl border p-4 flex items-start gap-3 text-sm font-medium ${
                  formStatus.type === "success"
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-700"
                }`}>
                  {formStatus.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                  )}
                  <span>{formStatus.text}</span>
                </div>
              )}
            </form>
          )}
        </section>

        <section className="premium-card p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setShowAddFAQModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-600 transition hover:bg-primary-100"
              >
                <Plus className="w-3.5 h-3.5" />
                Add FAQ
              </button>
            )}
          </div>

          {loadingFAQs ? (
            <div className="text-center text-slate-500 text-sm py-8">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">No FAQs available yet.</div>
          ) : (
            <div className="space-y-4">
              {faqs.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md hover:shadow-slate-200/70 flex justify-between items-start gap-3"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.answer}</p>
                  </div>
                  {user?.role === "ADMIN" && (
                    <button
                      onClick={() => handleDeleteFAQ(item.id)}
                      disabled={deletingFAQId === item.id}
                      className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}

          {showAddFAQModal && user?.role === "ADMIN" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Add New FAQ</h3>
                  <button
                    onClick={() => {
                      setShowAddFAQModal(false);
                      setFAQFormError("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddFAQSubmit} className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question</span>
                    <input
                      type="text"
                      name="question"
                      value={faqFormData.question}
                      onChange={handleAddFAQChange}
                      placeholder="Enter the FAQ question..."
                      className="w-full mt-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer</span>
                    <textarea
                      name="answer"
                      value={faqFormData.answer}
                      onChange={handleAddFAQChange}
                      placeholder="Enter the FAQ answer..."
                      rows={5}
                      className="w-full mt-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                      required
                    />
                  </label>

                  {faqFormError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{faqFormError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddFAQModal(false);
                        setFAQFormError("");
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold text-sm transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingFAQ}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-bold text-sm transition hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingFAQ ? "Creating..." : "Create FAQ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>

      {user?.role === "ADMIN" && (
        <section className="premium-card p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Support Inbox</h2>
              <p className="text-sm text-slate-500 mt-1">Recent help messages from users.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Clock3 className="w-4 h-4" />
              Live Queue
            </div>
          </div>

          {messageError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm mb-4">
              {messageError}
            </div>
          )}

          {loadingMessages ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading support messages...</div>
          ) : adminMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No support messages yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {adminMessages.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(item.id)}
                        disabled={deletingMessageId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingMessageId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{item.email}</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.message}</p>
                  <p className="text-[11px] text-slate-400 mt-4">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}
                  </p>
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
