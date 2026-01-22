
import React from 'react';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => {
  return (
    <div className="flex items-center gap-3 mb-4 mt-8 first:mt-0">
      <h2 className="text-lg font-semibold text-slate-700 tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500 border border-blue-100">
          {count}
        </span>
      )}
    </div>
  );
};
