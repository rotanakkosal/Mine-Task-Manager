
import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onComplete?: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today;
  };

  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const statusHighlight = !task.isCompleted && isToday() 
    ? "border-red-400 bg-red-50 ring-2 ring-red-100" 
    : "border-blue-100 bg-white hover:border-blue-300";

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${statusHighlight}`}>
      <div className="flex-grow mr-4">
        <h3 className={`font-medium ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {task.title}
        </h3>
        <div className="flex items-center mt-1 space-x-3">
          <span className={`text-xs flex items-center ${task.isCompleted ? 'text-slate-400' : isToday() ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Due {formattedDate} {isToday() && !task.isCompleted && '(Today)'}
          </span>
          {task.completedAt && (
            <span className="text-xs text-slate-400 italic">
              Done {new Date(task.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {!task.isCompleted && onComplete && (
        <button
          onClick={() => onComplete(task.id)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform active:scale-90"
          title="Mark as Complete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {task.isCompleted && (
        <div className="flex-shrink-0 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};
