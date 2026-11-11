import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorBody {
  statusCode?: number;
  status?: string;
  error?: string;
  message?: string;
  path?: string;
  errors?: Record<string, string>;
}

/** Texte français tiré du corps ApiError, y compris les erreurs de champ. */
export function apiErrorText(error: HttpErrorResponse): string | null {
  const body = error.error as ApiErrorBody | string | null;
  if (!body || typeof body === 'string') {
    return typeof body === 'string' && body.trim() ? body : null;
  }
  const fieldErrors = body.errors
    ? Object.entries(body.errors).map(([field, message]) => `${field} : ${message}`).join(' · ')
    : '';
  if (typeof body.message === 'string' && body.message.trim()) {
    return fieldErrors ? `${body.message} ${fieldErrors}` : body.message;
  }
  return fieldErrors || null;
}

/**
 * Message à afficher par l'écran. 401 et 403 sont déjà annoncés par l'intercepteur,
 * sauf si `surfaceAuth` est vrai (formulaire de connexion).
 */
export function httpErrorMessage(error: unknown, fallback: string, surfaceAuth = false): string | null {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 0) {
    return 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.';
  }
  if (error.status === 429) {
    return apiErrorText(error) ?? 'Trop de tentatives de connexion. Réessayez dans une minute.';
  }
  if ((error.status === 401 || error.status === 403) && !surfaceAuth) {
    return null;
  }
  return apiErrorText(error) ?? fallback;
}
