import React, { useState, useEffect, useRef } from 'react';

export default function EditModal({ task, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setPriority(task.priority || 'medium');
    }
  }, [task]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSave({
        ...task,
        title: trimmed,
        priority,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityClass = (level) => {
    const isActive = priority === level;
    if (!isActive) {
      return 'bg-card border-line text-ink-soft hover:bg-[#F7F9F6] hover:border-[#B5BFB9] hover:text-ink';
    }
    if (level === 'low') return 'bg-[#5E6C65] border-[#5E6C65] text-white';
    if (level === 'high') return 'bg-amber border-amber text-white';
    return 'bg-teal border-teal text-white';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(24,36,32,0.45)] backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      <div
        className="animate-dialog bg-card border border-line rounded-xl shadow-[0_20px_48px_rgba(24,36,32,0.16),0_4px_12px_rgba(24,36,32,0.08)] max-w-[440px] w-full p-5.5 text-ink overflow-hidden"
      >
        <div className="flex justify-between items-start gap-3 mb-4.5 pb-3.5 border-b border-line">
          <div>
            <h2 id="edit-dialog-title" className="text-lg font-bold tracking-tight text-ink">
              Edit Task
            </h2>
            <p className="mt-1 font-mono text-[11px] text-[#7A8780]">
              id: {task._id} · rev: {task._rev ? task._rev.substring(0, 10) + '…' : 'new'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-ink-soft hover:bg-[#EEF0EB] hover:text-ink p-1 rounded-md cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-task-title" className="block text-[12.5px] font-semibold text-ink mb-1.5">
              Task Title
            </label>
            <input
              ref={inputRef}
              type="text"
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              disabled={submitting}
              className="w-full h-10 px-3.5 border border-line rounded-lg text-sm font-sans bg-[#FAFBF9] text-ink hover:border-[#B5BFB9] focus:bg-white focus:border-teal focus:outline-2 focus:outline-teal transition-all disabled:opacity-60"
            />
          </div>

          <div className="mb-4">
            <span className="block text-[12.5px] font-semibold text-ink mb-1.5">
              Priority
            </span>
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Task priority">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`h-9 px-3 rounded-lg border font-sans text-[12px] font-semibold cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${getPriorityClass('low')}`}
                aria-pressed={priority === 'low'}
                disabled={submitting}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`h-9 px-3 rounded-lg border font-sans text-[12px] font-semibold cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${getPriorityClass('medium')}`}
                aria-pressed={priority === 'medium'}
                disabled={submitting}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`h-9 px-3 rounded-lg border font-sans text-[12px] font-semibold cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${getPriorityClass('high')}`}
                aria-pressed={priority === 'high'}
                disabled={submitting}
              >
                High
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-5.5 pt-3.5 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="font-sans text-[12.5px] font-semibold bg-teal-tint text-teal-dark border border-[#C7E2E1] hover:bg-[#D4ECEB] hover:border-[#B4DADA] rounded-lg px-3.5 h-[34px] cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="font-sans font-semibold text-[13.5px] bg-teal hover:bg-teal-dark active:scale-[0.98] text-white rounded-lg px-4.5 h-[34px] cursor-pointer inline-flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
