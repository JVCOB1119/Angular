import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      const now = new Date().toISOString();

      const newUser = {
        email,
        password,
        username: email.split('@')[0],
        role: 'user' as 'user',
        createdAt: now,
        updatedAt: now
      };


      this.userService.getUsers().subscribe(users => {
        const emailExists = users.some((u: any) => u.email === email);
        if (emailExists) {
          this.snackBar.open('Użytkownik z tym adresem email już istnieje!', 'Zamknij', { duration: 2500 });
        } else {
          this.userService.registerUser(newUser).subscribe({
            next: () => {
              this.snackBar.open('Użytkownik zarejestrowany!', 'Zamknij', { duration: 2500 });
              this.router.navigate(['/login']);
            },
            error: () => {
              this.snackBar.open('Błąd podczas rejestracji!', 'Zamknij', { duration: 2500 });
            }
          });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
