import React from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck, SlidersHorizontal, Bell, Palette } from "lucide-react";
import { useUser } from "../../context/UserContext";

const SettingsPage = () => {
  const { user } = useUser();

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const sections = [
    {
      title: "System Preferences",
      description: "Global application behavior and operational defaults.",
      icon: SlidersHorizontal,
      accent: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Notification Rules",
      description: "Alert channels, approvals, and admin-level delivery options.",
      icon: Bell,
      accent: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Branding",
      description: "Theme presets, naming, and visual identity controls.",
      icon: Palette,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Configuration workspace for platform-level controls.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Admin Only</span>
        </div>
      </div>

      <div className="premium-card p-8 text-center border border-dashed border-slate-200 bg-white">
        <h2 className="text-lg font-bold text-slate-900">Settings Page Ready</h2>
        <p className="text-sm text-slate-500 mt-2">
          No data is connected yet. This page is prepared for future settings modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="premium-card p-5">
            <div className={`inline-flex p-3 rounded-xl border ${section.accent}`}>
              <section.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-4">{section.title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{section.description}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-4">
              Coming Soon
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
