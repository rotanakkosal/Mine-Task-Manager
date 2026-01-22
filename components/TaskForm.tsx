
import React, { useState } from 'react';
import { Priority, Task, SubTask } from '../types.ts';

interface TaskFormProps {
  onAddTask: (title: string, dueDate: string, priority: Priority, reminderMinutes?: number, category?: string, dependencyIds?: string[], subtasks?: SubTask[], color?: string) => void;
  activeTasks: Task[];
}

const COLOR_PRESETS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
];

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, activeTasks }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [reminderMinutes, setReminderMinutes] = useState<number | undefined>(undefined);
  const [selectedDependency, setSelectedDependency] = useState<string>('');
  const [color, setColor] = useState('');
  
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, { id: crypto.randomUUID(), title: subtaskInput.trim(), isCompleted: false }]);
      setSubtaskInput('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    onAddTask(
      title, 
      dueDate, 
      priority, 
      reminderMinutes, 
      category || undefined,
      selectedDependency ? [selectedDependency] : undefined,
      subtasks.length > 0 ? subtasks : undefined,
      color || undefined
    );
    setTitle('');
    setDueDate('');
    setCategory('');
    setPriority('Medium');
    setReminderMinutes(undefined);
    setSelectedDependency('');
    setSubtasks([]);
    setColor('');
  };

  const handleRequestPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Task Description</label>
            <input
              type="text"
              placeholder="e.g., Study for Math Midterm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
            <input
              type="text"
              placeholder="e.g., Math, Science"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Subtasks Builder</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              className="flex-grow px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="px-6 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95"
            >
              Add
            </button>
          </div>
          {subtasks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600">{st.title}</span>
                  <button type="button" onClick={() => removeSubtask(st.id)} className="text-slate-400 hover:text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      priority === p 
                        ? p === 'High' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 
                          p === 'Medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 
                          'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Color Theme</span>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setColor(preset.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                      color === preset.value ? 'border-slate-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: preset.value || '#f1f5f9' }}
                    title={preset.name}
                  >
                    {color === preset.value && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {!preset.value && !color && (
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reminder</span>
              <select
                value={reminderMinutes === undefined ? "" : reminderMinutes}
                onChange={(e) => {
                  const val = e.target.value;
                  setReminderMinutes(val === "" ? undefined : Number(val));
                  handleRequestPermission();
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
              >
                <option value="">No Reminder</option>
                <option value="0">At time of event</option>
                <option value="15">15 mins before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Depends on</span>
              <select
                value={selectedDependency}
                onChange={(e) => setSelectedDependency(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
              >
                <option value="">Nothing</option>
                {activeTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-32 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-[20px] shadow-xl shadow-blue-500/30 transition-all transform active:scale-95 flex flex-col items-center justify-center leading-tight"
          >
            <span>Add</span>
            <span className="text-[10px] opacity-80 uppercase tracking-widest">Task</span>
          </button>
        </div>
      </div>
    </form>
  );
};
