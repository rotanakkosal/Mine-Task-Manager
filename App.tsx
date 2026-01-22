
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, Priority, SubTask } from './types.ts';
import { TaskForm } from './components/TaskForm.tsx';
import { TaskItem } from './components/TaskItem.tsx';
import { SectionHeader } from './components/SectionHeader.tsx';
import { TaskFilters, FilterMode, SortMethod } from './components/TaskFilters.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { ImportExport } from './components/ImportExport.tsx';

const STORAGE_KEY = 'student_task_manager_v1';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [sortMethod, setSortMethod] = useState<SortMethod>('priority');
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  
  // Selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

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
      const welcomeTask: Task = {
        id: 'welcome-1',
        title: 'Welcome to your Task Manager! Add your first assignment above.',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'High',
        category: 'Tutorial',
        isCompleted: false,
        createdAt: Date.now(),
        subtasks: [
          { id: 'st1', title: 'Learn to add tasks', isCompleted: true },
          { id: 'st2', title: 'Try out the AI extractor', isCompleted: false },
        ]
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

  // Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      let updated = false;
      const newTasks = tasks.map(task => {
        if (!task.isCompleted && task.reminderMinutesBefore !== undefined && !task.notified) {
          const dueDateTimeStr = `${task.dueDate}T23:59:00`;
          const dueDateTime = new Date(dueDateTimeStr).getTime();
          const triggerTime = dueDateTime - (task.reminderMinutesBefore * 60000);

          if (now >= triggerTime) {
            triggerNotification(task);
            updated = true;
            return { ...task, notified: true };
          }
        }
        return task;
      });

      if (updated) {
        setTasks(newTasks);
      }
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  const triggerNotification = (task: Task) => {
    const message = `Reminder: ${task.title} is due today!`;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Task Manager Reminder", {
        body: message,
        icon: "/favicon.ico"
      });
    }
    setActiveAlerts(prev => [...prev, message]);
  };

  const addTask = useCallback((title: string, dueDate: string, priority: Priority, reminderMinutes?: number, category?: string, dependencyIds?: string[], subtasks?: SubTask[], color?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      dueDate,
      category,
      reminderMinutesBefore: reminderMinutes,
      dependencyIds,
      subtasks,
      priority,
      color,
      isCompleted: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const addBulkTasks = useCallback((extractedTasks: any[]) => {
    const newTasks: Task[] = extractedTasks.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      isCompleted: false,
      createdAt: Date.now(),
    }));
    setTasks(prev => [...newTasks, ...prev]);
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const becomingCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted: becomingCompleted,
          completedAt: becomingCompleted ? Date.now() : undefined
        };
      }
      return t;
    }));
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateTask = useCallback((id: string, title: string, dueDate: string, priority: Priority, reminderMinutes?: number, category?: string, dependencyIds?: string[], subtasks?: SubTask[], color?: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, title, dueDate, priority, reminderMinutesBefore: reminderMinutes, category, dependencyIds, subtasks, color, notified: false } : t
    ));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback((currentViewIds: string[]) => {
    setSelectedTaskIds(prev => {
      const allSelected = currentViewIds.every(id => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        currentViewIds.forEach(id => next.delete(id));
        return next;
      } else {
        const next = new Set(prev);
        currentViewIds.forEach(id => next.add(id));
        return next;
      }
    });
  }, []);

  const batchComplete = useCallback(() => {
    if (selectedTaskIds.size === 0) return;
    const now = Date.now();
    setTasks(prev => prev.map(t => 
      selectedTaskIds.has(t.id) ? { ...t, isCompleted: true, completedAt: now } : t
    ));
    setSelectedTaskIds(new Set());
  }, [selectedTaskIds]);

  const batchDelete = useCallback(() => {
    if (selectedTaskIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.size} tasks?`)) {
      setTasks(prev => prev.filter(t => !selectedTaskIds.has(t.id)));
      setSelectedTaskIds(new Set());
    }
  }, [selectedTaskIds]);

  const handleImport = (importedTasks: Task[]) => {
    if (confirm('Importing tasks will replace your current list. Continue?')) {
      setTasks(importedTasks);
      setSelectedTaskIds(new Set());
    }
  };

  const categories = useMemo(() => {
    const cats = tasks.map(t => t.category).filter((c): c is string => !!c);
    return Array.from(new Set(cats)).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      if (selectedCategory && task.category !== selectedCategory) return false;
      if (selectedPriority && task.priority !== selectedPriority) return false;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (!task.isCompleted) {
        if (filterMode === 'today') return task.dueDate === todayStr;
        if (filterMode === 'upcoming') return task.dueDate > todayStr;
      }
      return true;
    });
  }, [tasks, searchTerm, filterMode, selectedCategory, selectedPriority]);

  const activeTasksForDependency = useMemo(() => tasks.filter(t => !t.isCompleted), [tasks]);

  const activeTasks = useMemo(() => {
    const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return filteredTasks
      .filter(t => !t.isCompleted)
      .sort((a, b) => {
        if (sortMethod === 'priority') {
          const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.dueDate.localeCompare(b.dueDate);
        } else {
          const dateDiff = a.dueDate.localeCompare(b.dueDate);
          if (dateDiff !== 0) return dateDiff;
          return priorityMap[b.priority] - priorityMap[a.priority];
        }
      });
  }, [filteredTasks, sortMethod]);

  const completedTasks = useMemo(() => 
    filteredTasks
      .filter(t => t.isCompleted)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)),
    [filteredTasks]
  );

  const visibleIds = useMemo(() => activeTasks.map(t => t.id), [activeTasks]);
  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedTaskIds.has(id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 relative">
      {/* Contextual batch bar - Lightened */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg animate-in slide-in-from-bottom duration-300">
          <div className="bg-white text-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-200">
            <div className="flex items-center gap-4">
              <span className="bg-blue-500 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider text-white">
                {selectedTaskIds.size} Selected
              </span>
              <button 
                onClick={() => setSelectedTaskIds(new Set())}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={batchDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold border border-red-100"
              >
                Delete
              </button>
              <button
                onClick={batchComplete}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold shadow-lg shadow-blue-500/20"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {activeAlerts.map((alert, idx) => (
          <div 
            key={idx} 
            className="pointer-events-auto bg-white border border-blue-100 text-slate-800 px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300 flex items-center gap-3"
          >
            <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="font-medium text-xs">{alert}</p>
            <button 
              onClick={() => setActiveAlerts(prev => prev.filter((_, i) => i !== idx))}
              className="ml-auto hover:bg-slate-100 rounded p-1 text-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <header className="mb-10 text-center relative">
        <div className="absolute top-0 right-0">
          <ImportExport tasks={tasks} onImport={handleImport} />
        </div>
        
        <div className="inline-block p-2 bg-blue-50 rounded-2xl mb-4 border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Student Task Manager</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Prioritize your success, one task at a time</p>
      </header>

      <AIAssistant onTasksExtracted={addBulkTasks} />
      <TaskForm onAddTask={addTask} activeTasks={activeTasksForDependency} />
      
      <TaskFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        sortMethod={sortMethod}
        onSortMethodChange={setSortMethod}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Active Tasks" count={activeTasks.length} />
          {activeTasks.length > 0 && (
            <button
              onClick={() => selectAllFiltered(visibleIds)}
              className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                isAllVisibleSelected 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'text-slate-400 bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              {isAllVisibleSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        {activeTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {activeTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                allTasks={tasks}
                onComplete={toggleTaskCompletion} 
                onUpdate={updateTask}
                isSelected={selectedTaskIds.has(task.id)}
                onToggleSelection={() => toggleSelection(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-10 text-center">
            <p className="text-slate-400 text-sm font-medium italic">
              {searchTerm || filterMode !== 'all' || selectedCategory || selectedPriority
                ? 'No matches.' 
                : 'No pending tasks.'}
            </p>
          </div>
        )}
      </section>

      <section className="mt-12 pt-8 border-t border-slate-100">
        <SectionHeader title="History" count={completedTasks.length} />
        {completedTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                allTasks={tasks}
                onComplete={toggleTaskCompletion}
                onUpdate={updateTask}
                isSelected={selectedTaskIds.has(task.id)}
                onToggleSelection={() => toggleSelection(task.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-300 text-xs text-center py-4">History is empty.</p>
        )}
      </section>

      <footer className="mt-20 text-center text-slate-300 text-[10px] pb-10 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Student Task Manager
      </footer>
    </div>
  );
};

export default App;
