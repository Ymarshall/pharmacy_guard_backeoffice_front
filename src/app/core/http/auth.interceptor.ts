import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../auth/session.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const isApi = req.url.startsWith(environment.apiUrl);
  const isLogin = req.url.includes('/auth/login');
  if (!isApi || isLogin) {
    return next(req);
  }
  if (!session.isAuthenticated() && session.session()) {
    void router.navigate(['/login']);
    return throwError(() => new Error('Session expirée'));
  }
  const token = session.token();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
