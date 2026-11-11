import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Client } from '../../../core/models/client.model';
import { ClientService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { formatFrDate } from '../../../shared/util/dates';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { buildSort, PageQuery } from '../../../core/api/page-query';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Clients" subtitle="Comptes de l’application mobile" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Clients'}]" />
    <app-data-table mode="server" [remoteQuery]="true" [total]="total()" [rows]="rows()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucun client" (queryChange)="onQuery($event)">
      <ng-template appTableCell="status" let-row><app-status-badge [value]="!!row.isActive" /></ng-template>
      <ng-template appTableCell="actions" let-row>
        <button mat-stroked-button type="button" (click)="toggle(row)">{{ row.isActive ? 'Désactiver' : 'Activer' }}</button>
      </ng-template>
    </app-data-table>
  `
})
export class ClientListComponent {
  private readonly service = inject(ClientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly loading = signal(true);
  readonly rows = signal<Client[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly search = signal('');
  readonly sort = signal<string | undefined>(undefined);
  readonly columns: TableColumn<Client>[] = [
    { key: 'lastName', label: 'Nom', sortField: 'lastName', value: row => `${row.firstName} ${row.lastName}` },
    { key: 'email', label: 'E-mail', value: row => row.email },
    { key: 'phone', label: 'Téléphone', value: row => row.phone || '—' },
    { key: 'provider', label: 'Fournisseur', sortable: false, value: row => row.providerType || '—' },
    { key: 'status', label: 'Statut', sortable: false, value: row => !!row.isActive },
    { key: 'createdAt', label: 'Créé le', sortable: false, value: row => formatFrDate(row.createdAt, true) },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: Client) => `${row.firstName} ${row.lastName} ${row.email} ${row.phone || ''}`;
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
    const sort = buildSort(query, { lastName: 'lastName', email: 'email', phone: 'phone' });
    if (page === this.page() && size === this.size() && search === this.search() && sort === this.sort()) return;
    this.page.set(page); this.size.set(size); this.search.set(search); this.sort.set(sort);
    this.load();
  }
  toggle(row: Client): void {
    if (!row.id) return;
    const next = !row.isActive;
    this.confirm.ask({ title: next ? 'Activer le client' : 'Désactiver le client', message: `${row.firstName} ${row.lastName}`, confirmText: next ? 'Activer' : 'Désactiver', danger: !next }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok) return;
      const request = next ? this.service.activate(row.id!) : this.service.deactivate(row.id!);
      request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: updated => { this.rows.update(list => list.map(item => item.id === updated.id ? updated : item)); this.notify.success(next ? 'Client activé' : 'Client désactivé'); },
        error: () => {
          this.service.updateStatus(row.id!, { isActive: next }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: updated => { this.rows.update(list => list.map(item => item.id === updated.id ? updated : item)); this.notify.success('Statut mis à jour'); },
            error: error => { const message = httpErrorMessage(error, 'Mise à jour impossible'); if (message) this.notify.error(message); }
          });
        }
      });
    });
  }
}
