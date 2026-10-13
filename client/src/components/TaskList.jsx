import React from 'react';
import TaskItem from './TaskItem';

const documentIcon = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

export default function TaskList({
  tasks,
  totalCount,
  totalTasksCount,
  onToggle,
  onEdit,
  onDelete,
  onExplore,
}) {
  const count = totalCount ?? totalTasksCount ?? 0;

  if (tasks.length === 0) {
    const isTotallyEmpty = count === 0;

    return (
      <div className="text-center py-8 px-5 border border-dashed border-line rounded-lg bg-[#FAFBF9] text-ink-soft my-3.5">
        <div
          aria-hidden="true"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper text-teal mb-2.5"
        >
          {documentIcon}
        </div>
        <p className="text-sm text-ink mb-1 font-semibold">
          {isTotallyEmpty ? 'No tasks logged yet.' : 'Nothing matches this filter.'}
        </p>
        <p className="text-xs text-ink-soft max-w-[42ch] mx-auto leading-relaxed">
          {isTotallyEmpty
            ? "Create your first task below — each one is stored as a JSON document in Cloudant."
            : 'Try a different filter tab, or clear your search term.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 flex flex-col gap-2 mb-2">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onExplore={onExplore}
        />
      ))}
    </ul>
  );
}
