import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { LoginRequest, User } from '../models/user.model';
import { SessionStore } from './session.store';

interface LoginResponse extends User {
  token?: string;
  accessToken?: string;
  expiresIn?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly session = inject(SessionStore);

  readonly user = this.session.user;

  login(credentials: LoginRequest): Observable<User> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap(response => {
        const token = response.token || response.accessToken;
        const expiresAt = response.expiresIn ? Date.now() + response.expiresIn * 1000 : undefined;
        const user: User = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role
        };
        this.session.save({ user, token, expiresAt });
      })
    );
  }

  logout(): void {
    this.session.clear();
  }

  getCurrentUser(): User | null {
    return this.session.user();
  }

  isAuthenticated(): boolean {
    return this.session.isAuthenticated();
  }
}
