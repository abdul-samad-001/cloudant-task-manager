import React from 'react';

function shortId(id) {
  return '#' + String(id).slice(-6);
}

function parseRev(rev) {
  if (!rev) return '';
  return 'rev ' + rev.split('-')[0];
}

const trashIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function TaskItem({ task, onToggle, onEdit, onDelete, onExplore }) {
  const isDone = Boolean(task.done ?? task.completed);
  const priority = task.priority || 'medium';

  let borderLeftColor = 'border-l-teal';
  if (isDone) {
    borderLeftColor = 'border-l-[#4B7355]';
  } else if (priority === 'high') {
    borderLeftColor = 'border-l-amber';
  } else if (priority === 'low') {
    borderLeftColor = 'border-l-[#93A097]';
  }

  let tagClasses = 'bg-teal-tint text-teal-dark border-[#C7E2E1]';
  if (priority === 'high') {
    tagClasses = 'bg-amber-tint text-amber border-[#F6D8C4]';
  } else if (priority === 'low') {
    tagClasses = 'bg-[#EFF1ED] text-[#5C6861] border-[#D8DFD5]';
  }

  return (
    <li
      data-priority={priority}
      className={`flex items-center gap-3 p-3 border border-line border-l-[3.5px] rounded-[9px] transition-all duration-150 hover:shadow-[0_2px_8px_rgba(24,36,32,0.04)] max-sm:gap-2.5 max-sm:p-2.5 ${borderLeftColor} ${
        isDone ? 'bg-[#F8FAF6]' : 'bg-white'
      }`}
    >
      <input
        type="checkbox"
        checked={isDone}
        onChange={(e) => onToggle(task._id, e.target.checked)}
        aria-label={`Mark "${task.title}" as ${isDone ? 'active' : 'complete'}`}
        className="w-[18px] h-[18px] accent-teal cursor-pointer shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={`text-sm font-medium leading-snug break-words ${
            isDone ? 'line-through text-[#727F77]' : 'text-ink'
          }`}
        >
          {task.title}
        </span>
        <div className="font-mono text-[11px] text-[#8C9991] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onExplore && onExplore(task)}
            className="hover:text-teal hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal rounded"
            title="Open in Cloudant Document Explorer"
          >
            {shortId(task._id)}
          </button>
          {task._rev && <span>{parseRev(task._rev)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 max-sm:gap-1">
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.05em] py-0.5 px-1.5 rounded border shrink-0 ${tagClasses}`}
        >
          {priority}
        </span>

        <button
          type="button"
          onClick={() => onExplore && onExplore(task)}
          aria-label={`Explore Cloudant document for "${task.title}"`}
          title="View Cloudant document"
          className="h-7 text-xs font-mono font-medium text-ink-soft bg-[#FAFBF9] border border-line rounded-md px-2 shrink-0 inline-flex items-center justify-center hover:bg-[#EFF1ED] hover:text-ink active:scale-97 transition-all duration-140 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 cursor-pointer max-sm:text-[11px] max-sm:px-1.5 max-sm:h-6.5"
        >
          {'{ }'}
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="h-7 text-xs font-semibold text-teal-dark bg-teal-tint border border-[#C7E2E1] rounded-md px-2.5 shrink-0 inline-flex items-center justify-center hover:bg-[#D4ECEB] hover:border-[#B4DADA] hover:text-teal active:scale-97 transition-all duration-140 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 cursor-pointer max-sm:text-[11.5px] max-sm:px-1.5 max-sm:h-6.5"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(task._id, task.title)}
          aria-label={`Delete "${task.title}"`}
          className="h-7 w-7 rounded-md text-[#8C9991] bg-transparent border border-transparent shrink-0 inline-flex items-center justify-center hover:bg-danger-tint hover:border-[#F0C7BA] hover:text-danger active:scale-97 transition-all duration-140 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 cursor-pointer max-sm:h-6.5 max-sm:w-6.5"
        >
          {trashIcon}
        </button>
      </div>
    </li>
  );
}
