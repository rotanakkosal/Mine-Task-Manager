
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

const COLOR_PRESETS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Green', value: '#34d399' },
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Orange', value: '#fb923c' },
];

export const TaskItem: React.FC<TaskItemProps> = ({ task, allTasks = [], onComplete, onUpdate, isSelected, onToggleSelection }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [shouldAnimatePop, setShouldAnimatePop] = useState(false);
  const [isProgressUpdating, setIsProgressUpdating] = useState(false);
  
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate);
  const [editedCategory, setEditedCategory] = useState(task.category || '');
  const [editedPriority, setEditedPriority] = useState<Priority>(task.priority || 'Medium');
  const [editedReminder, setEditedReminder] = useState<number | undefined>(task.reminderMinutesBefore);
  const [editedDependency, setEditedDependency] = useState<string>(task.dependencyIds?.[0] || '');
  const [editedSubtasks, setEditedSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [editedColor, setEditedColor] = useState(task.color || '');

  const progressInfo = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completedCount = task.subtasks.filter(st => st.isCompleted).length;
    const totalCount = task.subtasks.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    return { completedCount, totalCount, percentage };
  }, [task.subtasks]);

  const prevPercentageRef = useRef(progressInfo?.percentage);

  useEffect(() => {
    if (task.isCompleted) {
      setShouldAnimatePop(true);
      const timer = setTimeout(() => setShouldAnimatePop(false), 500);
      return () => clearTimeout(timer);
    }
  }, [task.isCompleted]);

  useEffect(() => {
    if (progressInfo && progressInfo.percentage !== prevPercentageRef.current) {
      setIsProgressUpdating(true);
      const timer = setTimeout(() => setIsProgressUpdating(false), 600);
      prevPercentageRef.current = progressInfo.percentage;
      return () => clearTimeout(timer);
    }
  }, [progressInfo?.percentage]);

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
      onUpdate(
        task.id, 
        editedTitle, 
        editedDueDate, 
        editedPriority, 
        editedReminder, 
        editedCategory || undefined,
        editedDependency ? [editedDependency] : undefined,
        editedSubtasks.length > 0 ? editedSubtasks : undefined,
        editedColor || undefined
      );
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDueDate(task.dueDate);
    setEditedCategory(task.category || '');
    setEditedPriority(task.priority || 'Medium');
    setEditedReminder(task.reminderMinutesBefore);
    setEditedDependency(task.dependencyIds?.[0] || '');
    setEditedSubtasks(task.subtasks || []);
    setEditedColor(task.color || '');
    setIsEditing(false);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (onUpdate && task.subtasks) {
      const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      onUpdate(
        task.id, 
        task.title, 
        task.dueDate, 
        task.priority, 
        task.reminderMinutesBefore, 
        task.category, 
        task.dependencyIds,
        updatedSubtasks,
        task.color
      );
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

  const statusHighlight = task.isCompleted 
    ? "border-slate-200 bg-slate-50/30 opacity-80"
    : isBlocked
    ? "border-amber-200 bg-amber-50/20 shadow-sm"
    : "border-slate-100 bg-white hover:border-blue-100 shadow-sm";

  const handleStatusToggle = () => {
    if (!isBlocked && onComplete) {
      onComplete(task.id);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-2xl border border-blue-200 bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm font-medium"
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
            <button onClick={handleCancel} className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600">Cancel</button>
            <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-xl">Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col group relative ${statusHighlight} ${shouldAnimatePop ? 'animate-completion-pop' : ''} ${isSelected ? 'ring-2 ring-blue-400 scale-[1.01]' : ''}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: getAccentColor() }}
      onClick={(e) => {
        if (onToggleSelection && !(e.target as HTMLElement).closest('button, input')) {
          onToggleSelection();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {onToggleSelection && (
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection();
              }}
              className="w-3.5 h-3.5 rounded border-slate-200 text-blue-500 focus:ring-blue-100 transition-all cursor-pointer"
            />
          </div>
        )}

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase border tracking-widest ${getPriorityStyles(task.priority || 'Medium')} ${task.isCompleted ? 'grayscale opacity-40' : ''}`}>
                {task.priority || 'Medium'}
              </span>
              {task.category && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase border border-slate-100 bg-slate-50/50 text-slate-400 tracking-widest ${task.isCompleted ? 'grayscale opacity-40' : ''}`}>
                  {task.category}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusToggle(); }}
              disabled={!task.isCompleted && isBlocked}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 transform active:scale-90 border ${
                !task.isCompleted 
                ? (isBlocked ? 'bg-amber-50 text-amber-300 border-amber-100' : 'bg-white border-slate-100 text-slate-300 hover:text-blue-400 hover:border-blue-100')
                : 'bg-blue-500 border-blue-500 text-white hover:bg-slate-50 hover:text-slate-300 hover:border-slate-100 group/undo'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${task.isCompleted ? 'group-hover/undo:hidden' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              {task.isCompleted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 hidden group-hover/undo:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              )}
            </button>
          </div>

          <h3 className={`text-sm font-semibold transition-colors duration-300 leading-tight strike-through-flow truncate ${task.isCompleted ? 'text-slate-300 completed' : 'text-slate-700'}`}>
            {task.title}
          </h3>
          
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className={`text-[10px] font-medium ${task.isCompleted ? 'text-slate-300' : isToday() ? 'text-red-400' : 'text-slate-400'}`}>
              Due {formattedDate}
            </p>
            {!task.isCompleted && isBlocked && (
              <span className="text-[8px] font-bold text-amber-500 uppercase flex items-center gap-1">
                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" /></svg>
                Blocked
              </span>
            )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="w-full bg-slate-100 rounded-full h-0.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressInfo?.percentage}%`, backgroundColor: task.color || '#3b82f6' }}
                />
              </div>
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {task.subtasks.map(st => (
                  <label key={st.id} className="flex items-center gap-1 cursor-pointer group/st" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(st.id)}
                      disabled={task.isCompleted}
                      className="w-3 h-3 rounded border-slate-200 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                    />
                    <span className={`text-[9px] font-medium transition-all ${st.isCompleted ? 'text-slate-300 line-through' : 'text-slate-500 group-hover/st:text-slate-700'}`}>
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {!task.isCompleted && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full text-slate-300 hover:bg-slate-50 hover:text-blue-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
