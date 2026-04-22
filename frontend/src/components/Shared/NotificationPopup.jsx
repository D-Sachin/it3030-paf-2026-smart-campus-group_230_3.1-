import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const DEFAULT_AUTO_DISMISS_MS = 2000;

const NotificationPopup = ({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
  autoDismissMs = DEFAULT_AUTO_DISMISS_MS,
  showProgressBar = true,
  closeLabel,
  showCountdown = true,
  compact = false,
}) => {
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return undefined;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoDismissMs <= 0) {
      return undefined;
    }

    const startedAt = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, autoDismissMs - elapsed);
      setProgress((remaining / autoDismissMs) * 100);

      if (remaining <= 0 && intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 50);

    timerRef.current = window.setTimeout(() => {
      onClose?.();
    }, autoDismissMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, autoDismissMs, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const wrapperClasses = isSuccess
    ? 'bg-white border-emerald-100'
    : 'bg-white border-red-100';
  const iconClasses = isSuccess
    ? 'bg-emerald-50 text-emerald-600'
    : 'bg-red-50 text-red-600';
  const titleClasses = isSuccess ? 'text-slate-900' : 'text-red-700';
  const messageClasses = isSuccess ? 'text-slate-600' : 'text-red-600';
  const actionClasses = isSuccess
    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
    : 'bg-red-100 hover:bg-red-200 text-red-700';
  const progressClasses = isSuccess ? 'bg-emerald-500' : 'bg-red-500';
  const actionText = closeLabel || (isSuccess ? 'Close' : 'OK');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 pb-4 animate-scale-in overflow-hidden ${wrapperClasses}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconClasses}`}>
            {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-bold ${titleClasses}`}>{title}</h2>
            <p className={`text-sm mt-1 ${messageClasses}`}>{message}</p>
          </div>
        </div>

        <div className={`mt-5 flex items-center ${compact ? 'justify-end' : 'justify-between'} gap-3`}>
          {!compact && showCountdown ? (
            <p className={`text-[11px] font-semibold ${isSuccess ? 'text-emerald-600' : 'text-red-600'}`}>
              {isSuccess
                ? `Redirecting in ${Math.max(0, Math.ceil((progress / 100) * (autoDismissMs / 1000)))}s`
                : 'Please review the message and try again.'}
            </p>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${actionClasses}`}
          >
            {actionText}
          </button>
        </div>

        {showProgressBar && autoDismissMs > 0 && (
          <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ease-linear ${progressClasses}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
