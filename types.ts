
export type Priority = 'High' | 'Medium' | 'Low';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  category?: string; // e.g., Math, Science, Personal
  reminderMinutesBefore?: number; // minutes before due date to notify
  dependencyIds?: string[]; // IDs of tasks that must be completed first
  subtasks?: SubTask[]; // List of nested subtasks
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  priority: Priority;
  color?: string; // Hex code or tailwind color name
  notified?: boolean; // track if notification was already fired
}
