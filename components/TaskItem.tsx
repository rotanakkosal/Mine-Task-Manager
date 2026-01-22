
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
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
    day: 'numeric',
    year: 'numeric'
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

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Low': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getAccentColor = () => {
    if (task.color) return task.color;
    switch(task.priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const statusHighlight = task.isCompleted 
    ? "border-slate-300 bg-slate-50/50 opacity-90 shadow-none"
    : isBlocked
    ? "border-amber-400 bg-amber-50/40"
    : "border-slate-300 bg-white hover:border-blue-400 shadow-md";

  const handleStatusToggle = () => {
    if (!isBlocked && onComplete) {
      onComplete(task.id);
    }
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-3xl border bg-white shadow-xl ring-2 ring-blue-500 animate-in fade-in zoom-in duration-200`}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Task Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-medium"
                placeholder="Task Title"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
              <input
                type="text"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-medium"
                placeholder="e.g. Math, Personal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Due Date</label>
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Reminder</label>
              <select
                value={editedReminder === undefined ? "" : editedReminder}
                onChange={(e) => setEditedReminder(e.target.value === "" ? undefined : Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              >
                <option value="">No Reminder</option>
                <option value="0">At time of event</option>
                <option value="15">15 mins before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Depends on</label>
              <select
                value={editedDependency}
                onChange={(e) => setEditedDependency(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              >
                <option value="">Nothing</option>
                {allTasks.filter(t => t.id !== task.id).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Priority</span>
                <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
                  {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setEditedPriority(p)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        editedPriority === p 
                          ? p === 'High' ? 'bg-red-500 text-white' : 
                            p === 'Medium' ? 'bg-amber-500 text-white' : 
                            'bg-blue-500 text-white'
                          : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Theme</span>
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setEditedColor(preset.value)}
                      className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                        editedColor === preset.value ? 'border-slate-800 shadow-inner' : 'border-transparent shadow-sm'
                      }`}
                      style={{ backgroundColor: preset.value || '#f1f5f9' }}
                    >
                      {editedColor === preset.value && <div className="w-1 h-1 bg-white rounded-full"></div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto ml-auto">
              <button onClick={handleCancel} className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleSave} className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col group relative ${statusHighlight} ${shouldAnimatePop ? 'animate-completion-pop' : ''} ${isSelected ? 'ring-2 ring-blue-500 scale-[1.01]' : ''}`}
      style={{ borderLeftWidth: '5px', borderLeftColor: getAccentColor() }}
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
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            />
          </div>
        )}

        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border tracking-widest ${getPriorityColor(task.priority || 'Medium')} ${task.isCompleted ? 'grayscale opacity-50' : ''}`}>
                {task.priority || 'Medium'}
              </span>
              {task.category && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-blue-100 bg-blue-50 text-blue-700 tracking-widest ${task.isCompleted ? 'grayscale opacity-50' : ''}`}>
                  {task.category}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusToggle(); }}
              disabled={!task.isCompleted && isBlocked}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 transform active:scale-90 border shadow-sm ${
                !task.isCompleted 
                ? (isBlocked ? 'bg-amber-50 text-amber-500 border-amber-100 opacity-50' : 'bg-white border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200')
                : 'bg-blue-600 border-blue-600 text-white hover:bg-white hover:text-slate-400 hover:border-slate-200 group/undo'
              }`}
              title={task.isCompleted ? "Undo completion" : "Mark as completed"}
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

          <h3 className={`text-sm font-bold transition-colors duration-300 leading-tight strike-through-flow ${task.isCompleted ? 'text-slate-400 completed' : 'text-slate-800'}`}>
            {task.title}
          </h3>
          
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className={`text-[10px] font-bold ${task.isCompleted ? 'text-slate-400' : isToday() ? 'text-red-600' : 'text-slate-500'}`}>
              Due {formattedDate} {isToday() && !task.isCompleted && '(Today)'}
            </p>
            {!task.isCompleted && isBlocked && (
              <span className="text-[9px] font-extrabold text-amber-600 uppercase flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Blocked
              </span>
            )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2.5">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest">PROGRESS: {progressInfo?.completedCount}/{progressInfo?.totalCount}</span>
                <span className="text-[8px] font-bold text-blue-600">{progressInfo?.percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isProgressUpdating ? 'animate-progress-glow' : ''}`}
                  style={{ width: `${progressInfo?.percentage}%`, backgroundColor: task.color || '#2563eb' }}
                />
              </div>
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 bg-slate-100/30 p-1.5 rounded-lg border border-slate-200/50">
                {task.subtasks.map(st => (
                  <label key={st.id} className="flex items-center gap-1 cursor-pointer group/st" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(st.id)}
                      disabled={task.isCompleted}
                      className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                    <span className={`text-[10px] font-medium transition-all ${st.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-600 group-hover/st:text-slate-900'}`}>
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
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all border border-transparent hover:border-slate-200"
              title="Edit Task"
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
