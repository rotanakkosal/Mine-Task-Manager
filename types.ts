
export interface Task {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
}
