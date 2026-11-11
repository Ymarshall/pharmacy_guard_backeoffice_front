import { HttpErrorResponse } from '@angular/common/http';
import { httpErrorMessage } from './http-error';

describe('messages ApiError', () => {
  it('affiche le message français d’un 429', () => {
    const error = new HttpErrorResponse({
      status: 429,
      error: {
        statusCode: 429,
        status: 'TOO_MANY_REQUESTS',
        message: 'Trop de tentatives de connexion. Réessayez dans une minute.'
      }
    });
    expect(httpErrorMessage(error, 'échec')).toContain('Trop de tentatives');
  });

  it('assemble le message et les erreurs de champ', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        message: 'Erreurs de validation',
        errors: { phone1: 'Le numéro de téléphone principal est obligatoire' }
      }
    });
    const text = httpErrorMessage(error, 'échec');
    expect(text).toContain('Erreurs de validation');
    expect(text).toContain('phone1');
  });

  it('laisse le formulaire de connexion afficher un 401', () => {
    const error = new HttpErrorResponse({ status: 401, error: { message: 'Email ou mot de passe incorrect' } });
    expect(httpErrorMessage(error, 'échec')).toBeNull();
    expect(httpErrorMessage(error, 'échec', true)).toBe('Email ou mot de passe incorrect');
  });
});
