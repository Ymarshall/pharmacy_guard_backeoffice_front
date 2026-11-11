import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { dateRangeValidator, fieldError } from '../../../shared/validators/field.validators';
import { toIsoDate } from '../../../shared/util/dates';
import { DutyProcessRequest } from '../../../core/models/duty.model';

@Component({
  selector: 'app-duty-process-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
  template: `
    <h2 mat-dialog-title>Traiter le fichier</h2>
    <mat-dialog-content>
      <form [formGroup]="form" id="process-duty" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Début</mat-label><input matInput [matDatepicker]="start" formControlName="startDate" /><mat-datepicker-toggle matIconSuffix [for]="start" /><mat-datepicker #start />@if (error(form.controls.startDate)) { <mat-error>{{ error(form.controls.startDate) }}</mat-error> }</mat-form-field>
        <mat-form-field appearance="outline" class="pg-field"><mat-label>Fin</mat-label><input matInput [matDatepicker]="end" formControlName="endDate" /><mat-datepicker-toggle matIconSuffix [for]="end" /><mat-datepicker #end />@if (error(form.controls.endDate) || form.hasError('dateRange')) { <mat-error>{{ form.hasError('dateRange') ? 'La date de début doit précéder ou égaler la date de fin' : error(form.controls.endDate) }}</mat-error> }</mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" type="submit" form="process-duty" [disabled]="form.invalid">Traiter</button>
    </mat-dialog-actions>
  `
})
export class DutyProcessDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<DutyProcessDialogComponent, DutyProcessRequest>);
  readonly error = fieldError;
  readonly form = this.fb.group({
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required]
  }, { validators: dateRangeValidator('startDate', 'endDate') });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.dialogRef.close({ startDate: toIsoDate(value.startDate), endDate: toIsoDate(value.endDate) });
  }
}
