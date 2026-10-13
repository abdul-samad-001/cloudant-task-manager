import React from 'react';

export default function Header({ onSeed, onClearAll, isSeeding, isClearing }) {
  return (
    <header className="flex justify-between items-start gap-4 pb-4 mb-4 border-b border-line max-sm:flex-col max-sm:items-stretch">
      <div>
        <h1 className="text-xl sm:text-[22px] font-bold text-ink tracking-tight mb-1">
          Task Manager
        </h1>
        <p className="text-xs sm:text-[13px] text-ink-soft leading-relaxed max-w-[40ch]">
          Every task below is a document in a Cloudant database, not a row in a table.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 max-sm:w-full">
        <button
          type="button"
          onClick={onSeed}
          disabled={isSeeding}
          title="Insert 5 sample tasks via a single bulk request — safe to click repeatedly"
          className="text-xs font-semibold text-teal-dark bg-teal-tint border border-[#C7E2E1] rounded-lg px-3 h-[32px] inline-flex items-center justify-center hover:bg-[#D4ECEB] hover:border-[#B4DADA] hover:text-teal active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed max-sm:flex-1 cursor-pointer"
        >
          {isSeeding ? 'Seeding…' : '+ Seed sample data'}
        </button>
        <button
          type="button"
          onClick={onClearAll}
          disabled={isClearing}
          title="Delete every task"
          className="text-xs font-medium text-[#7A8780] bg-transparent border border-transparent rounded-lg px-2.5 h-[32px] inline-flex items-center justify-center hover:bg-danger-tint hover:border-[#F0C7BA] hover:text-danger active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed max-sm:flex-1 cursor-pointer"
        >
          {isClearing ? 'Clearing…' : 'Clear all'}
        </button>
      </div>
    </header>
  );
}
