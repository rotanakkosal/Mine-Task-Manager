
import React, { useState } from 'react';

interface TaskFormProps {
  onAddTask: (title: string, dueDate: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    onAddTask(title, dueDate);
    setTitle('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="task-title" className="block text-sm font-medium text-slate-600 mb-1">Task Description</label>
          <input
            id="task-title"
            type="text"
            placeholder="e.g., Study for Math Midterm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            required
          />
        </div>
        <div className="w-full md:w-48">
          <label htmlFor="due-date" className="block text-sm font-medium text-slate-600 mb-1">Due Date</label>
          <input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-200 transition-all transform active:scale-95"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
};
