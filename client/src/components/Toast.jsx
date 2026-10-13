import React from 'react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      id="toast-container"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto font-sans text-[13px] font-medium py-2.5 px-3.5 rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.18)] animate-toast transition-all ${
            toast.type === 'error' ? 'bg-danger text-white' : 'bg-ink text-white'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
