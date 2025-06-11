import { Component, OnInit } from '@angular/core';
import { UserService } from '../../auth/user.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users.sort((a, b) => Number(a.id) - Number(b.id));
    });
  }

  deleteUser(id: number | string) {
    if (confirm('Na pewno usunąć użytkownika?')) {
      this.userService.deleteUser(String(id)).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.snackBar.open('Użytkownik usunięty!', 'Zamknij', { duration: 2500 });
        },
        error: () => {
          this.snackBar.open('Błąd podczas usuwania użytkownika!', 'Zamknij', { duration: 2500 });
        }
      });
    }
  }
}
