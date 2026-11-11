import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Assurance, PharmacyCreateRequest } from '../../../core/models/pharmacy.model';
import { AssuranceService, PharmacyService } from '../../../core/services/pharmacy.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { NotifyService } from '../../../shared/notify/notify.service';
import { fieldError, forceUppercase, gpsCoordinatesValidator, ivorianPhoneValidator } from '../../../shared/validators/field.validators';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-pharmacy-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatChipsModule, MatIconModule, PageHeaderComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="edit() ? 'Modifier la pharmacie' : 'Nouvelle pharmacie'" subtitle="Les noms sont enregistrés en majuscules." [crumbs]="[{label:'Pharmacies', link:'/pharmacies'}, {label: edit() ? 'Modification' : 'Création'}]">
      <a mat-button routerLink="/pharmacies">Retour</a>
    </app-page-header>
    @if (loading()) {
      <app-skeleton-form [count]="8" />
    } @else {
      <form class="pg-panel" [formGroup]="form" (ngSubmit)="submit()">
        <div class="pg-form-grid">
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="name" class="pg-uppercase" maxlength="120" />
            @if (err('name')) { <mat-error>{{ err('name') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Pharmacien</mat-label>
            <input matInput formControlName="pharmacistName" maxlength="120" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Téléphone principal</mat-label>
            <input matInput formControlName="phone1" placeholder="+225 27 20 20 10 01" />
            @if (err('phone1')) { <mat-error>{{ err('phone1') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Téléphone secondaire</mat-label>
            <input matInput formControlName="phone2" />
            @if (err('phone2')) { <mat-error>{{ err('phone2') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" />
            @if (err('email')) { <mat-error>{{ err('email') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Horaires</mat-label>
            <input matInput formControlName="horaires" />
            @if (err('horaires')) { <mat-error>{{ err('horaires') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Ville</mat-label>
            <input matInput formControlName="city" />
            @if (err('city')) { <mat-error>{{ err('city') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Commune</mat-label>
            <input matInput formControlName="commune" />
            @if (err('commune')) { <mat-error>{{ err('commune') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Quartier</mat-label>
            <input matInput formControlName="district" />
            @if (err('district')) { <mat-error>{{ err('district') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut">
              <mat-option value="ACTIF">Actif</mat-option>
              <mat-option value="INACTIF">Inactif</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field pg-span-2">
            <mat-label>Coordonnées GPS</mat-label>
            <input matInput formControlName="location" placeholder="5.3600, -4.0083" />
            @if (err('location')) { <mat-error>{{ err('location') }}</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline" class="pg-field pg-span-2">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" formControlName="description"></textarea>
            @if (err('description')) { <mat-error>{{ err('description') }}</mat-error> }
          </mat-form-field>
        </div>
        <p class="pg-muted">Assurances</p>
        <mat-chip-listbox>
          @for (assurance of assurances(); track assurance.id) {
            <mat-chip-option [selected]="selected().includes(assurance.id)" (click)="toggle(assurance.id)">{{ assurance.name }}</mat-chip-option>
          }
        </mat-chip-listbox>
        <div class="pg-form-actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    }
  `
})
export class PharmacyFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pharmacies = inject(PharmacyService);
  private readonly assurancesApi = inject(AssuranceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly edit = signal(false);
  readonly assurances = signal<Assurance[]>([]);
  readonly selected = signal<number[]>([]);
  private pharmacyId?: number;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    pharmacistName: ['', Validators.maxLength(120)],
    phone1: ['', [Validators.required, ivorianPhoneValidator]],
    phone2: ['', ivorianPhoneValidator],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    horaires: ['', [Validators.required, Validators.maxLength(180)]],
    city: ['', [Validators.required, Validators.maxLength(80)]],
    commune: ['', [Validators.required, Validators.maxLength(80)]],
    district: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', Validators.maxLength(500)],
    photo: [''],
    statut: this.fb.nonNullable.control<'ACTIF' | 'INACTIF'>('ACTIF', Validators.required),
    location: ['', [Validators.required, gpsCoordinatesValidator]]
  });

  constructor() {
    forceUppercase(this.form.controls.name);
    this.assurancesApi.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => this.assurances.set(rows || []),
      error: error => { const message = httpErrorMessage(error, 'Assurances indisponibles'); if (message) this.notify.error(message); }
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.edit.set(true);
      this.pharmacyId = Number(id);
      this.loading.set(true);
      this.pharmacies.getById(this.pharmacyId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: pharmacy => {
          this.form.patchValue({ ...pharmacy, pharmacistName: pharmacy.pharmacistName || '', phone2: pharmacy.phone2 || '', description: pharmacy.description || '', photo: pharmacy.photo || '' });
          this.selected.set(pharmacy.assurances?.map(item => item.id) || pharmacy.assuranceIds || []);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          const message = httpErrorMessage(error, 'Pharmacie introuvable');
          if (message) this.notify.error(message);
        }
      });
    }
  }

  err(name: keyof typeof this.form.controls): string { return fieldError(this.form.controls[name]); }

  toggle(id: number): void {
    this.selected.update(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  submit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const payload: PharmacyCreateRequest = { ...raw, name: raw.name.toUpperCase(), assuranceIds: this.selected() };
    const request = this.edit() && this.pharmacyId ? this.pharmacies.update(this.pharmacyId, payload) : this.pharmacies.create(payload);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success(this.edit() ? 'Pharmacie mise à jour' : 'Pharmacie créée'); void this.router.navigate(['/pharmacies']); },
      error: error => {
        this.submitting.set(false);
        const message = httpErrorMessage(error, 'Enregistrement impossible');
        if (message) this.notify.error(message);
      }
    });
  }
}
