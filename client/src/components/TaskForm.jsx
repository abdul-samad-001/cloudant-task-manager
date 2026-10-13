import React, { useState } from 'react';

export default function TaskForm({ onAddTask, disabled }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask(trimmed, priority);
    setTitle('');
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
    <form
      id="task-form"
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-line items-stretch sm:items-center"
    >
      <input
        type="text"
        id="task-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        aria-label="New task title"
        required
        maxLength={200}
        disabled={disabled}
        className="w-full sm:flex-1 sm:min-w-[170px] h-10 px-3.5 border border-line rounded-lg text-sm font-sans bg-[#FAFBF9] text-ink placeholder-[#8A9790] hover:border-[#B5BFB9] focus:bg-white focus:border-teal focus:outline-2 focus:outline-teal transition-all disabled:opacity-60"
      />

      <div className="flex items-center gap-2 max-sm:w-full">
        <div className="grid grid-cols-3 gap-1 sm:flex sm:gap-1.5 flex-1" role="radiogroup" aria-label="Priority">
          <button
            type="button"
            onClick={() => setPriority('low')}
            className={`h-10 px-2 sm:px-3.5 rounded-lg border font-sans text-xs sm:text-[12.5px] font-semibold cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${getPriorityClass('low')}`}
            aria-pressed={priority === 'low'}
            data-priority="low"
            disabled={disabled}
          >
            Low
          </button>
          <button
            type="button"
            onClick={() => setPriority('medium')}
            className={`h-10 px-2 sm:px-3.5 rounded-lg border font-sans text-xs sm:text-[12.5px] font-semibold cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${getPriorityClass('medium')}`}
            aria-pressed={priority === 'medium'}
            data-priority="medium"
            disabled={disabled}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setPriority('high')}
            className={`h-10 px-2 sm:px-3.5 rounded-lg border font-sans text-xs sm:text-[12.5px] font-semibold cursor-pointer inline-flex items-center justify-center transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${getPriorityClass('high')}`}
            aria-pressed={priority === 'high'}
            data-priority="high"
            disabled={disabled}
          >
            High
          </button>
        </div>

        <button
          type="submit"
          disabled={disabled || !title.trim()}
          className="h-10 px-5 bg-teal hover:bg-teal-dark active:scale-[0.98] text-white font-semibold text-[13.5px] font-sans rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 cursor-pointer inline-flex items-center justify-center shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </form>
  );
}
