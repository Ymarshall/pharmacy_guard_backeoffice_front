import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Utilisateurs : ADMIN. Import d'affiches : ADMIN ou OPERATOR. Un rôle absent est refusé. */
export function roleGuard(allowed: readonly string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    const role = auth.getCurrentUser()?.role;
    if (role && allowed.includes(role)) {
      return true;
    }
    return router.createUrlTree(['/dashboard']);
  };
}
