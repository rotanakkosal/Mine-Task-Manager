
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, Priority, SubTask } from './types.ts';
import { TaskForm } from './components/TaskForm.tsx';
import { TaskItem } from './components/TaskItem.tsx';
import { SectionHeader } from './components/SectionHeader.tsx';
import { TaskFilters, FilterMode, SortMethod } from './components/TaskFilters.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { ImportExport } from './components/ImportExport.tsx';

const STORAGE_KEY = 'mine_task_manager_v1';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [sortMethod, setSortMethod] = useState<SortMethod>('priority');
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

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
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 relative">
      {/* Selection floating bar */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-in slide-in-from-bottom duration-300">
          <div className="bg-white border border-slate-200 text-slate-800 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between">
            <span className="bg-blue-600 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase text-white tracking-wider">
              {selectedTaskIds.size} Selected
            </span>
            <div className="flex gap-2">
              <button onClick={batchDelete} className="px-3.5 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold border border-red-100">
                Delete
              </button>
              <button onClick={batchComplete} className="px-4.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold shadow-lg shadow-blue-500/20">
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Header inspired by screenshot */}
      <header className="mb-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center gap-4">
           {/* Compact container for icon and actions */}
          <div className="flex items-center gap-3">
             <ImportExport tasks={tasks} onImport={handleImport} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Mine Task Manager</h1>
            <p className="text-slate-400 mt-1 font-medium text-[11px] md:text-xs">Prioritize your success, one task at a time</p>
          </div>
        </div>
      </header>

      <AIAssistant onTasksExtracted={addBulkTasks} />
      
      <div className="mt-8">
        <TaskForm onAddTask={addTask} activeTasks={activeTasksForDependency} />
      </div>
      
      <div className="mt-6">
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
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Active Tasks" count={activeTasks.length} />
          {activeTasks.length > 0 && (
            <button
              onClick={() => selectAllFiltered(visibleIds)}
              className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 bg-white hover:border-blue-300 transition-all active:scale-95"
            >
              Select All
            </button>
          )}
        </div>
        
        {activeTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
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
          <div className="bg-white/50 border border-dashed border-slate-200 rounded-3xl py-12 text-center">
            <p className="text-slate-400 text-xs font-medium italic">No active tasks found.</p>
          </div>
        )}
      </section>

      <section className="mt-12 pt-8 border-t border-slate-100">
        <SectionHeader title="History" count={completedTasks.length} />
        {completedTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
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
          <p className="text-slate-300 text-[10px] text-center py-6 italic">History is empty.</p>
        )}
      </section>

      <footer className="mt-20 text-center text-slate-300 text-[9px] pb-10 uppercase tracking-[0.2em] font-medium">
        &copy; {new Date().getFullYear()} Mine Task Manager
      </footer>
    </div>
  );
};

export default App;
