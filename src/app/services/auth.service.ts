import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Utilisation du proxy pour éviter les problèmes CORS
  // Le proxy redirige /api/* vers http://localhost:8080
  private apiUrl = 'http://localhost:8080/api';
  private readonly USER_KEY = 'currentUser';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Tentative de connexion à:', `${this.apiUrl}/auth/login`);
    console.log('Credentials:', credentials);

    return this.http.post<User>(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap(user => {
        console.log('Connexion réussie, utilisateur reçu:', user);
        // Stocker l'utilisateur dans le localStorage
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Erreur dans le service auth:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

