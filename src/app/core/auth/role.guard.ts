import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Restreint une route aux rôles indiqués.
 * Sans rôle sur la session (API actuelle), l'accès reste ouvert pour ne pas
 * bloquer les comptes existants. Le contrôle s'applique dès que `user.role` est fourni.
 */
export function roleGuard(allowed: readonly string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    const role = auth.getCurrentUser()?.role;
    if (!role || allowed.includes(role)) {
      return true;
    }
    return router.createUrlTree(['/dashboard']);
  };
}
