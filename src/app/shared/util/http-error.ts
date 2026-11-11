import { HttpErrorResponse } from '@angular/common/http';

/** Message utilisateur. Null si l'intercepteur a déjà traité le 401/403. */
export function httpErrorMessage(error: unknown, fallback: string): string | null {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 401 || error.status === 403) {
    return null;
  }
  if (error.status === 0) {
    return 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.';
  }
  const message = error.error?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}
