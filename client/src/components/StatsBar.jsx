import React from 'react';

export default function StatsBar({ total, active, completed, progress }) {
  return (
    <section aria-label="Task statistics" className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-4">
      <div className="bg-[#FAFBF9] border border-line rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
        <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
          Total Tasks
        </span>
        <strong className="font-mono text-lg font-semibold text-ink mt-1 tabular-nums">
          {total}
        </strong>
      </div>

      <div className="bg-[#FAFBF9] border border-line rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
        <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
          Active
        </span>
        <strong className="font-mono text-lg font-semibold text-[#0A5A5D] mt-1 tabular-nums">
          {active}
        </strong>
      </div>

      <div className="bg-[#FAFBF9] border border-line rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
        <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
          Completed
        </span>
        <strong className="font-mono text-lg font-semibold text-[#4B7355] mt-1 tabular-nums">
          {completed}
        </strong>
      </div>

      <div className="bg-[#FAFBF9] border border-line rounded-lg p-2.5 sm:p-3 flex flex-col justify-between">
        <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
          Completion
        </span>
        <strong className="font-mono text-lg font-semibold text-ink mt-1 tabular-nums">
          {progress}%
        </strong>
      </div>
    </section>
  );
}
