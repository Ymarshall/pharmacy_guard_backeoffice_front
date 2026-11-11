import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Téléphone ivoirien : 10 chiffres, indicatif +225 facultatif, espaces tolérés. */
export function ivorianPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '').trim();
  if (!raw) {
    return null;
  }
  const compact = raw.replace(/[\s.-]/g, '');
  return /^(\+225)?\d{10}$/.test(compact) ? null : { ivorianPhone: true };
}

/** Coordonnées « latitude, longitude ». */
export function gpsCoordinatesValidator(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '').trim();
  if (!raw) {
    return null;
  }
  const match = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/.exec(raw);
  if (!match) {
    return { gps: true };
  }
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { gps: true };
  }
  return null;
}

/** La date de début doit précéder ou égaler la date de fin. */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = toTime(group.get(startKey)?.value);
    const end = toTime(group.get(endKey)?.value);
    if (start === null || end === null) {
      return null;
    }
    return start <= end ? null : { dateRange: true };
  };
}

export function fieldError(control: AbstractControl | null | undefined): string {
  if (!control || !control.errors || !(control.dirty || control.touched)) {
    return '';
  }
  const errors = control.errors;
  if (errors['required']) {
    return 'Ce champ est requis';
  }
  if (errors['email']) {
    return 'Adresse e-mail invalide';
  }
  if (errors['minlength']) {
    return `Au moins ${errors['minlength'].requiredLength} caractères`;
  }
  if (errors['maxlength']) {
    return `Au plus ${errors['maxlength'].requiredLength} caractères`;
  }
  if (errors['min']) {
    return `La valeur minimale est ${errors['min'].min}`;
  }
  if (errors['max']) {
    return `La valeur maximale est ${errors['max'].max}`;
  }
  if (errors['ivorianPhone']) {
    return 'Numéro ivoirien attendu : 10 chiffres, indicatif +225 facultatif';
  }
  if (errors['gps']) {
    return 'Coordonnées attendues : latitude, longitude (ex. 5.3600, -4.0083)';
  }
  if (errors['dateRange']) {
    return 'La date de début doit précéder ou égaler la date de fin';
  }
  return 'Valeur invalide';
}

/** À appeler depuis le constructeur d'un composant (contexte d'injection). */
export function forceUppercase(control: FormControl<string>): void {
  control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
    const upper = (value ?? '').toUpperCase();
    if (value !== upper) {
      control.setValue(upper, { emitEvent: false });
    }
  });
}

function toTime(value: unknown): number | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  const time = date.getTime();
  return Number.isNaN(time) ? null : time;
}
