import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { TaskListComponent } from './tasks/task-list/task-list';
import { TaskDetailComponent } from './tasks/task-detail/task-detail';
import { TaskFormComponent } from './tasks/task-form/task-form';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel';
import { adminGuard } from './auth/admin.guard';
import { UserListComponent } from './admin/user-list/user-list';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:id', component: TaskDetailComponent },
  { path: 'add-task', component: TaskFormComponent },
  { path: 'edit-task/:id', component: TaskFormComponent },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserListComponent },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./admin/users/edit-user/edit-user').then(m => m.EditUserComponent)
      }
    ]
  }
];
