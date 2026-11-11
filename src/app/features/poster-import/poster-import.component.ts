import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DutyPeriod } from '../../core/models/duty-period.model';
import { Pharmacy } from '../../core/models/pharmacy.model';
import { DutyPeriodService } from '../../core/services/reference.service';
import { PharmacyService } from '../../core/services/pharmacy.service';
import { DutyImportService, ImportPreview, ReviewLine } from '../../core/services/duty-import.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { FileUploaderComponent, StagedFile } from '../../shared/ui/file-uploader/file-uploader.component';
import { SkeletonTableComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { NotifyService } from '../../shared/notify/notify.service';
import { confidenceLabel } from '../../shared/util/similarity';
import { formatFrDate } from '../../shared/util/dates';
import { httpErrorMessage } from '../../shared/util/http-error';
import { QuickPharmacyDialogComponent } from './quick-pharmacy-dialog.component';

@Component({
  selector: 'app-poster-import',
  standalone: true,
  imports: [
    FormsModule, RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    PageHeaderComponent, FileUploaderComponent, SkeletonTableComponent, EmptyStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Import d’affiches" subtitle="Déposez les affiches, relisez le rattachement, puis validez." [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Import d’affiches'}]" />

    <section class="pg-panel" style="margin-bottom: 16px">
      <mat-form-field appearance="outline" class="pg-field">
        <mat-label>Période de garde</mat-label>
        <mat-select [ngModel]="periodId()" (ngModelChange)="periodId.set($event)">
          @for (period of periods(); track period.id) {
            <mat-option [value]="period.id">{{ format(period.startDate) }} — {{ format(period.endDate) }} · {{ period.status || 'Brouillon' }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <a mat-button routerLink="/duty-periods/new">Créer une période</a>
    </section>

    @if (!preview()) {
      <app-file-uploader [progress]="progress()" (filesChange)="files.set($event)" />
      <div class="pg-form-actions">
        <button mat-flat-button color="primary" type="button" [disabled]="!canAnalyze()" (click)="analyze()">
          {{ busy() ? 'Analyse…' : 'Analyser les affiches' }}
        </button>
      </div>
      @if (busy()) { <app-skeleton-table [rows]="4" [columns]="4" /> }
    } @else {
      <section class="pg-panel">
        <div class="pg-page-header">
          <div>
            <h2>Révision</h2>
            <p class="pg-muted">{{ summary() }} @if (preview()!.mode === 'legacy') { · extraction déjà enregistrée par l’API, relecture locale }</p>
          </div>
          <div class="pg-page-actions">
            <button mat-stroked-button type="button" (click)="ignoreLow()">Ignorer la faible confiance</button>
            <button mat-stroked-button type="button" (click)="acceptHigh()">Garder la haute confiance</button>
            <button mat-flat-button color="primary" type="button" [disabled]="committing()" (click)="commit()">
              {{ committing() ? 'Validation…' : 'Valider en masse' }}
            </button>
          </div>
        </div>
        @if (!preview()!.lines.length) {
          <app-empty-state title="Aucune ligne extraite" hint="L’API n’a renvoyé aucune pharmacie pour ces fichiers." />
        } @else {
          <div class="pg-table-scroll">
            <table class="pg-review">
              <thead>
                <tr><th>Affiche</th><th>Texte extrait</th><th>Confiance</th><th>Pharmacie</th><th>Décision</th></tr>
              </thead>
              <tbody>
                @for (line of preview()!.lines; track line.key) {
                  <tr [style.opacity]="line.action === 'IGNORE' ? 0.45 : 1">
                    <td>{{ line.sourceFileName }}</td>
                    <td>
                      <strong>{{ line.extractedName }}</strong>
                      @if (line.zone) { <div class="pg-muted">{{ line.zone }}</div> }
                    </td>
                    <td>
                      {{ label(line.confidence) }} · {{ percent(line.confidence) }} %
                      <div class="pg-confidence" [class.is-mid]="line.confidence >= 0.6 && line.confidence < 0.85" [class.is-low]="line.confidence < 0.6">
                        <span [style.width.%]="line.confidence * 100"></span>
                      </div>
                    </td>
                    <td>
                      <input matInput placeholder="Filtrer les pharmacies" [ngModel]="line.filter" (ngModelChange)="filterLine(line, $event)" />
                      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="pg-field">
                        <mat-select [ngModel]="line.pharmacyId" (ngModelChange)="assign(line, $event)">
                          <mat-option [value]="null">Non rattachée</mat-option>
                          @for (pharmacy of filteredPharmacies(line); track pharmacy.id) {
                            <mat-option [value]="pharmacy.id">{{ pharmacy.name }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <button mat-button type="button" (click)="createPharmacy(line)">Créer la pharmacie</button>
                    </td>
                    <td>
                      <button mat-stroked-button type="button" (click)="line.action = line.action === 'IGNORE' ? 'ACCEPT' : 'IGNORE'">
                        {{ line.action === 'IGNORE' ? 'Réintégrer' : 'Ignorer' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    }
  `
})
export class PosterImportComponent {
  private readonly periodsApi = inject(DutyPeriodService);
  private readonly pharmaciesApi = inject(PharmacyService);
  private readonly importer = inject(DutyImportService);
  private readonly notify = inject(NotifyService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  readonly periods = signal<DutyPeriod[]>([]);
  readonly pharmacies = signal<Pharmacy[]>([]);
  readonly periodId = signal<number | null>(null);
  readonly files = signal<StagedFile[]>([]);
  readonly progress = signal<number | null>(null);
  readonly busy = signal(false);
  readonly committing = signal(false);
  readonly preview = signal<ImportPreview | null>(null);
  readonly format = formatFrDate;
  readonly label = confidenceLabel;
  readonly summary = computed(() => {
    const lines = this.preview()?.lines ?? [];
    const ignored = lines.filter(line => line.action === 'IGNORE').length;
    return `${lines.length} ligne(s), ${ignored} ignorée(s)`;
  });

  constructor() {
    const preset = Number(this.route.snapshot.queryParamMap.get('periodId'));
    this.periodsApi.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => {
        this.periods.set(rows || []);
        if (preset) this.periodId.set(preset);
        else if (rows[0]?.id) this.periodId.set(rows[0].id);
      },
      error: error => { const message = httpErrorMessage(error, 'Périodes indisponibles'); if (message) this.notify.error(message); }
    });
    this.pharmaciesApi.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => this.pharmacies.set(rows || [])
    });
  }

  canAnalyze(): boolean {
    return !!this.periodId() && this.files().length > 0 && !this.busy();
  }

  filteredPharmacies(line: ReviewLine): Pharmacy[] {
    const query = line.filter.trim().toLowerCase();
    return this.pharmacies().filter(pharmacy => !query || pharmacy.name.toLowerCase().includes(query));
  }

  percent(value: number): number { return Math.round(value * 100); }

  filterLine(line: ReviewLine, value: string): void {
    line.filter = value;
    this.preview.set({ ...this.preview()! });
  }

  assign(line: ReviewLine, pharmacyId: number | null): void {
    line.pharmacyId = pharmacyId;
    this.preview.set({ ...this.preview()! });
  }

  ignoreLow(): void {
    this.preview()!.lines.forEach(line => { if (line.confidence < 0.6) line.action = 'IGNORE'; });
    this.preview.set({ ...this.preview()! });
  }

  acceptHigh(): void {
    this.preview()!.lines.forEach(line => { if (line.confidence >= 0.85) line.action = 'ACCEPT'; });
    this.preview.set({ ...this.preview()! });
  }

  analyze(): void {
    const period = this.periods().find(item => item.id === this.periodId());
    if (!period || this.busy()) return;
    this.busy.set(true);
    this.progress.set(0);
    this.importer.analyze(this.files().map(item => item.file), period).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: event => {
        if (event.type === 'upload') this.progress.set(event.progress);
        if (event.type === 'processing') this.progress.set(null);
        if (event.type === 'preview') {
          this.preview.set(event.preview);
          this.busy.set(false);
          if (event.preview.mode === 'legacy') {
            this.notify.info('L’API crée les gardes dès le traitement. Cette révision s’appuie sur les lignes déjà extraites.');
          }
        }
      },
      error: error => {
        this.busy.set(false);
        const message = httpErrorMessage(error, 'Analyse impossible');
        if (message) this.notify.error(message);
      }
    });
  }

  createPharmacy(line: ReviewLine): void {
    this.dialog.open(QuickPharmacyDialogComponent, {
      width: '480px',
      data: { name: line.extractedName, zone: line.zone }
    }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(created => {
      if (!created) return;
      this.pharmacies.update(rows => [...rows, created]);
      line.pharmacyId = created.id ?? null;
      line.action = 'ACCEPT';
      this.preview.set({ ...this.preview()! });
      this.notify.success(`${created.name} ajoutée au référentiel`);
    });
  }

  commit(): void {
    const preview = this.preview();
    if (!preview || this.committing()) return;
    this.committing.set(true);
    this.importer.commit(preview, preview.lines).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.committing.set(false);
        const base = `${result.ignored} ligne(s) ignorée(s), ${Math.max(0, result.reassigned)} rattachement(s) corrigé(s).`;
        if (result.unsupported.length) {
          this.notify.warn(`${base} Le rattachement corrigé n’est pas encore accepté par l’API pour : ${result.unsupported.join(', ')}.`);
        } else {
          this.notify.success(base);
        }
      },
      error: error => {
        this.committing.set(false);
        const message = httpErrorMessage(error, 'Validation impossible');
        if (message) this.notify.error(message);
      }
    });
  }
}
