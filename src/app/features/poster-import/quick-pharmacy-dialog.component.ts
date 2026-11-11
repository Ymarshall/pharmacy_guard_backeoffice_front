import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Pharmacy } from '../../core/models/pharmacy.model';
import { PharmacyService } from '../../core/services/pharmacy.service';
import { fieldError, forceUppercase, gpsCoordinatesValidator, ivorianPhoneValidator } from '../../shared/validators/field.validators';
import { NotifyService } from '../../shared/notify/notify.service';
import { httpErrorMessage } from '../../shared/util/http-error';

@Component({
  selector: 'app-quick-pharmacy-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Créer la pharmacie manquante</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="quick-pharmacy" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Nom</mat-label><input matInput class="pg-uppercase" formControlName="name" />@if (err('name')) { <mat-error>{{ err('name') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Téléphone</mat-label><input matInput formControlName="phone1" />@if (err('phone1')) { <mat-error>{{ err('phone1') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>E-mail</mat-label><input matInput formControlName="email" />@if (err('email')) { <mat-error>{{ err('email') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Ville</mat-label><input matInput formControlName="city" />@if (err('city')) { <mat-error>{{ err('city') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Commune</mat-label><input matInput formControlName="commune" />@if (err('commune')) { <mat-error>{{ err('commune') }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Coordonnées GPS</mat-label><input matInput formControlName="location" placeholder="5.3600, -4.0083" />@if (err('location')) { <mat-error>{{ err('location') }}</mat-error> }</mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" type="submit" form="quick-pharmacy" [disabled]="form.invalid || submitting">Créer</button>
    </mat-dialog-actions>
  `
})
export class QuickPharmacyDialogComponent {
  readonly data = inject<{ name: string; zone?: string }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<QuickPharmacyDialogComponent, Pharmacy>);
  private readonly fb = inject(FormBuilder);
  private readonly pharmacies = inject(PharmacyService);
  private readonly notify = inject(NotifyService);
  submitting = false;
  readonly form = this.fb.nonNullable.group({
    name: [this.data.name.toUpperCase(), [Validators.required, Validators.maxLength(120)]],
    phone1: ['', [Validators.required, ivorianPhoneValidator]],
    email: ['', [Validators.required, Validators.email]],
    city: ['Abidjan', Validators.required],
    commune: [this.data.zone || '', Validators.required],
    location: ['', [Validators.required, gpsCoordinatesValidator]]
  });

  constructor() { forceUppercase(this.form.controls.name); }
  err(name: 'name' | 'phone1' | 'email' | 'city' | 'commune' | 'location'): string { return fieldError(this.form.controls[name]); }

  submit(): void {
    if (this.submitting || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const raw = this.form.getRawValue();
    this.pharmacies.create({
      ...raw,
      name: raw.name.toUpperCase(),
      phone2: '',
      horaires: 'Selon planning de garde',
      district: raw.commune,
      description: '',
      photo: '',
      statut: 'ACTIF',
      assuranceIds: []
    }).subscribe({
      next: pharmacy => this.dialogRef.close(pharmacy),
      error: error => {
        this.submitting = false;
        const message = httpErrorMessage(error, 'Création impossible');
        if (message) this.notify.error(message);
      }
    });
  }
}
