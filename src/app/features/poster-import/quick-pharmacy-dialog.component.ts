import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { fieldError, forceUppercase, gpsCoordinatesValidator, ivorianPhoneValidator } from '../../shared/validators/field.validators';

export interface PharmacyDraft {
  name: string;
  city: string;
  commune: string;
  phone: string;
  zone?: string;
  description?: string;
  coordinates?: string;
}

@Component({
  selector: 'app-quick-pharmacy-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Créer la pharmacie à la validation</h2>
    <mat-dialog-content>
      <p class="pg-muted">La pharmacie sera créée lors de la confirmation, avec le nom en majuscules. Les coordonnées GPS restent facultatives.</p>
      <form [formGroup]="form" id="quick-pharmacy" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput class="pg-uppercase" formControlName="name" />@if (err('name')) { <mat-error>{{ err('name') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Téléphone</mat-label><input matInput formControlName="phone" placeholder="07 00 00 00 00" />@if (err('phone')) { <mat-error>{{ err('phone') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Ville</mat-label><input matInput formControlName="city" />@if (err('city')) { <mat-error>{{ err('city') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Commune</mat-label><input matInput formControlName="commune" />@if (err('commune')) { <mat-error>{{ err('commune') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Description</mat-label><input matInput formControlName="description" /></mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Coordonnées GPS (facultatif)</mat-label><input matInput formControlName="coordinates" placeholder="5.3600, -4.0083" />@if (err('coordinates')) { <mat-error>{{ err('coordinates') }}</mat-error> }</mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" type="submit" form="quick-pharmacy" [disabled]="form.invalid">Préparer</button>
    </mat-dialog-actions>
  `
})
export class QuickPharmacyDialogComponent {
  readonly data = inject<{ name: string; zone?: string; phone?: string }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<QuickPharmacyDialogComponent, PharmacyDraft>);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: [this.data.name.toUpperCase(), [Validators.required, Validators.maxLength(120)]],
    phone: [this.data.phone || '', [Validators.required, ivorianPhoneValidator]],
    city: ['Abidjan', Validators.required],
    commune: [this.data.zone || '', Validators.required],
    description: [''],
    coordinates: ['', gpsCoordinatesValidator]
  });

  constructor() { forceUppercase(this.form.controls.name); }
  err(name: 'name' | 'phone' | 'city' | 'commune' | 'coordinates'): string { return fieldError(this.form.controls[name]); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      name: raw.name.trim().toUpperCase(),
      phone: raw.phone.trim(),
      city: raw.city.trim(),
      commune: raw.commune.trim(),
      zone: this.data.zone,
      description: raw.description.trim() || undefined,
      coordinates: raw.coordinates.trim() || undefined
    });
  }
}
