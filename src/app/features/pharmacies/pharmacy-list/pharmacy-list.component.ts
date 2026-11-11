import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy } from '../../../core/models/pharmacy.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';
import { PageQuery } from '../../../core/api/page-query';
import { PharmacyReviewsDialogComponent } from '../pharmacy-reviews-dialog/pharmacy-reviews-dialog.component';

@Component({
  selector: 'app-pharmacy-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Pharmacies" subtitle="Référentiel des officines" [crumbs]="[{label:'Accueil', link:'/dashboard'}, {label:'Pharmacies'}]">
      <a mat-flat-button color="primary" routerLink="/pharmacies/new"><mat-icon>add</mat-icon> Nouvelle pharmacie</a>
    </app-page-header>
    <app-data-table mode="server" [total]="total()" [rows]="rows()" [columns]="columns" [loading]="loading()" emptyTitle="Aucune pharmacie" emptyHint="Ajoutez la première officine du référentiel." [textOf]="textOf" (queryChange)="onQuery($event)">
      <ng-template appTableCell="statut" let-row>
        <span class="pg-badge" [attr.data-status]="row.statut">{{ row.statut === 'ACTIF' ? 'Actif' : 'Inactif' }}</span>
      </ng-template>
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          <button mat-icon-button type="button" aria-label="Voir les avis" (click)="reviews(row)"><mat-icon>rate_review</mat-icon></button>
          <button mat-icon-button type="button" aria-label="Modifier" (click)="edit(row)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button type="button" aria-label="Supprimer" (click)="remove(row)"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class PharmacyListComponent {
  private readonly service = inject(PharmacyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  private readonly dialog = inject(MatDialog);
  readonly loading = signal(true);
  readonly rows = signal<Pharmacy[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly columns: TableColumn<Pharmacy>[] = [
    { key: 'name', label: 'Nom', value: row => row.name },
    { key: 'city', label: 'Ville', value: row => row.city },
    { key: 'commune', label: 'Commune', value: row => row.commune },
    { key: 'phone1', label: 'Téléphone', value: row => row.phone1 },
    { key: 'email', label: 'E-mail', value: row => row.email },
    { key: 'rating', label: 'Note', value: row => row.averageRating ? `${row.averageRating.toFixed(1)} (${row.totalReviews || 0})` : '—' },
    { key: 'statut', label: 'Statut', kind: 'status', value: row => row.statut },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly textOf = (row: Pharmacy) => [row.name, row.city, row.commune, row.phone1, row.email].join(' ');

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.list(this.page(), this.size()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: page => { this.rows.set(page.content || []); this.total.set(page.totalElements ?? 0); this.loading.set(false); },
      error: error => {
        this.loading.set(false);
        const message = httpErrorMessage(error, 'Impossible de charger les pharmacies');
        if (message) this.notify.error(message);
      }
    });
  }

  onQuery(query: PageQuery): void {
    const page = query.page ?? 0;
    const size = query.size ?? 10;
    if (page === this.page() && size === this.size()) return;
    this.page.set(page);
    this.size.set(size);
    this.load();
  }

  edit(row: Pharmacy): void { void this.router.navigate(['/pharmacies/edit', row.id]); }

  reviews(row: Pharmacy): void {
    this.dialog.open(PharmacyReviewsDialogComponent, { width: '720px', data: { pharmacy: row } });
  }

  remove(row: Pharmacy): void {
    this.confirm.ask({
      title: 'Supprimer la pharmacie',
      message: `Supprimer « ${row.name} » ? Cette action est irréversible.`,
      confirmText: 'Supprimer'
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok || !row.id) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Pharmacie supprimée'); this.load(); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
