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
import { DutyImportService, ImportPreview, ReviewLine, matchStatusLabel } from '../../core/services/duty-import.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { FileUploaderComponent, StagedFile } from '../../shared/ui/file-uploader/file-uploader.component';
import { SkeletonTableComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { NotifyService } from '../../shared/notify/notify.service';
import { formatFrDate } from '../../shared/util/dates';
import { httpErrorMessage } from '../../shared/util/http-error';
import { QuickPharmacyDialogComponent } from './quick-pharmacy-dialog.component';

@Component({
  selector: 'app-poster-import',
  standalone: true,
  imports: [
    FormsModule, RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    PageHeaderComponent, FileUploaderComponent, SkeletonTableComponent, EmptyStateComponent, StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Import d’affiches" subtitle="Déposez les affiches, relisez le rattachement, puis validez. Aucune garde n’est créée avant la confirmation." [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Import d’affiches'}]" />

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
      <app-file-uploader accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg" hint="PDF ou JPEG, comme l’API" [progress]="progress()" (filesChange)="files.set($event)" />
      <div class="pg-form-actions">
        <button mat-flat-button color="primary" type="button" [disabled]="!canAnalyze()" (click)="analyze()">
          {{ busy() ? (stage() || 'Analyse…') : 'Analyser les affiches' }}
        </button>
      </div>
      @if (busy()) { <app-skeleton-table [rows]="4" [columns]="5" /> }
    } @else {
      <section class="pg-panel">
        <div class="pg-page-header">
          <div>
            <h2>Révision</h2>
            <p class="pg-muted">{{ summary() }}</p>
          </div>
          <div class="pg-page-actions">
            <button mat-stroked-button type="button" (click)="skipUnresolved()">Ignorer les ambiguës et introuvables</button>
            <button mat-flat-button color="primary" type="button" [disabled]="committing()" (click)="commit()">
              {{ committing() ? 'Validation…' : 'Valider en masse' }}
            </button>
          </div>
        </div>
        @if (!preview()!.lines.length) {
          <app-empty-state title="Aucune ligne extraite" hint="Le fichier ne contient pas de pharmacie lisible." />
        } @else {
          <div class="pg-table-scroll">
            <table class="pg-review">
              <thead>
                <tr><th>Affiche</th><th>Texte extrait</th><th>Statut</th><th>Score</th><th>Pharmacie</th><th>Décision</th></tr>
              </thead>
              <tbody>
                @for (line of preview()!.lines; track line.key) {
                  <tr [style.opacity]="line.skip ? 0.45 : 1">
                    <td>{{ line.sourceFileName }}</td>
                    <td>
                      <strong>{{ line.extractedName }}</strong>
                      @if (line.zone) { <div class="pg-muted">{{ line.zone }}</div> }
                      @if (line.phoneNumbers) { <div class="pg-muted">{{ line.phoneNumbers }}</div> }
                      @if (line.dutyAlreadyExists) { <div class="pg-muted">Déjà en garde sur cette période</div> }
                    </td>
                    <td><app-status-badge [value]="line.matchStatus" /></td>
                    <td>{{ percent(line.confidence) }} %</td>
                    <td>
                      <input matInput placeholder="Filtrer" [ngModel]="line.filter" (ngModelChange)="filterLine(line, $event)" />
                      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="pg-field">
                        <mat-select [ngModel]="line.pharmacyId" (ngModelChange)="assign(line, $event)">
                          <mat-option [value]="null">Non rattachée</mat-option>
                          @for (option of options(line); track option.id) {
                            <mat-option [value]="option.id">{{ option.label }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      @if (line.matchStatus === 'NOT_FOUND') {
                        <button mat-button type="button" (click)="createPharmacy(line)">Créer la pharmacie</button>
                      }
                    </td>
                    <td>
                      <button mat-stroked-button type="button" (click)="toggleSkip(line)">
                        {{ line.skip ? 'Réintégrer' : 'Ignorer' }}
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
  readonly stage = signal('');
  readonly busy = signal(false);
  readonly committing = signal(false);
  readonly preview = signal<ImportPreview | null>(null);
  readonly format = formatFrDate;
  readonly statusLabel = matchStatusLabel;
  readonly summary = computed(() => {
    const preview = this.preview();
    if (!preview) return '';
    const ignored = preview.lines.filter(line => line.skip).length;
    return `${preview.lines.length} ligne(s) · ${preview.matched} correspondance(s) · ${preview.ambiguous} ambiguë(s) · ${preview.notFound} introuvable(s) · ${ignored} ignorée(s)`;
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
      next: rows => this.pharmacies.set(rows || []),
      error: () => this.pharmacies.set([])
    });
  }

  canAnalyze(): boolean {
    return !!this.periodId() && this.files().length > 0 && !this.busy();
  }

  percent(value: number): number { return Math.round(value * 100); }

  options(line: ReviewLine): Array<{ id: number; label: string }> {
    const query = line.filter.trim().toLowerCase();
    if (query) {
      return this.pharmacies()
        .filter(pharmacy => pharmacy.name.toLowerCase().includes(query))
        .slice(0, 20)
        .map(pharmacy => ({ id: pharmacy.id!, label: pharmacy.name }));
    }
    const seen = new Set<number>();
    const options: Array<{ id: number; label: string }> = [];
    const push = (id: number | null | undefined, name: string | null | undefined, score?: number) => {
      if (id == null || !name || seen.has(id)) return;
      seen.add(id);
      options.push({ id, label: score == null ? name : `${name} · ${Math.round(score * 100)} %` });
    };
    push(line.suggestedPharmacyId, line.suggestedPharmacyName, line.confidence);
    line.alternatives.forEach(item => push(item.pharmacyId, item.name, item.score));
    return options;
  }

  filterLine(line: ReviewLine, value: string): void {
    line.filter = value;
    this.preview.set({ ...this.preview()! });
  }

  assign(line: ReviewLine, pharmacyId: number | null): void {
    line.pharmacyId = pharmacyId;
    line.createPharmacy = false;
    this.preview.set({ ...this.preview()! });
  }

  toggleSkip(line: ReviewLine): void {
    line.skip = !line.skip;
    this.preview.set({ ...this.preview()! });
  }

  skipUnresolved(): void {
    this.preview()!.lines.forEach(line => {
      if (line.matchStatus !== 'MATCHED' || line.pharmacyId == null) line.skip = true;
    });
    this.preview.set({ ...this.preview()! });
  }

  analyze(): void {
    const periodId = this.periodId();
    if (!periodId || this.busy()) return;
    this.busy.set(true);
    this.progress.set(0);
    this.stage.set('Envoi des affiches…');
    this.importer.analyze(this.files().map(item => item.file), periodId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: event => {
        if (event.type === 'upload') {
          this.progress.set(event.progress);
          this.stage.set('Envoi des affiches…');
        }
        if (event.type === 'previewing') {
          this.progress.set(null);
          this.stage.set(`Prévisualisation ${event.index + 1}/${event.total} · ${event.fileName}`);
        }
        if (event.type === 'preview') {
          this.preview.set(event.preview);
          this.busy.set(false);
          this.stage.set('');
        }
      },
      error: error => {
        this.busy.set(false);
        this.stage.set('');
        const message = httpErrorMessage(error, 'La prévisualisation a échoué. Aucune garde n’a été créée.');
        if (message) this.notify.error(message);
      }
    });
  }

  createPharmacy(line: ReviewLine): void {
    this.dialog.open(QuickPharmacyDialogComponent, {
      width: '480px',
      data: { name: line.extractedName, zone: line.zone }
    }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(created => {
      if (!created?.id) return;
      this.pharmacies.update(rows => [...rows, created]);
      line.pharmacyId = created.id;
      line.createPharmacy = false;
      line.skip = false;
      this.preview.set({ ...this.preview()! });
      this.notify.success(`${created.name} ajoutée au référentiel`);
    });
  }

  commit(): void {
    const preview = this.preview();
    if (!preview || this.committing()) return;
    const unresolved = preview.lines.filter(line => !line.skip && line.pharmacyId == null && !line.createPharmacy);
    if (unresolved.length) {
      this.notify.warn(`${unresolved.length} ligne(s) sans pharmacie. Ignorez-les ou rattachez-les avant de valider.`);
      return;
    }
    this.committing.set(true);
    this.importer.confirm(preview.lines).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.committing.set(false);
        const text = `${result.dutiesCreated} garde(s) créée(s), ${result.pharmaciesCreated} pharmacie(s) créée(s), ${result.skipped} ignorée(s), ${result.duplicates} doublon(s), ${result.errors} erreur(s).`;
        if (result.errors) this.notify.warn(text);
        else this.notify.success(text);
      },
      error: error => {
        this.committing.set(false);
        const message = httpErrorMessage(error, 'Validation impossible');
        if (message) this.notify.error(message);
      }
    });
  }
}
