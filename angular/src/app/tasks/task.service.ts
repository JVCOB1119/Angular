import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map(tasks => tasks.map(task => this.mapTaskDates(task)))
    );
  }

  getTaskById(id: string | number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      map(task => this.mapTaskDates(task))
    );
  }

  addTask(task: Task) {
    return this.http.post(this.apiUrl, this.mapTaskDatesToString(task));
  }

  updateTask(id: string | number, task: Task) {
    return this.http.put(`${this.apiUrl}/${id}`, this.mapTaskDatesToString(task));
  }

  deleteTask(id: string | number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private mapTaskDates(task: any): Task {
    return {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      createdAt: task.createdAt ? new Date(task.createdAt) : null,
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : null,
      completedAt: task.completedAt ? new Date(task.completedAt) : null
    };
  }

  private mapTaskDatesToString(task: Task): any {
    return {
      ...task,
      dueDate: task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate) : null,
      createdAt: task.createdAt ? (task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt) : null,
      updatedAt: task.updatedAt ? (task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt) : null,
      completedAt: task.completedAt ? (task.completedAt instanceof Date ? task.completedAt.toISOString() : task.completedAt) : null
    };
  }
}
