
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
  const getPriorityFilterStyle = (p: Priority, isActive: boolean) => {
    if (!isActive) return 'bg-white text-slate-300 border-slate-50 hover:border-slate-200';
    
    switch(p) {
      case 'High': return 'bg-red-50 text-red-500 border-red-200 shadow-sm shadow-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100';
      case 'Low': return 'bg-blue-50 text-blue-500 border-blue-200 shadow-sm shadow-blue-100';
      default: return 'bg-slate-700 text-white border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow w-full relative">
          <input
            type="text"
            placeholder="Search study goals..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full px-4 py-2.5 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm shadow-sm font-medium"
          />
        </div>
        
        <div className="flex p-1 bg-slate-100/50 rounded-2xl w-full md:w-auto border border-slate-100">
          {(['all', 'today', 'upcoming'] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onFilterChange(mode)}
              className={`flex-grow md:flex-grow-0 px-5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterMode === mode
                  ? 'bg-white text-blue-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-100'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
              }`}
            >
              All Subjects
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-100 text-blue-600 border-blue-200'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 pl-3">
            {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => onPriorityChange(selectedPriority === p ? null : p)}
                className={`px-2 py-0.5 rounded text-[9px] font-semibold border tracking-widest transition-all ${getPriorityFilterStyle(p, selectedPriority === p)}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
          <button
            onClick={() => onSortMethodChange('date')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
              sortMethod === 'date' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            Due Date
          </button>
          <button
            onClick={() => onSortMethodChange('priority')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
              sortMethod === 'priority' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            Priority
          </button>
        </div>
      </div>
    </div>
  );
};
