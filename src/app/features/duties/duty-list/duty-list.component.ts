import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Duty } from '../../../core/models/duty.model';
import { DutyService } from '../../../core/services/duty.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { formatFrDate } from '../../../shared/util/dates';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { DutyProcessDialogComponent } from '../duty-process-dialog/duty-process-dialog.component';

@Component({
  selector: 'app-duty-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Fichiers de garde" subtitle="PDF, images et fichiers Excel importés" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Fichiers'}]">
      <a mat-stroked-button routerLink="/import-affiches">Import d’affiches</a>
      <a mat-flat-button color="primary" routerLink="/duties/new"><mat-icon>add</mat-icon> Ajouter un fichier</a>
    </app-page-header>
    <app-data-table [rows]="rows()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucun fichier">
      <ng-template appTableCell="status" let-row><app-status-badge [value]="row.status || 'PENDING'" /></ng-template>
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          @if (!row.status || row.status === 'PENDING') {
            <button mat-icon-button type="button" aria-label="Traiter" (click)="process(row)"><mat-icon>play_arrow</mat-icon></button>
          }
          <button mat-icon-button type="button" aria-label="Modifier" (click)="edit(row)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button type="button" aria-label="Supprimer" (click)="remove(row)"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class DutyListComponent {
  private readonly service = inject(DutyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly loading = signal(true);
  readonly rows = signal<Duty[]>([]);
  readonly columns: TableColumn<Duty>[] = [
    { key: 'name', label: 'Nom', value: row => row.name || row.fileName || '—' },
    { key: 'description', label: 'Description', value: row => row.description || '—' },
    { key: 'fileName', label: 'Fichier', value: row => row.fileName || '—' },
    { key: 'status', label: 'Statut', value: row => row.status || 'PENDING' },
    { key: 'createdAt', label: 'Créé le', value: row => formatFrDate(row.createdAt, true) },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: Duty) => `${row.name || ''} ${row.description || ''} ${row.fileName || ''}`;
  constructor() { this.load(); }
  load(): void {
    this.loading.set(true);
    this.service.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.rows.set(rows || []); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  edit(row: Duty): void { void this.router.navigate(['/duties/edit', row.id]); }
  process(row: Duty): void {
    this.dialog.open(DutyProcessDialogComponent, { width: '420px' }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      if (!result || !row.id) return;
      this.service.process(row.id, result).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Fichier en cours de traitement'); this.load(); },
        error: error => { const message = httpErrorMessage(error, 'Traitement impossible'); if (message) this.notify.error(message); }
      });
    });
  }
  remove(row: Duty): void {
    this.confirm.ask({ title: 'Supprimer le fichier', message: `Supprimer « ${row.name || row.fileName || 'ce fichier'} » ?`, confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok || !row.id) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Fichier supprimé'); this.load(); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
