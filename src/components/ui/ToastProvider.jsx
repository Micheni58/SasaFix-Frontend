// src/components/ToastProvider.jsx
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Toast } from "./Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      // Keep max 3 visible — collapse the oldest
      const next = [{ id, ...toast }, ...prev];
      return next.slice(0, 3);
    });
    return id;
  }, []);

  const api = {
    success: (title, message, opts) => addToast({ variant: "success", title, message, ...opts }),
    error:   (title, message, opts) => addToast({ variant: "error",   title, message, ...opts }),
    warning: (title, message, opts) => addToast({ variant: "warning", title, message, ...opts }),
    info:    (title, message, opts) => addToast({ variant: "info",    title, message, ...opts }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed top-20 right-4 z-100 flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onClose={removeToast} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}