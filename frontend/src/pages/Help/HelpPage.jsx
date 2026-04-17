import React, { useState } from "react";
import { HelpCircle, Mail, MessageSquareText, User, CheckCircle2 } from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
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
            </form>
          )}
        </section>

        <section className="premium-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;
