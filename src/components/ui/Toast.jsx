// src/components/Toast.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

// ─────────────────────────────────────────────
// VARIANTS — matches SasaFix theme
// ─────────────────────────────────────────────

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    badgeBg: "bg-green-100",
    iconColor: "text-green-600",
    borderColor: "border-l-green-500",
  },
  error: {
    icon: AlertCircle,
    badgeBg: "bg-red-100",
    iconColor: "text-red-600",
    borderColor: "border-l-red-500",
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: "bg-amber-100",
    iconColor: "text-amber-600",
    borderColor: "border-l-amber-500",
  },
  info: {
    icon: Info,
    badgeBg: "bg-blue-100",
    iconColor: "text-[#056db3]",
    borderColor: "border-l-[#056db3]",
  },
};

// ─────────────────────────────────────────────
// SINGLE TOAST
// ─────────────────────────────────────────────

export function Toast({ id, variant = "success", title, message, duration = 4500, onClose }) {
  const { icon: Icon, badgeBg, iconColor, borderColor } = VARIANTS[variant];

  // Auto-dismiss
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        theme-toast w-90 bg-white border border-gray-200 border-l-4 ${borderColor}
        rounded-xl shadow-lg shadow-gray-900/5
        p-3.5 flex items-start gap-2.5
        animate-toast-in
        hover:shadow-xl transition-shadow
      `}
    >
      <div className={`w-7 h-7 rounded-full ${badgeBg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{title}</p>
        {message && (
          <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed wrap-break-word">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 p-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  );
}