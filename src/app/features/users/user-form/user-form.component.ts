import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { fieldError } from '../../../shared/validators/field.validators';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, PageHeaderComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="edit() ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'" [crumbs]="[{label:'Utilisateurs', link:'/users'},{label:'Formulaire'}]"><a mat-button routerLink="/users">Retour</a></app-page-header>
    @if (loading()) { <app-skeleton-form [count]="4" /> } @else {
      <form class="pg-panel pg-form-grid" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Prénom</mat-label><input matInput formControlName="firstName" />@if (error(form.controls.firstName)) { <mat-error>{{ error(form.controls.firstName) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput formControlName="lastName" />@if (error(form.controls.lastName)) { <mat-error>{{ error(form.controls.lastName) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field pg-span-2"><mat-label>E-mail</mat-label><input matInput type="email" formControlName="email" />@if (error(form.controls.email)) { <mat-error>{{ error(form.controls.email) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field pg-span-2"><mat-label>Mot de passe</mat-label><input matInput type="password" formControlName="password" [placeholder]="edit() ? 'Laisser vide pour ne pas changer' : ''" />@if (error(form.controls.password)) { <mat-error>{{ error(form.controls.password) }}</mat-error> }</mat-form-field>
        <div class="pg-form-actions pg-span-2"><button mat-flat-button color="primary" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Enregistrement…' : 'Enregistrer' }}</button></div>
      </form>
    }
  `
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = fieldError;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly edit = signal(false);
  private id?: number;
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(120)]]
  });
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.edit.set(true); this.id = Number(id);
    this.form.controls.password.clearValidators();
    this.form.controls.password.addValidators([Validators.minLength(6), Validators.maxLength(120)]);
    this.form.controls.password.updateValueAndValidity();
    this.loading.set(true);
    this.service.getById(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => { this.form.patchValue({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '' }); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Utilisateur introuvable'); if (message) this.notify.error(message); }
    });
  }
  submit(): void {
    if (this.submitting() || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const request = this.edit() && this.id
      ? this.service.update(this.id, { firstName: raw.firstName, lastName: raw.lastName, email: raw.email, ...(raw.password ? { password: raw.password } : {}) })
      : this.service.create(raw);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success('Utilisateur enregistré'); void this.router.navigate(['/users']); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Enregistrement impossible'); if (message) this.notify.error(message); }
    });
  }
}
