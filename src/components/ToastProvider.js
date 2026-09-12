"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircleIcon,
  error: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const STYLES = {
  success: "bg-emerald-600 text-white",
  error: "bg-brand-600 text-white",
  info: "bg-neutral-800 text-white",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    if (duration) {
      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? InformationCircleIcon;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-2 rounded-xl px-4 py-3 shadow-lg ${STYLES[toast.type] ?? STYLES.info}`}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{toast.message}</p>
              <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
                <XMarkIcon className="h-4 w-4 opacity-80 hover:opacity-100" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
