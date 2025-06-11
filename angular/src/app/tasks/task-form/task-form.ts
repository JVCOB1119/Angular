import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Task } from '../../models/task.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSelectModule, CommonModule, MatSnackBarModule],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: string | null = null;
  loadedTask: Task | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['medium', Validators.required],
      status: ['todo', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.taskId = id;
        this.taskService.getTaskById(this.taskId).subscribe(task => {
          if (task) {
            this.loadedTask = task;
            this.taskForm.patchValue({
              title: task.title || '',
              description: task.description || '',
              priority: task.priority || 'medium',
              status: task.status || 'todo',
              dueDate: task.dueDate instanceof Date
                ? task.dueDate.toISOString().substring(0, 10)
                : new Date(task.dueDate).toISOString().substring(0, 10)
            });
          }
        });
      }
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const now = new Date();
      const currentUser = this.authService.getCurrentUser();

      const baseTask: Partial<Task> = this.isEditMode && this.loadedTask ? this.loadedTask : {};

      const task: Task = {
        id: this.isEditMode && this.taskId ? this.taskId : undefined as any,
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        status: formValue.status,
        dueDate: new Date(formValue.dueDate),
        createdAt: baseTask?.createdAt || now,
        updatedAt: now,
        tags: baseTask?.tags || [],
        assignedUser: baseTask?.assignedUser || (currentUser?.id ? String(currentUser.id) : (currentUser?.email ?? '')),
        attachments: baseTask?.attachments || [],
        completedAt: formValue.status === 'done'
          ? (baseTask?.completedAt || now)
          : null
      };

      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, task).subscribe({
          next: () => {
            this.snackBar.open('Zadanie zaktualizowane!', 'Zamknij', { duration: 2500 });
            this.router.navigate(['/tasks']);
          },
          error: () => {
            this.snackBar.open('Błąd podczas edycji zadania!', 'Zamknij', { duration: 2500 });
          }
        });
      } else {
        this.taskService.addTask(task).subscribe({
          next: () => {
            this.snackBar.open('Zadanie dodane!', 'Zamknij', { duration: 2500 });
            this.router.navigate(['/tasks']);
          },
          error: () => {
            this.snackBar.open('Błąd podczas dodawania zadania!', 'Zamknij', { duration: 2500 });
          }
        });
      }
    } else {
      this.taskForm.markAllAsTouched();
    }
  }
}
