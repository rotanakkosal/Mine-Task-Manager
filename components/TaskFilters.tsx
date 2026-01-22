
import React from 'react';

export type FilterMode = 'all' | 'today' | 'upcoming';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterMode,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-grow relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-blue-100 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm shadow-sm"
        />
      </div>
      
      <div className="flex p-1 bg-blue-100/50 rounded-xl">
        {(['all', 'today', 'upcoming'] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onFilterChange(mode)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filterMode === mode
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};
