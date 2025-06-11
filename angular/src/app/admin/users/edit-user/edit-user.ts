import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../auth/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.html',
  styleUrls: ['./edit-user.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ]
})
export class EditUserComponent implements OnInit {
  userForm: FormGroup;
  userId: string | null = null;
  loadedUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      role: ['user', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.userService.getUserById(this.userId).subscribe(user => {
          this.loadedUser = user;
          this.userForm.patchValue({
            email: user.email,
            username: user.username,
            role: user.role
          });
        });
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid && this.userId && this.loadedUser) {
      const now = new Date().toISOString();
      const updatedUser: User = {
        ...this.loadedUser,
        ...this.userForm.value,
        updatedAt: now
      };

      this.userService.updateUser(this.userId, updatedUser).subscribe({
        next: () => {
          this.snackBar.open('Użytkownik zaktualizowany!', 'Zamknij', { duration: 2500 });
          this.router.navigate(['/admin/users']);
        },
        error: () => {
          this.snackBar.open('Błąd podczas edycji użytkownika!', 'Zamknij', { duration: 2500 });
        }
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
