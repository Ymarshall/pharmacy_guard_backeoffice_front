import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { Duty } from '../../../core/models/duty.model';
import { DutyPeriod } from '../../../core/models/duty-period.model';
import { DutyService } from '../../../core/services/duty.service';
import { DutyPeriodService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { SkeletonFormComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { dateRangeValidator, fieldError } from '../../../shared/validators/field.validators';
import { formatFrDate, toIsoDate } from '../../../shared/util/dates';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { DutyVerificationDialogComponent } from '../duty-verification-dialog/duty-verification-dialog.component';

@Component({
  selector: 'app-duty-period-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, PageHeaderComponent, StatusBadgeComponent, SkeletonFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
  template: `
    <app-page-header [title]="isNew() ? 'Nouvelle période' : 'Période de garde'" [crumbs]="[{label:'Périodes', link:'/duty-periods'},{label:'Détail'}]">
      <a mat-button routerLink="/duty-periods">Retour</a>
      @if (periodId()) { <a mat-flat-button color="primary" [routerLink]="['/import-affiches']" [queryParams]="{ periodId: periodId() }">Import guidé</a> }
    </app-page-header>
    @if (loading()) { <app-skeleton-form [count]="4" /> } @else {
      <div class="pg-steps">
        @for (step of steps; track step.number) {
          <button type="button" class="pg-step" [class.is-active]="current() === step.number" (click)="go(step.number)">
            <strong>{{ step.number }}. {{ step.label }}</strong>
            @if (step.done) { <span class="pg-muted">Terminé</span> }
          </button>
        }
      </div>
      <section class="pg-panel">
        @if (current() === 1) {
          <h2>Créer la période</h2>
          <form class="pg-form-grid" [formGroup]="form" (ngSubmit)="create()">
            <mat-form-field appearance="outline"><mat-label>Début</mat-label><input matInput [matDatepicker]="start" formControlName="startDate" /><mat-datepicker-toggle matIconSuffix [for]="start" /><mat-datepicker #start />@if (error(form.controls.startDate)) { <mat-error>{{ error(form.controls.startDate) }}</mat-error> }</mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Fin</mat-label><input matInput [matDatepicker]="end" formControlName="endDate" /><mat-datepicker-toggle matIconSuffix [for]="end" /><mat-datepicker #end />@if (form.hasError('dateRange')) { <mat-error>La date de début doit précéder ou égaler la date de fin</mat-error> }</mat-form-field>
            <div class="pg-form-actions pg-span-2"><button mat-flat-button color="primary" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Création…' : 'Créer la période' }}</button></div>
          </form>
        }
        @if (current() === 2) {
          <h2>Fichiers</h2>
          <table class="pg-table">
            <thead><tr><th>Fichier</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              @for (file of files(); track file.id) {
                <tr>
                  <td>{{ file.fileName || file.name }}</td>
                  <td><app-status-badge [value]="file.status || 'PENDING'" /></td>
                  <td class="pg-row-actions">
                    @if (!file.status || file.status === 'PENDING') { <button mat-button type="button" (click)="processOne(file)">Traiter</button> }
                    <button mat-icon-button type="button" aria-label="Supprimer" (click)="removeFile(file)"><mat-icon>delete</mat-icon></button>
                  </td>
                </tr>
              } @empty { <tr><td colspan="3">Aucun fichier pour le moment.</td></tr> }
            </tbody>
          </table>
          <div class="pg-drop" style="margin-top:16px" (dragover)="$event.preventDefault()" (drop)="drop($event)">
            <p>Glissez des PDF ou JPEG, ou choisissez-les.</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" multiple (change)="pick($event)" />
            @if (queue().length) { <p>{{ queue().length }} fichier(s) prêt(s)</p> }
            <button mat-flat-button color="primary" type="button" [disabled]="!queue().length || submitting()" (click)="upload()">Envoyer</button>
          </div>
          <div style="margin-top:16px">
            <p>Fichier Excel</p>
            <input type="file" accept=".xlsx,.xls" (change)="pickExcel($event)" />
            <button mat-stroked-button type="button" [disabled]="!excel() || submitting()" (click)="uploadExcel()">Envoyer l’Excel</button>
          </div>
        }
        @if (current() === 3) {
          <h2>Traiter les fichiers</h2>
          <p class="pg-muted">{{ pendingCount() }} fichier(s) en attente.</p>
          <button mat-flat-button color="primary" type="button" [disabled]="!pendingCount() || submitting()" (click)="processAll()">Tout traiter</button>
        }
        @if (current() === 4) {
          <h2>Vérifier les gardes</h2>
          @for (group of grouped(); track group.zone) {
            <h3>{{ group.zone }}</h3>
            @for (duty of group.duties; track duty.id) {
              <div class="pg-page-header">
                <div><strong>{{ duty.pharmacyName || duty.name || 'Sans nom' }}</strong><p class="pg-muted">{{ duty.pharmacyCommune }}</p></div>
                <div class="pg-row-actions">
                  <app-status-badge [value]="duty.status" />
                  @if (duty.status === 'ACTIVE' || duty.status === 'TO_VERIFY') { <button mat-button type="button" (click)="setEnabled(duty, false)">Désactiver</button> }
                  @if (duty.status === 'DISABLED' || duty.status === 'DISABLE') { <button mat-button type="button" (click)="setEnabled(duty, true)">Réactiver</button> }
                </div>
              </div>
            }
          } @empty { <p>Aucune garde extraite.</p> }
          <div class="pg-form-actions">
            <button mat-stroked-button color="warn" type="button" (click)="clear()">Supprimer et recommencer</button>
            <button mat-button type="button" (click)="viewProcessed()">Voir le détail</button>
            <button mat-flat-button color="primary" type="button" (click)="go(5)">Continuer</button>
          </div>
        }
        @if (current() === 5 && period()) {
          <h2>Activer la période</h2>
          <p>{{ format(period()!.startDate) }} — {{ format(period()!.endDate) }}</p>
          <p>Statut : <app-status-badge [value]="period()!.status || 'DRAFT'" /></p>
          <button mat-flat-button color="primary" type="button" [disabled]="submitting() || period()!.status === 'ACTIVE'" (click)="activate()">Activer la période</button>
        }
      </section>
    }
  `
})
export class DutyPeriodDetailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly periods = inject(DutyPeriodService);
  private readonly duties = inject(DutyService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotifyService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = fieldError;
  readonly format = formatFrDate;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isNew = signal(true);
  readonly current = signal(1);
  readonly period = signal<DutyPeriod | null>(null);
  readonly periodId = signal<number | null>(null);
  readonly files = signal<Duty[]>([]);
  readonly guards = signal<Duty[]>([]);
  readonly queue = signal<File[]>([]);
  readonly excel = signal<File | null>(null);
  readonly steps = [
    { number: 1, label: 'Créer', done: false },
    { number: 2, label: 'Fichiers', done: false },
    { number: 3, label: 'Traiter', done: false },
    { number: 4, label: 'Vérifier', done: false },
    { number: 5, label: 'Activer', done: false }
  ];
  readonly form = this.fb.group({
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required]
  }, { validators: dateRangeValidator('startDate', 'endDate') });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew.set(false);
      this.periodId.set(Number(id));
      this.load(Number(id));
    }
  }

  pendingCount(): number { return this.files().filter(file => !file.status || file.status === 'PENDING').length; }
  grouped(): Array<{ zone: string; duties: Duty[] }> {
    const map = new Map<string, Duty[]>();
    this.guards().forEach(duty => {
      const zone = duty.pharmacyZone || duty.zone || duty.zoneName || 'Zone non définie';
      map.set(zone, [...(map.get(zone) || []), duty]);
    });
    return [...map.entries()].map(([zone, duties]) => ({ zone, duties })).sort((a, b) => a.zone.localeCompare(b.zone, 'fr'));
  }

  go(step: number): void {
    if (step > 1 && !this.periodId() && step !== 4 && step !== 5) {
      this.notify.warn('Créez d’abord la période');
      return;
    }
    this.current.set(step);
    if (step === 2 || step === 3) this.reloadFiles();
    if (step === 4) this.reloadGuards();
  }

  create(): void {
    if (this.submitting() || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.periods.create({ startDate: toIsoDate(value.startDate), endDate: toIsoDate(value.endDate) }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: period => {
        this.period.set(period); this.periodId.set(period.id ?? null); this.isNew.set(false);
        this.steps[0].done = true; this.current.set(2); this.submitting.set(false);
        this.notify.success('Période créée');
      },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Création impossible'); if (message) this.notify.error(message); }
    });
  }

  pick(event: Event): void { this.queue.set(validFiles((event.target as HTMLInputElement).files)); }
  drop(event: DragEvent): void { event.preventDefault(); this.queue.set(validFiles(event.dataTransfer?.files)); }
  pickExcel(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const ok = !!file && /\.xlsx?$/.test(file.name.toLowerCase());
    this.excel.set(ok ? file : null);
    if (file && !ok) this.notify.error('Seuls les fichiers Excel sont acceptés');
  }

  upload(): void {
    const id = this.periodId();
    if (!id || this.submitting()) return;
    this.submitting.set(true);
    this.duties.uploadMultiple(this.queue(), id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.queue.set([]); this.submitting.set(false); this.notify.success('Fichiers envoyés'); this.reloadFiles(); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Envoi impossible'); if (message) this.notify.error(message); }
    });
  }

  uploadExcel(): void {
    const id = this.periodId();
    const file = this.excel();
    if (!id || !file) return;
    this.submitting.set(true);
    this.duties.uploadExcel(file, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.excel.set(null); this.submitting.set(false); this.notify.success('Excel envoyé'); this.reloadFiles(); },
      error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Envoi Excel impossible'); if (message) this.notify.error(message); }
    });
  }

  processOne(file: Duty): void {
    const period = this.period();
    if (!period || !file.id) return;
    this.duties.process(file.id, { startDate: period.startDate, endDate: period.endDate }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success('Fichier traité'); this.reloadFiles(); },
      error: error => { const message = httpErrorMessage(error, 'Traitement impossible'); if (message) this.notify.error(message); }
    });
  }

  processAll(): void {
    const period = this.period();
    if (!period) return;
    const pending = this.files().filter(file => file.id && (!file.status || file.status === 'PENDING'));
    if (!pending.length) return;
    this.submitting.set(true);
    let left = pending.length;
    pending.forEach(file => {
      this.duties.process(file.id!, { startDate: period.startDate, endDate: period.endDate }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { if (--left === 0) { this.submitting.set(false); this.notify.success('Fichiers traités'); this.reloadFiles(); this.go(4); } },
        error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Traitement impossible'); if (message) this.notify.error(message); }
      });
    });
  }

  removeFile(file: Duty): void {
    if (!file.id) return;
    this.confirm.ask({ title: 'Supprimer le fichier', message: file.fileName || 'Ce fichier sera retiré.', confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok) return;
      this.duties.delete(file.id!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => this.reloadFiles() });
    });
  }

  setEnabled(duty: Duty, enabled: boolean): void {
    if (!duty.id) return;
    const request = enabled ? this.duties.enableDuty(duty.id) : this.duties.disableDuty(duty.id);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notify.success(enabled ? 'Garde réactivée' : 'Garde désactivée'); this.reloadGuards(); },
      error: error => { const message = httpErrorMessage(error, 'Mise à jour impossible'); if (message) this.notify.error(message); }
    });
  }

  viewProcessed(): void {
    this.dialog.open(DutyVerificationDialogComponent, { width: '720px', data: { duties: this.files().filter(file => file.status === 'PROCESSED') } });
  }

  clear(): void {
    const id = this.periodId();
    if (!id) return;
    this.confirm.ask({ title: 'Tout effacer', message: 'La période et ses données seront supprimées.', confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok) return;
      this.periods.clear(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Données supprimées'); this.files.set([]); this.guards.set([]); this.current.set(2); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }

  activate(): void {
    const id = this.periodId();
    if (!id) return;
    this.confirm.ask({ title: 'Activer la période', message: 'Elle sera diffusée vers l’application mobile.', confirmText: 'Activer', danger: false }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok) return;
      this.submitting.set(true);
      this.periods.activate(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: period => { this.period.set(period); this.steps[4].done = true; this.submitting.set(false); this.notify.success('Période activée'); },
        error: error => { this.submitting.set(false); const message = httpErrorMessage(error, 'Activation impossible'); if (message) this.notify.error(message); }
      });
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.periods.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: period => {
        this.period.set(period);
        this.form.patchValue({ startDate: new Date(period.startDate), endDate: new Date(period.endDate) });
        this.steps[0].done = true;
        if (period.status === 'ACTIVE') this.steps[4].done = true;
        this.loading.set(false);
        this.reloadFiles();
      },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Période introuvable'); if (message) this.notify.error(message); }
    });
  }

  private reloadFiles(): void {
    const id = this.periodId();
    if (!id) return;
    this.duties.getByPeriodId(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => {
        this.files.set(rows || []);
        this.steps[1].done = (rows || []).length > 0;
        this.steps[2].done = (rows || []).some(row => row.status === 'PROCESSED');
      },
      error: () => this.files.set([])
    });
  }

  private reloadGuards(): void {
    const id = this.periodId();
    if (!id) return;
    this.duties.getDutiesByPeriod(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.guards.set(rows || []); this.steps[3].done = (rows || []).length > 0; },
      error: () => this.guards.set([])
    });
  }
}

function validFiles(list?: FileList | null): File[] {
  return Array.from(list || []).filter(file => /\.(pdf|jpe?g)$/i.test(file.name) || ['application/pdf', 'image/jpeg'].includes(file.type));
}
