
import React, { useState } from 'react';
import { Priority, Task, SubTask } from '../types.ts';

interface TaskFormProps {
  onAddTask: (title: string, dueDate: string, priority: Priority, reminderMinutes?: number, category?: string, dependencyIds?: string[], subtasks?: SubTask[], color?: string) => void;
  activeTasks: Task[];
}

const COLOR_PRESETS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Green', value: '#34d399' },
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Orange', value: '#fb923c' },
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
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Task Description</label>
            <input
              type="text"
              placeholder="e.g., Study for Math Midterm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm font-medium"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
            <input
              type="text"
              placeholder="e.g., Math, Science"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Subtasks Builder</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              className="flex-grow px-4 py-2.5 text-sm rounded-xl border border-slate-100 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="px-6 py-2 bg-blue-50 text-blue-500 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-all active:scale-95"
            >
              Add
            </button>
          </div>
          {subtasks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-600">{st.title}</span>
                  <button type="button" onClick={() => removeSubtask(st.id)} className="text-slate-300 hover:text-red-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Priority</span>
              <div className="flex gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      priority === p 
                        ? p === 'High' ? 'bg-red-400 text-white shadow-sm' : 
                          p === 'Medium' ? 'bg-amber-400 text-white shadow-sm' : 
                          'bg-blue-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Theme</span>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setColor(preset.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                      color === preset.value ? 'border-slate-400 scale-110' : 'border-transparent opacity-80'
                    }`}
                    style={{ backgroundColor: preset.value || '#f1f5f9' }}
                    title={preset.name}
                  >
                    {color === preset.value && <div className="w-1 h-1 bg-white rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Reminder</span>
              <select
                value={reminderMinutes === undefined ? "" : reminderMinutes}
                onChange={(e) => {
                  const val = e.target.value;
                  setReminderMinutes(val === "" ? undefined : Number(val));
                  handleRequestPermission();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 bg-slate-50/50"
              >
                <option value="">None</option>
                <option value="0">On Due</option>
                <option value="15">15m Early</option>
                <option value="60">1h Early</option>
                <option value="1440">1d Early</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Blocking</span>
              <select
                value={selectedDependency}
                onChange={(e) => setSelectedDependency(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 bg-slate-50/50"
              >
                <option value="">None</option>
                {activeTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title.substring(0, 15)}...</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-28 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/10 transition-all transform active:scale-95 text-sm"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
};
