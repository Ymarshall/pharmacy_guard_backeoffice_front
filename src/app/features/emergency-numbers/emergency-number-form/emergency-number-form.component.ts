import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EmergencyCategory } from '../../../core/models/emergency-number.model';
import { EmergencyNumberService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { fieldError, ivorianPhoneValidator } from '../../../shared/validators/field.validators';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-emergency-number-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, PageHeaderComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="edit() ? 'Modifier le numéro' : 'Nouveau numéro'" [crumbs]="[{label:'Urgences', link:'/emergency-numbers'},{label:'Formulaire'}]">
      <a mat-button routerLink="/emergency-numbers">Retour</a>
    </app-page-header>
    @if (loading()) { <app-skeleton-form [count]="4" /> } @else {
      <form class="pg-panel pg-form-grid" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput formControlName="name" />@if (error(form.controls.name)) { <mat-error>{{ error(form.controls.name) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Numéro</mat-label><input matInput formControlName="number" placeholder="185 ou +225…" />@if (error(form.controls.number)) { <mat-error>{{ error(form.controls.number) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Catégorie</mat-label>
          <mat-select formControlName="category"><mat-option value="">—</mat-option>@for (item of categories; track item) { <mat-option [value]="item">{{ labels[item] }}</mat-option> }</mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Couleur</mat-label><input matInput type="color" formControlName="color" /></mat-form-field>
        <mat-form-field appearance="outline" class="pg-field pg-span-2"><mat-label>Description</mat-label><textarea matInput rows="3" formControlName="description"></textarea></mat-form-field>
        <div class="pg-form-actions pg-span-2"><button mat-flat-button color="primary" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Enregistrement…' : 'Enregistrer' }}</button></div>
      </form>
    }
  `
})
export class EmergencyNumberFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmergencyNumberService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = fieldError;
  readonly categories = Object.values(EmergencyCategory);
  readonly labels: Record<string, string> = { medical: 'Médical', fire: 'Pompiers', police: 'Police', bloodBank: 'Banque de sang', other: 'Autre' };
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly edit = signal(false);
  private id?: number;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    number: ['', [Validators.required, Validators.maxLength(20), shortOrPhone]],
    icon: [''],
    description: ['', Validators.maxLength(300)],
    color: ['#236B40'],
    category: ['']
  });
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.edit.set(true); this.id = Number(id); this.loading.set(true);
    this.service.getById(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: row => { this.form.patchValue({ name: row.name, number: row.number, icon: row.icon || '', description: row.description || '', color: row.color || '#236B40', category: row.category || '' }); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Numéro introuvable'); if (message) this.notify.error(message); }
    });
  }
  submit(): void {
    if (this.submitting() || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const body = { ...raw, category: raw.category ? raw.category as EmergencyCategory : undefined };
    const request = this.edit() && this.id ? this.service.update(this.id, body) : this.service.create(body);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success('Numéro enregistré'); void this.router.navigate(['/emergency-numbers']); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Enregistrement impossible'); if (message) this.notify.error(message); }
    });
  }
}

function shortOrPhone(control: import('@angular/forms').AbstractControl) {
  const value = String(control.value ?? '').trim();
  if (!value || /^\d{2,4}$/.test(value)) return null;
  return ivorianPhoneValidator(control);
}
