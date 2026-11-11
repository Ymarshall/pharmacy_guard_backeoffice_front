import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmergencyNumber } from '../../../core/models/emergency-number.model';
import { EmergencyNumberService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';

const CATEGORIES: Record<string, string> = { medical: 'Médical', fire: 'Pompiers', police: 'Police', bloodBank: 'Banque de sang', other: 'Autre' };

@Component({
  selector: 'app-emergency-number-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Numéros d’urgence" subtitle="Numéros diffusés sur l’application mobile" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Urgences'}]">
      <a mat-flat-button color="primary" routerLink="/emergency-numbers/new"><mat-icon>add</mat-icon> Nouveau numéro</a>
    </app-page-header>
    <app-data-table [rows]="rows()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucun numéro">
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          <button mat-icon-button type="button" (click)="edit(row)" aria-label="Modifier"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button type="button" (click)="remove(row)" aria-label="Supprimer"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class EmergencyNumberListComponent {
  private readonly service = inject(EmergencyNumberService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly loading = signal(true);
  readonly rows = signal<EmergencyNumber[]>([]);
  readonly columns: TableColumn<EmergencyNumber>[] = [
    { key: 'name', label: 'Nom', value: row => row.name },
    { key: 'number', label: 'Numéro', value: row => row.number },
    { key: 'category', label: 'Catégorie', value: row => CATEGORIES[row.category || ''] || row.category || '—' },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: EmergencyNumber) => `${row.name} ${row.number} ${row.category || ''}`;
  constructor() { this.load(); }
  load(): void {
    this.service.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.rows.set(rows || []); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  edit(row: EmergencyNumber): void { void this.router.navigate(['/emergency-numbers/edit', row.id]); }
  remove(row: EmergencyNumber): void {
    this.confirm.ask({ title: 'Supprimer le numéro', message: `Supprimer « ${row.name} » ?`, confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok || !row.id) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Numéro supprimé'); this.load(); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
