export interface Task {
  id: string | number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  assignedUser?: string;
  attachments: string[];
  completedAt: Date | null;
}
