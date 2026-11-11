import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionStore } from '../auth/session.store';
import { NotifyService } from '../../shared/notify/notify.service';
import { apiErrorText } from '../../shared/util/http-error';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const notify = inject(NotifyService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const httpError = error instanceof HttpErrorResponse ? error : null;
      const isLogin = req.url.includes('/auth/login');
      if (httpError?.status === 401 && !isLogin) {
        session.clear();
        notify.error(apiErrorText(httpError) ?? 'Session expirée. Veuillez vous reconnecter.');
        void router.navigate(['/login']);
      } else if (httpError?.status === 403 && !isLogin) {
        notify.error(apiErrorText(httpError) ?? 'Accès refusé pour cette action.');
      } else if (httpError?.status === 429) {
        notify.error(apiErrorText(httpError) ?? 'Trop de tentatives. Réessayez dans une minute.');
      }
      return throwError(() => error);
    })
  );
};
