import React, { useState, useEffect } from 'react';

/**
 * Extracts and strictly allowlists only permitted fields:
 * _id, _rev, title, priority, done/completed, createdAt.
 * All unknown or sensitive properties are completely excluded.
 */
function extractAllowlistedDoc(task) {
  if (!task || typeof task !== 'object') return null;

  const doc = {};
  if (task._id !== undefined) doc._id = String(task._id);
  if (task._rev !== undefined) doc._rev = String(task._rev);
  if (task.title !== undefined) doc.title = String(task.title);
  if (task.priority !== undefined) doc.priority = String(task.priority);
  doc.done = Boolean(task.done ?? task.completed);
  if (task.createdAt !== undefined) doc.createdAt = String(task.createdAt);

  return doc;
}

export default function DocExplorerModal({
  task,
  isOpen,
  onClose,
  dbName = 'tasks',
  storageMode = 'ibm-cloudant',
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const doc = extractAllowlistedDoc(task);

  const handleCopy = () => {
    if (!doc) return;
    navigator.clipboard?.writeText(JSON.stringify(doc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(24,36,32,0.45)] backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explorer-dialog-title"
    >
      <div className="animate-dialog bg-card border border-line rounded-xl shadow-[0_20px_48px_rgba(24,36,32,0.16),0_4px_12px_rgba(24,36,32,0.08)] max-w-[520px] w-full p-5 text-ink overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 pb-3 mb-3.5 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="explorer-dialog-title" className="text-base sm:text-lg font-bold tracking-tight text-ink">
                Cloudant Document Explorer
              </h2>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider bg-teal-tint text-teal-dark border border-[#C7E2E1] py-0.5 px-1.5 rounded">
                Read-Only
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">
              Database: <span className="font-semibold text-ink">{dbName}</span> &nbsp;·&nbsp; Storage: <span className="font-semibold text-ink">{storageMode}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-ink-soft hover:bg-paper hover:text-ink p-1 rounded-md cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-teal"
            aria-label="Close Document Explorer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        {!doc ? (
          <div className="py-6 text-center text-sm text-ink-soft">
            Unable to load document details. Please select a valid task.
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Field summary chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-[#FAFBF9] border border-line rounded p-2">
                <span className="font-mono text-[10.5px] text-ink-soft uppercase block">Doc ID</span>
                <span className="font-mono font-semibold text-ink truncate block" title={doc._id}>
                  {doc._id}
                </span>
              </div>
              <div className="bg-[#FAFBF9] border border-line rounded p-2">
                <span className="font-mono text-[10.5px] text-ink-soft uppercase block">Revision</span>
                <span className="font-mono font-semibold text-ink truncate block" title={doc._rev}>
                  {doc._rev || 'new'}
                </span>
              </div>
              <div className="bg-[#FAFBF9] border border-line rounded p-2 max-sm:col-span-2">
                <span className="font-mono text-[10.5px] text-ink-soft uppercase block">Status</span>
                <span className={`font-semibold inline-flex items-center gap-1 ${doc.done ? 'text-moss' : 'text-teal-dark'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${doc.done ? 'bg-moss' : 'bg-teal'}`} />
                  {doc.done ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>

            {/* Read-Only JSON Document View */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                  Raw JSON Document (Allowlisted Fields)
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-mono text-[11px] font-medium text-teal-dark hover:text-teal hover:underline cursor-pointer transition-colors inline-flex items-center gap-1"
                >
                  {copied ? '✓ Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre
                tabIndex={0}
                className="font-mono text-xs text-ink bg-[#FAFBF9] border border-line rounded-lg p-3 max-h-56 overflow-auto leading-relaxed select-text focus-visible:outline-2 focus-visible:outline-teal"
              >
                <code>{JSON.stringify(doc, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex justify-end gap-2.5 mt-4 pt-3.5 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs sm:text-[12.5px] font-semibold bg-teal-tint text-teal-dark border border-[#C7E2E1] hover:bg-[#D4ECEB] hover:border-[#B4DADA] rounded-lg px-4 h-8.5 cursor-pointer inline-flex items-center justify-center transition-all active:scale-98 focus-visible:outline-2 focus-visible:outline-teal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
