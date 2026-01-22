
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task, Priority, SubTask } from '../types.ts';

interface TaskItemProps {
  task: Task;
  allTasks?: Task[];
  onComplete?: (id: string) => void;
  onUpdate?: (id: string, title: string, dueDate: string, priority: Priority, reminderMinutes?: number, category?: string, dependencyIds?: string[], subtasks?: SubTask[], color?: string) => void;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, allTasks = [], onComplete, onUpdate, isSelected, onToggleSelection }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [shouldAnimatePop, setShouldAnimatePop] = useState(false);
  
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate);
  const [editedPriority, setEditedPriority] = useState<Priority>(task.priority || 'Medium');

  const progressInfo = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completedCount = task.subtasks.filter(st => st.isCompleted).length;
    const totalCount = task.subtasks.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    return { completedCount, totalCount, percentage };
  }, [task.subtasks]);

  useEffect(() => {
    if (task.isCompleted) {
      setShouldAnimatePop(true);
      const timer = setTimeout(() => setShouldAnimatePop(false), 500);
      return () => clearTimeout(timer);
    }
  }, [task.isCompleted]);

  const dependencies = useMemo(() => {
    if (!task.dependencyIds || !allTasks.length) return [];
    return allTasks.filter(t => task.dependencyIds?.includes(t.id));
  }, [task.dependencyIds, allTasks]);

  const blockingTasks = useMemo(() => {
    return dependencies.filter(t => !t.isCompleted);
  }, [dependencies]);

  const isBlocked = blockingTasks.length > 0;

  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today;
  };

  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const handleSave = () => {
    if (onUpdate && editedTitle.trim() && editedDueDate) {
      onUpdate(task.id, editedTitle, editedDueDate, editedPriority, task.reminderMinutesBefore, task.category, task.dependencyIds, task.subtasks, task.color);
      setIsEditing(false);
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (onUpdate && task.subtasks) {
      const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      onUpdate(task.id, task.title, task.dueDate, task.priority, task.reminderMinutesBefore, task.category, task.dependencyIds, updatedSubtasks, task.color);
    }
  };

  const getPriorityStyles = (p: Priority) => {
    switch(p) {
      case 'High': return 'text-red-500 bg-red-50/50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50/50 border-amber-100';
      case 'Low': return 'text-blue-500 bg-blue-50/50 border-blue-100';
      default: return 'text-slate-400 bg-slate-50/50 border-slate-100';
    }
  };

  const getAccentColor = () => {
    if (task.color) return task.color;
    switch(task.priority) {
      case 'High': return '#f87171';
      case 'Medium': return '#fbbf24';
      case 'Low': return '#60a5fa';
      default: return '#cbd5e1';
    }
  };

  const handleStatusToggle = () => {
    if (!isBlocked && onComplete) {
      onComplete(task.id);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-2xl border border-blue-200 bg-white shadow-lg animate-in zoom-in duration-200">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm font-medium"
            placeholder="Title"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-medium"
            />
            <div className="flex gap-1">
              {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setEditedPriority(p)}
                  className={`flex-grow px-2 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    editedPriority === p ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 text-xs font-medium text-slate-400">Cancel</button>
            <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-xl">Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-2xl border transition-all duration-300 flex flex-col group overflow-hidden ${
        task.isCompleted ? 'bg-slate-50/40 border-slate-200 opacity-70' : 'bg-white border-slate-100 shadow-sm'
      } ${shouldAnimatePop ? 'animate-completion-pop' : ''} ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
      onClick={(e) => {
        if (onToggleSelection && !(e.target as HTMLElement).closest('button, input, label')) {
          onToggleSelection();
        }
      }}
    >
      {/* Selection Left Bar Accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 md:w-2" 
        style={{ backgroundColor: getAccentColor() }}
      />

      <div className="p-4 pl-6 md:p-5 md:pl-7">
        <div className="flex items-start gap-4">
          {/* Checkbox for selection */}
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection?.();
              }}
              className="w-4 h-4 rounded border-slate-200 text-blue-500 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex-grow min-w-0">
            {/* Header: Tags & Complete Button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase border tracking-widest ${getPriorityStyles(task.priority)}`}>
                  {task.priority}
                </span>
                {task.category && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase border border-slate-100 bg-slate-50 text-slate-400 tracking-widest">
                    {task.category}
                  </span>
                )}
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusToggle(); }}
                disabled={!task.isCompleted && isBlocked}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 border ${
                  !task.isCompleted 
                  ? (isBlocked ? 'bg-amber-50 text-amber-200 border-amber-100' : 'bg-white border-slate-100 text-slate-200 hover:text-blue-500 hover:border-blue-100')
                  : 'bg-blue-500 border-blue-500 text-white hover:bg-white hover:text-slate-300 hover:border-slate-200 group/undo'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${task.isCompleted ? 'group-hover/undo:hidden' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {task.isCompleted && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden group-hover/undo:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                )}
              </button>
            </div>

            {/* Title & Date */}
            <div className="mb-3">
              <h3 className={`text-base font-medium transition-all duration-300 leading-snug break-words ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {task.title}
              </h3>
              <p className={`text-[11px] font-medium mt-1 ${task.isCompleted ? 'text-slate-300' : isToday() ? 'text-red-400' : 'text-slate-400'}`}>
                Due {formattedDate}
              </p>
            </div>

            {/* Progress Bar & Subtasks */}
            {progressInfo && (
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mb-3">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressInfo.percentage}%`, backgroundColor: task.color || '#3b82f6' }}
                  />
                </div>
                
                <div className="flex flex-col gap-2.5">
                  {task.subtasks?.map(st => (
                    <label 
                      key={st.id} 
                      className="flex items-center gap-2.5 cursor-pointer group/st select-none" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => handleToggleSubtask(st.id)}
                        disabled={task.isCompleted}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                      />
                      <span className={`text-xs font-medium transition-all ${st.isCompleted ? 'text-slate-300 line-through' : 'text-slate-500 group-hover/st:text-slate-700'}`}>
                        {st.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Dependency block message */}
            {!task.isCompleted && isBlocked && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-amber-500 uppercase tracking-wide">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" /></svg>
                Task Blocked
              </div>
            )}
          </div>
        </div>

        {/* Edit Button - Hover Only */}
        {!task.isCompleted && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-300 hover:bg-slate-50 hover:text-blue-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
