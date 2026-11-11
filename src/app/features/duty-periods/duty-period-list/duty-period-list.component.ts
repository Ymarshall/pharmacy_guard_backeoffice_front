import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DutyPeriod } from '../../../core/models/duty-period.model';
import { DutyPeriodService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { formatFrDate } from '../../../shared/util/dates';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { buildSort, PageQuery } from '../../../core/api/page-query';

@Component({
  selector: 'app-duty-period-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Périodes de garde" subtitle="Préparer, vérifier et activer une semaine de garde" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Périodes'}]">
      <a mat-flat-button color="primary" routerLink="/duty-periods/new"><mat-icon>add</mat-icon> Nouvelle période</a>
    </app-page-header>
    <app-data-table mode="server" [remoteQuery]="true" [total]="total()" [rows]="rows()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucune période" (queryChange)="onQuery($event)">
      <ng-template appTableCell="status" let-row><app-status-badge [value]="row.status || 'DRAFT'" /></ng-template>
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          <a mat-button [routerLink]="['/duty-periods', row.id]">Ouvrir</a>
          <a mat-button [routerLink]="['/import-affiches']" [queryParams]="{ periodId: row.id }">Importer</a>
          <button mat-icon-button type="button" aria-label="Supprimer" (click)="remove(row)"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class DutyPeriodListComponent {
  private readonly service = inject(DutyPeriodService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly loading = signal(true);
  readonly rows = signal<DutyPeriod[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly search = signal('');
  readonly sort = signal<string | undefined>(undefined);
  readonly columns: TableColumn<DutyPeriod>[] = [
    { key: 'startDate', label: 'Début', value: row => formatFrDate(row.startDate) },
    { key: 'endDate', label: 'Fin', value: row => formatFrDate(row.endDate) },
    { key: 'status', label: 'Statut', sortable: false, value: row => row.status || 'DRAFT' },
    { key: 'count', label: 'Fichiers', sortable: false, value: row => row.duties?.length || 0 },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: DutyPeriod) => `${row.startDate} ${row.endDate} ${row.status || ''}`;
  constructor() { this.load(); }
  load(): void {
    this.service.list(this.page(), this.size(), this.search(), this.sort()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: page => { this.rows.set(page.content || []); this.total.set(page.totalElements ?? 0); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  onQuery(query: PageQuery): void {
    const page = query.page ?? 0;
    const size = query.size ?? 10;
    const search = query.search ?? '';
    const sort = buildSort(query, { startDate: 'startDate', endDate: 'endDate' });
    if (page === this.page() && size === this.size() && search === this.search() && sort === this.sort()) return;
    this.page.set(page); this.size.set(size); this.search.set(search); this.sort.set(sort);
    this.load();
  }
  remove(row: DutyPeriod): void {
    this.confirm.ask({ title: 'Supprimer la période', message: 'Les gardes liées seront retirées avec la période.', confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok || !row.id) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Période supprimée'); this.load(); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
