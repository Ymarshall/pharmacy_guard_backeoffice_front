import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AssuranceService } from '../../../core/services/pharmacy.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { NotifyService } from '../../../shared/notify/notify.service';
import { fieldError } from '../../../shared/validators/field.validators';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-assurance-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, PageHeaderComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="edit() ? 'Modifier l’assurance' : 'Nouvelle assurance'" [crumbs]="[{label:'Assurances', link:'/assurances'},{label:'Formulaire'}]">
      <a mat-button routerLink="/assurances">Retour</a>
    </app-page-header>
    @if (loading()) { <app-skeleton-form [count]="2" /> } @else {
      <form class="pg-panel" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput formControlName="name" />@if (error(form.controls.name)) { <mat-error>{{ error(form.controls.name) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Description</mat-label><textarea matInput rows="4" formControlName="description"></textarea>@if (error(form.controls.description)) { <mat-error>{{ error(form.controls.description) }}</mat-error> }</mat-form-field>
        <div class="pg-form-actions"><button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Enregistrement…' : 'Enregistrer' }}</button></div>
      </form>
    }
  `
})
export class AssuranceFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AssuranceService);
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
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(500)]
  });
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.edit.set(true); this.id = Number(id); this.loading.set(true);
    this.service.getById(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: row => { this.form.patchValue({ name: row.name, description: row.description || '' }); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Assurance introuvable'); if (message) this.notify.error(message); }
    });
  }
  submit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const request = this.edit() && this.id ? this.service.update(this.id, value) : this.service.create(value);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success('Assurance enregistrée'); void this.router.navigate(['/assurances']); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Enregistrement impossible'); if (message) this.notify.error(message); }
    });
  }
}
