import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator, fieldError, gpsCoordinatesValidator, ivorianPhoneValidator } from './field.validators';

describe('validateurs de formulaire', () => {
  it('accepte un téléphone ivoirien avec ou sans indicatif', () => {
    expect(ivorianPhoneValidator(new FormControl('+225 07 08 12 34 56'))).toBeNull();
    expect(ivorianPhoneValidator(new FormControl('0708123456'))).toBeNull();
    expect(ivorianPhoneValidator(new FormControl('+2250708123456'))).toBeNull();
  });

  it('refuse un numéro trop court ou un indicatif étranger', () => {
    expect(ivorianPhoneValidator(new FormControl('12345'))).toEqual({ ivorianPhone: true });
    expect(ivorianPhoneValidator(new FormControl('+33612345678'))).toEqual({ ivorianPhone: true });
  });

  it('laisse vide un téléphone facultatif', () => {
    expect(ivorianPhoneValidator(new FormControl(''))).toBeNull();
  });

  it('valide des coordonnées GPS à Abidjan', () => {
    expect(gpsCoordinatesValidator(new FormControl('5.3600, -4.0083'))).toBeNull();
    expect(gpsCoordinatesValidator(new FormControl('95, 10'))).toEqual({ gps: true });
    expect(gpsCoordinatesValidator(new FormControl('Abidjan'))).toEqual({ gps: true });
  });

  it('refuse une période dont la fin précède le début', () => {
    const group = new FormGroup({
      startDate: new FormControl(new Date(2026, 10, 20)),
      endDate: new FormControl(new Date(2026, 10, 10))
    });
    expect(dateRangeValidator('startDate', 'endDate')(group)).toEqual({ dateRange: true });
  });

  it('accepte une période cohérente', () => {
    const group = new FormGroup({
      startDate: new FormControl('2026-11-09'),
      endDate: new FormControl('2026-11-16')
    });
    expect(dateRangeValidator('startDate', 'endDate')(group)).toBeNull();
  });

  it('affiche un message français sous un champ touché', () => {
    const control = new FormControl('', { nonNullable: true });
    control.setErrors({ ivorianPhone: true });
    control.markAsTouched();
    expect(fieldError(control)).toContain('10 chiffres');
    expect(fieldError(new FormControl(''))).toBe('');
  });
});
