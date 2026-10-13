import React from 'react';

export default function Toolbar({
  search,
  setSearch,
  onSearchChange,
  filter,
  setFilter,
  onFilterChange,
  totalCount,
  filteredCount,
}) {
  const handleSearchChange = onSearchChange || setSearch;
  const handleFilterChange = onFilterChange || setFilter;
  const isFiltered = filter !== 'all' || Boolean(search?.trim());

  let countText = 'Database is empty';
  if (totalCount > 0) {
    countText = isFiltered
      ? `Showing ${filteredCount} of ${totalCount} task${totalCount === 1 ? '' : 's'}`
      : `${totalCount} task${totalCount === 1 ? '' : 's'} in Cloudant database`;
  }

  return (
    <div className="mb-2">
      <div className="flex gap-2.5 items-center mb-2 max-sm:flex-col max-sm:items-stretch">
        <div className="flex-1 min-w-[170px] max-sm:w-full">
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange && handleSearchChange(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="w-full h-[38px] px-3 bg-[#FAFBF9] text-ink border border-line rounded-lg text-[13.5px] font-sans placeholder-[#8A9790] hover:border-[#B5BFB9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:bg-white focus-visible:border-teal transition-all duration-140"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter tasks"
          className="inline-flex items-center gap-0.5 h-[38px] bg-[#EEF0EB] border border-[#DFE3DB] rounded-lg p-[3px] shrink-0 max-sm:w-full max-sm:grid max-sm:grid-cols-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => handleFilterChange && handleFilterChange('all')}
            className={`h-full px-3 text-xs font-semibold rounded-md transition-all duration-140 max-sm:w-full inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
              filter === 'all'
                ? 'bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-ink-soft hover:text-ink hover:bg-white/50'
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'active'}
            onClick={() => handleFilterChange && handleFilterChange('active')}
            className={`h-full px-3 text-xs font-semibold rounded-md transition-all duration-140 max-sm:w-full inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
              filter === 'active'
                ? 'bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-ink-soft hover:text-ink hover:bg-white/50'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'done'}
            onClick={() => handleFilterChange && handleFilterChange('done')}
            className={`h-full px-3 text-xs font-semibold rounded-md transition-all duration-140 max-sm:w-full inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
              filter === 'done'
                ? 'bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-ink-soft hover:text-ink hover:bg-white/50'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <p className="font-mono text-[11.5px] text-ink-soft mx-0.5 mb-2.5">
        {countText}
      </p>
    </div>
  );
}
