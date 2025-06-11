import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private currentUserKey = 'currentUser';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password=${password}`).pipe(
      map(users => {
        const user = users[0];
        if (user) {
          localStorage.setItem(this.currentUserKey, JSON.stringify(user));
          return user;
        }
        return null;
      })
    );
  }

  logout() {
    localStorage.removeItem(this.currentUserKey);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return Boolean(user && user.role === 'admin');
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}
