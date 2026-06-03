"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

let addToastFn: ((text: string, type: "success" | "error" | "info") => void) | null = null;

export function toast(text: string, type: "success" | "error" | "info" = "info") {
  if (addToastFn) addToastFn(text, type);
}

let nextId = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: "success" | "error" | "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-3 text-sm shadow-lg flex items-center gap-2 animate-[slideIn_0.3s_ease] ${
            t.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : t.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-pink-50 text-pink-800 border border-pink-200"
          }`}
        >
          <span className="flex-1">{t.text}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
