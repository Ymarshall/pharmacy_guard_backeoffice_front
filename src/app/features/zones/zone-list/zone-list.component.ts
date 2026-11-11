import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Zone, ZoneType } from '../../../core/models/zone.model';
import { ZoneService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { PageQuery } from '../../../core/api/page-query';

const LABELS: Record<string, string> = { VILLE: 'Ville', COMMUNE: 'Commune', DEPARTEMENT: 'Département', REGION: 'Région' };

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, PageHeaderComponent, DataTableComponent, TableCellDirective, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Zones" subtitle="Découpage géographique" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Zones'}]">
      <a mat-flat-button color="primary" routerLink="/zones/new"><mat-icon>add</mat-icon> Nouvelle zone</a>
    </app-page-header>
    <app-data-table mode="server" [total]="total()" [rows]="filtered()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucune zone" (queryChange)="onQuery($event)">
      <mat-form-field tableFilters appearance="outline" subscriptSizing="dynamic">
        <mat-label>Type</mat-label>
        <mat-select [ngModel]="type()" (ngModelChange)="type.set($event)">
          <mat-option value="">Tous</mat-option>
          @for (item of types; track item) { <mat-option [value]="item">{{ labels[item] }}</mat-option> }
        </mat-select>
      </mat-form-field>
      <ng-template appTableCell="isActive" let-row><app-status-badge [value]="row.isActive" /></ng-template>
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          <button mat-icon-button type="button" (click)="edit(row)" aria-label="Modifier"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button type="button" (click)="remove(row)" aria-label="Supprimer"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class ZoneListComponent {
  private readonly service = inject(ZoneService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly types = Object.values(ZoneType);
  readonly labels = LABELS;
  readonly loading = signal(true);
  readonly rows = signal<Zone[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly type = signal('');
  readonly filtered = computed(() => this.rows().filter(zone => !this.type() || zone.type === this.type()));
  readonly columns: TableColumn<Zone>[] = [
    { key: 'name', label: 'Nom', value: row => row.name },
    { key: 'type', label: 'Type', value: row => LABELS[row.type] || row.type },
    { key: 'region', label: 'Région', value: row => row.region },
    { key: 'departement', label: 'Département', value: row => row.departement },
    { key: 'isActive', label: 'Statut', value: row => row.isActive },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: Zone) => `${row.name} ${row.region} ${row.departement}`;
  constructor() {
    this.service.list(this.page(), this.size()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: page => { this.rows.set(page.content || []); this.total.set(page.totalElements ?? 0); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  onQuery(query: PageQuery): void {
    const page = query.page ?? 0; const size = query.size ?? 10;
    if (page === this.page() && size === this.size()) return;
    this.page.set(page); this.size.set(size);
    this.loading.set(true);
    this.service.list(page, size).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => { this.rows.set(result.content || []); this.total.set(result.totalElements ?? 0); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  edit(row: Zone): void { void this.router.navigate(['/zones/edit', row.id]); }
  remove(row: Zone): void {
    this.confirm.ask({ title: 'Supprimer la zone', message: `Supprimer « ${row.name} » ?`, confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok || !row.id) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Zone supprimée'); this.rows.update(list => list.filter(item => item.id !== row.id)); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
