
import React from 'react';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => {
  return (
    <div className="flex items-center justify-between mb-4 mt-8 first:mt-0">
      <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {count}
        </span>
      )}
    </div>
  );
};
