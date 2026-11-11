import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/reference.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { DataTableComponent, TableCellDirective, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, TableCellDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Utilisateurs" subtitle="Comptes du back-office" [crumbs]="[{label:'Accueil', link:'/dashboard'},{label:'Utilisateurs'}]">
      <a mat-flat-button color="primary" routerLink="/users/new"><mat-icon>add</mat-icon> Nouvel utilisateur</a>
    </app-page-header>
    <app-data-table [rows]="rows()" [columns]="columns" [loading]="loading()" [textOf]="text" emptyTitle="Aucun utilisateur">
      <ng-template appTableCell="actions" let-row>
        <div class="pg-row-actions">
          <button mat-icon-button type="button" (click)="edit(row)" aria-label="Modifier"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button type="button" (click)="remove(row)" aria-label="Supprimer"><mat-icon>delete</mat-icon></button>
        </div>
      </ng-template>
    </app-data-table>
  `
})
export class UserListComponent {
  private readonly service = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  readonly loading = signal(true);
  readonly rows = signal<User[]>([]);
  readonly columns: TableColumn<User>[] = [
    { key: 'name', label: 'Nom', value: row => `${row.firstName} ${row.lastName}` },
    { key: 'email', label: 'E-mail', value: row => row.email },
    { key: 'role', label: 'Rôle', value: row => row.role || '—' },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  readonly text = (row: User) => `${row.firstName} ${row.lastName} ${row.email}`;
  constructor() {
    this.service.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.rows.set(rows || []); this.loading.set(false); },
      error: error => { this.loading.set(false); const message = httpErrorMessage(error, 'Chargement impossible'); if (message) this.notify.error(message); }
    });
  }
  edit(row: User): void { void this.router.navigate(['/users/edit', row.id]); }
  remove(row: User): void {
    this.confirm.ask({ title: 'Supprimer l’utilisateur', message: `Supprimer ${row.firstName} ${row.lastName} ?`, confirmText: 'Supprimer' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok => {
      if (!ok || !row.id) return;
      this.service.delete(row.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.notify.success('Utilisateur supprimé'); this.rows.update(list => list.filter(item => item.id !== row.id)); },
        error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
      });
    });
  }
}
