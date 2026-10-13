import React from 'react';

export default function SyncStrip({ health, isError }) {
  let statusText = 'connecting…';
  let dotColorClass = 'bg-[#6B7570]';

  if (isError || !health) {
    statusText = 'connection:unreachable';
    dotColorClass = 'bg-[#D9694F]';
  } else if (health.storage === 'ibm-cloudant') {
    statusText = `cloudant:connected · db=${health.db} · docs=${health.taskCount}`;
    dotColorClass = 'bg-[#3FD6C0] animate-pulse-dot';
  } else {
    statusText = `local:in-memory · docs=${health.taskCount} · add CLOUDANT_URL/APIKEY to go live`;
    dotColorClass = 'bg-[#E0A44D]';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="font-mono text-[11.5px] sm:text-xs bg-ink text-[#CFEAE9] py-2.5 px-4 sm:px-4.5 rounded-t-xl flex items-center gap-2 tracking-[0.01em] whitespace-nowrap overflow-hidden select-none"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColorClass}`} />
      <span className="truncate">{statusText}</span>
    </div>
  );
}
