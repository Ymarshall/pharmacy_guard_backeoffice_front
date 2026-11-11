import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Assurance } from '../../../core/models/pharmacy.model';
import { AssuranceService } from '../../../core/services/pharmacy.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { PageQuery } from '../../../core/api/page-query';

@Component({
  selector: 'app-assurance-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Assurances" subtitle="Organismes pris en charge" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Assurances'}]">
      <a mat-flat-button color="primary" routerLink="/assurances/new"><mat-icon>add</mat-icon> Nouvelle assurance</a>
    </app-page-header>
    <app-data-table mode="server" [total]="total()" [rows]="rows()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucune assurance" (queryChange)="onQuery($event)">
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          <button mat-icon-button type="button" aria-label="Modifier" (click)="edit(row)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button type="button" aria-label="Supprimer" (click)="remove(row)"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class AssuranceListComponent {
  private readonly service = inject(AssuranceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly loading = signal(true);
  readonly rows = signal<Assurance[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly columns: TableColumn<Assurance>[] = [
    { key: 'name', label: 'Nom', value: row => row.name },
    { key: 'description', label: 'Description', value: row => row.description || '—' },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: Assurance) => `${row.name} ${row.description || ''}`;
  constructor() { this.load(); }
  load(): void {
    this.loading.set(true);
    this.service.list(this.page(), this.size()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: page => { this.rows.set(page.content || []); this.total.set(page.totalElements ?? 0); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  onQuery(query: PageQuery): void { this.changePage(query); }
  private changePage(query: PageQuery): void {
    const page = query.page ?? 0;
    const size = query.size ?? 10;
    if (page === this.page() && size === this.size()) return;
    this.page.set(page); this.size.set(size); this.load();
  }
  edit(row: Assurance): void { void this.router.navigate(['/assurances/edit', row.id]); }
  remove(row: Assurance): void {
    this.confirm.ask({ title: 'Supprimer l’assurance', message: `Supprimer « ${row.name} » ?`, confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Assurance supprimée'); this.load(); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
