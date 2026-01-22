
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from './types.ts';
import { TaskForm } from './components/TaskForm.tsx';
import { TaskItem } from './components/TaskItem.tsx';
import { SectionHeader } from './components/SectionHeader.tsx';
import { TaskFilters, FilterMode } from './components/TaskFilters.tsx';

const STORAGE_KEY = 'student_task_manager_v1';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    } else {
      // Create a welcome task if it's the first time
      const welcomeTask: Task = {
        id: 'welcome-1',
        title: 'Welcome to your Task Manager! Add your first assignment above.',
        dueDate: new Date().toISOString().split('T')[0],
        isCompleted: false,
        createdAt: Date.now(),
      };
      setTasks([welcomeTask]);
    }
  }, []);

  // Save state whenever tasks change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = useCallback((title: string, dueDate: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      dueDate,
      isCompleted: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: true, completedAt: Date.now() } : t
    ));
  }, []);

  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Category filter (only applies to active tasks in specific modes)
      if (!task.isCompleted) {
        if (filterMode === 'today') return task.dueDate === todayStr;
        if (filterMode === 'upcoming') return task.dueDate > todayStr;
      }
      
      return true;
    });
  }, [tasks, searchTerm, filterMode]);

  const activeTasks = filteredTasks
    .filter(t => !t.isCompleted)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const completedTasks = filteredTasks
    .filter(t => t.isCompleted)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="inline-block p-2 bg-blue-100 rounded-2xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Student Task Manager</h1>
        <p className="text-slate-500 mt-2 font-medium">Keep track of your academic success</p>
      </header>

      {/* Input Section */}
      <TaskForm onAddTask={addTask} />

      {/* Filters & Search */}
      <TaskFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
      />

      {/* Active Tasks List */}
      <section className="space-y-4">
        <SectionHeader title="Active Tasks" count={activeTasks.length} />
        {activeTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activeTasks.map(task => (
              <TaskItem key={task.id} task={task} onComplete={completeTask} />
            ))}
          </div>
        ) : (
          <div className="bg-white/70 border border-dashed border-blue-200 rounded-2xl py-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium italic">
              {searchTerm || filterMode !== 'all' 
                ? 'No tasks match your filters.' 
                : 'No pending tasks. Time to relax!'}
            </p>
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="mt-16 pt-8 border-t border-blue-100">
        <SectionHeader title="History" count={completedTasks.length} />
        {completedTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {completedTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-4 italic">
            {searchTerm 
              ? 'No completed tasks match your search.' 
              : 'Completed tasks will appear here.'}
          </p>
        )}
      </section>

      <footer className="mt-20 text-center text-slate-400 text-xs pb-10">
        &copy; {new Date().getFullYear()} Student Task Manager &bull; Focused on Growth
      </footer>
    </div>
  );
};

export default App;
