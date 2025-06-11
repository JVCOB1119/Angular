import { Component, OnInit } from '@angular/core';
import { TaskService } from '../task.service';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/auth.service'; // <-- DODAJ TO

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];

  filterStatus: '' | 'todo' | 'in_progress' | 'done' = '';
  filterPriority: '' | 'low' | 'medium' | 'high' = '';
  sortBy: 'dueDate' | 'priority' = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private taskService: TaskService,
    private authService: AuthService, // <-- DODAJ TO
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(tasks => {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.role === 'admin') {
        this.tasks = tasks;
      } else if (currentUser) {
        this.tasks = tasks.filter(task =>
          task.assignedUser === String(currentUser.id) ||
          task.assignedUser === currentUser.email
        );
      } else {
        this.tasks = [];
      }
    });
  }

  editTask(id: string | number) {
    this.router.navigate(['/edit-task', id]);
  }

  deleteTask(id: string | number) {
    this.taskService.deleteTask(String(id)).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.snackBar.open('Zadanie usunięte!', 'Zamknij', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('Błąd podczas usuwania zadania!', 'Zamknij', { duration: 2500 });
      }
    });
  }

  markAsDone(task: Task) {
    if (!task.id) return;
    const updatedTask: Task = {
      ...task,
      status: 'done',
      updatedAt: new Date(),
      completedAt: new Date()
    };
    this.taskService.updateTask(String(task.id), updatedTask).subscribe({
      next: () => {
        task.status = 'done';
        task.updatedAt = updatedTask.updatedAt;
        task.completedAt = updatedTask.completedAt;
        this.snackBar.open('Zadanie oznaczone jako wykonane!', 'Zamknij', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('Błąd podczas aktualizacji zadania!', 'Zamknij', { duration: 2500 });
      }
    });
  }

  getStatusLabel(status: Task['status']): string {
    switch (status) {
      case 'todo': return 'Do zrobienia';
      case 'in_progress': return 'W trakcie';
      case 'done': return 'Zakończone';
      default: return status;
    }
  }

  getPriorityLabel(priority: Task['priority']): string {
    switch (priority) {
      case 'low': return 'Niski';
      case 'medium': return 'Średni';
      case 'high': return 'Wysoki';
      default: return priority;
    }
  }

  isOwnerOrAdmin(task: Task): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser && (
      currentUser.role === 'admin' ||
      task.assignedUser === String(currentUser.id) ||
      task.assignedUser === currentUser.email
    );
  }

  filteredAndSortedTasks(): Task[] {
    let tasks = [...this.tasks];

    if (this.filterStatus) {
      tasks = tasks.filter(t => t.status === this.filterStatus);
    }
    if (this.filterPriority) {
      tasks = tasks.filter(t => t.priority === this.filterPriority);
    }

    if (this.sortBy === 'dueDate') {
      tasks = tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateA = a.dueDate instanceof Date ? a.dueDate.getTime() : new Date(a.dueDate).getTime();
        const dateB = b.dueDate instanceof Date ? b.dueDate.getTime() : new Date(b.dueDate).getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (this.sortBy === 'priority') {
      const priorityOrder = { low: 1, medium: 2, high: 3 };
      tasks = tasks.sort((a, b) => {
        const pa = priorityOrder[a.priority] || 0;
        const pb = priorityOrder[b.priority] || 0;
        return this.sortDirection === 'asc' ? pa - pb : pb - pa;
      });
    }

    return tasks;
  }
}
