import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ZoneType } from '../../../core/models/zone.model';
import { ZoneService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { fieldError } from '../../../shared/validators/field.validators';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-zone-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule, PageHeaderComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="edit() ? 'Modifier la zone' : 'Nouvelle zone'" [crumbs]="[{label:'Zones', link:'/zones'},{label:'Formulaire'}]"><a mat-button routerLink="/zones">Retour</a></app-page-header>
    @if (loading()) { <app-skeleton-form [count]="4" /> } @else {
      <form class="pg-panel pg-form-grid" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput formControlName="name" />@if (error(form.controls.name)) { <mat-error>{{ error(form.controls.name) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Type</mat-label>
          <mat-select formControlName="type">@for (item of types; track item) { <mat-option [value]="item">{{ labels[item] }}</mat-option> }</mat-select>
          @if (error(form.controls.type)) { <mat-error>{{ error(form.controls.type) }}</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Région</mat-label><input matInput formControlName="region" />@if (error(form.controls.region)) { <mat-error>{{ error(form.controls.region) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Département</mat-label><input matInput formControlName="departement" />@if (error(form.controls.departement)) { <mat-error>{{ error(form.controls.departement) }}</mat-error> }</mat-form-field>
        <mat-checkbox formControlName="isActive">Zone active</mat-checkbox>
        <div class="pg-form-actions pg-span-2"><button mat-flat-button color="primary" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Enregistrement…' : 'Enregistrer' }}</button></div>
      </form>
    }
  `
})
export class ZoneFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ZoneService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = fieldError;
  readonly types = Object.values(ZoneType);
  readonly labels: Record<string, string> = { VILLE: 'Ville', COMMUNE: 'Commune', DEPARTEMENT: 'Département', REGION: 'Région' };
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly edit = signal(false);
  private id?: number;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    type: ['' as ZoneType | '', Validators.required],
    region: ['', [Validators.required, Validators.maxLength(80)]],
    departement: ['', [Validators.required, Validators.maxLength(80)]],
    isActive: [true]
  });
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.edit.set(true); this.id = Number(id); this.loading.set(true);
    this.service.getById(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: row => { this.form.patchValue(row); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Zone introuvable'); if (message) this.notify.error(message); }
    });
  }
  submit(): void {
    if (this.submitting() || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const body = { ...raw, type: raw.type as ZoneType };
    const request = this.edit() && this.id ? this.service.update(this.id, body) : this.service.create(body);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success('Zone enregistrée'); void this.router.navigate(['/zones']); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Enregistrement impossible'); if (message) this.notify.error(message); }
    });
  }
}
