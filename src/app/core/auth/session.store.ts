import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

const SESSION_KEY = 'pg.session';
const LEGACY_USER_KEY = 'currentUser';

export interface SessionState {
  user: User;
  token?: string;
  expiresAt?: number;
}

/**
 * Session du back-office.
 *
 * sessionStorage, et non localStorage : la session disparaît à la fermeture de
 * l'onglet, ce qui réduit la fenêtre de vol du jeton en cas de XSS.
 * Un cookie httpOnly resterait préférable, mais ce front ne peut pas le poser :
 * l'API renvoie le profil (et, à terme, un jeton) dans le JSON.
 * La mémoire seule perdrait la session à chaque rafraîchissement.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly state = signal<SessionState | null>(this.read());

  readonly session = this.state.asReadonly();
  readonly user = computed(() => this.state()?.user ?? null);

  save(next: SessionState): void {
    const safeUser = { ...next.user };
    delete (safeUser as { password?: string }).password;
    const session: SessionState = {
      user: safeUser,
      token: next.token,
      expiresAt: next.expiresAt
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(LEGACY_USER_KEY);
    this.state.set(session);
  }

  clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    this.state.set(null);
  }

  isAuthenticated(): boolean {
    const current = this.state();
    if (!current) {
      return false;
    }
    if (current.expiresAt && current.expiresAt <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }

  token(): string | undefined {
    if (!this.isAuthenticated()) {
      return undefined;
    }
    return this.state()?.token;
  }

  private read(): SessionState | null {
    const current = this.parse(sessionStorage.getItem(SESSION_KEY));
    if (current) {
      return current;
    }
    const legacy = this.parse(localStorage.getItem(LEGACY_USER_KEY));
    if (!legacy) {
      return null;
    }
    const migrated: SessionState = { user: legacy.user };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_USER_KEY);
    return migrated;
  }

  private parse(raw: string | null): SessionState | null {
    if (!raw) {
      return null;
    }
    try {
      const value = JSON.parse(raw) as SessionState | User;
      if (value && typeof value === 'object' && 'user' in value && value.user?.email) {
        return value;
      }
      if (value && typeof value === 'object' && 'email' in value) {
        return { user: value };
      }
      return null;
    } catch {
      return null;
    }
  }
}
