
import React from 'react';
import { Priority } from '../types.ts';

export type FilterMode = 'all' | 'today' | 'upcoming';
export type SortMethod = 'priority' | 'date';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedPriority: Priority | null;
  onPriorityChange: (priority: Priority | null) => void;
  sortMethod: SortMethod;
  onSortMethodChange: (method: SortMethod) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterMode,
  onFilterChange,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  sortMethod,
  onSortMethodChange,
}) => {
  return (
    <div className="flex flex-col gap-5 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search your study goals..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-blue-100 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm shadow-sm"
          />
        </div>
        
        <div className="flex p-1.5 bg-blue-100/50 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'today', 'upcoming'] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onFilterChange(mode)}
              className={`whitespace-nowrap flex-grow md:flex-grow-0 px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category & Priority Filters */}
        <div className="flex flex-col gap-3">
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 w-full md:w-auto">By Subject:</span>
              <button
                onClick={() => onCategoryChange(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                All Subjects
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 w-full md:w-auto">By Priority:</span>
            <button
              onClick={() => onPriorityChange(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedPriority === null
                  ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              All
            </button>
            {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => onPriorityChange(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedPriority === p
                    ? p === 'High' ? 'bg-red-600 text-white border-red-600 shadow-sm' :
                      p === 'Medium' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' :
                      'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-start md:justify-end gap-3 self-end">
          <span className="text-[10px] font-bold uppercase text-slate-400">Order by:</span>
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => onSortMethodChange('date')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortMethod === 'date'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due Date
            </button>
            <button
              onClick={() => onSortMethodChange('priority')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortMethod === 'priority'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Priority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
