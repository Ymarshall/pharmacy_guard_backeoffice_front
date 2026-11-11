import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { NotifyService } from '../../shared/notify/notify.service';
import { fieldError } from '../../shared/validators/field.validators';
import { httpErrorMessage } from '../../shared/util/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg-login">
      <section class="pg-login-panel">
        <form class="pg-login-card" [formGroup]="form" (ngSubmit)="submit()">
          <p class="pg-muted">Pharmacie de garde</p>
          <h1>Connexion</h1>
          <p class="pg-muted" style="margin: 8px 0 20px">Espace d’administration des gardes en Côte d’Ivoire.</p>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="username" />
            <mat-icon matPrefix>mail</mat-icon>
            @if (error(form.controls.email)) { <mat-error>{{ error(form.controls.email) }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Mot de passe</mat-label>
            <input matInput [type]="hidden() ? 'password' : 'text'" formControlName="password" autocomplete="current-password" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="hidden.set(!hidden())" aria-label="Afficher le mot de passe">
              <mat-icon>{{ hidden() ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            @if (error(form.controls.password)) { <mat-error>{{ error(form.controls.password) }}</mat-error> }
          </mat-form-field>
          @if (message()) { <p class="pg-error">{{ message() }}</p> }
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>
      </section>
      <aside class="pg-login-aside">
        <h2>Publier les pharmacies de garde, sans improvisation.</h2>
        <p>Référentiel, périodes, affiches et activation : un seul outil pour les opérateurs du back-office.</p>
        <ul>
          <li><mat-icon>calendar_month</mat-icon><div><strong>Périodes maîtrisées</strong><p>Du brouillon à l’activation, avec contrôle des dates.</p></div></li>
          <li><mat-icon>upload_file</mat-icon><div><strong>Affiches relues</strong><p>Import, confiance du rattachement, correction avant publication.</p></div></li>
          <li><mat-icon>verified</mat-icon><div><strong>Référentiel à jour</strong><p>Pharmacies, zones, assurances et numéros d’urgence.</p></div></li>
        </ul>
      </aside>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly hidden = signal(true);
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly error = fieldError;
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(120)]]
  });

  submit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.message.set('');
    this.auth.login(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => {
        this.submitting.set(false);
        this.notify.success(`Bonjour ${user.firstName} ${user.lastName}`);
        void this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.submitting.set(false);
        this.message.set(httpErrorMessage(error, 'E-mail ou mot de passe incorrect') ?? '');
      }
    });
  }
}
