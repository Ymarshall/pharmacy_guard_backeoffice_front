import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Duty } from '../../../core/models/duty.model';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { formatFrDate } from '../../../shared/util/dates';

@Component({
  selector: 'app-duty-verification-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Fichiers traités</h2>
    <mat-dialog-content>
      <table class="pg-table">
        <thead><tr><th>Fichier</th><th>Statut</th><th>Traité le</th></tr></thead>
        <tbody>
          @for (duty of data.duties; track duty.id) {
            <tr>
              <td>{{ duty.fileName || duty.name }}</td>
              <td><app-status-badge [value]="duty.status || 'PENDING'" /></td>
              <td>{{ format(duty.processedDate) }}</td>
            </tr>
          } @empty { <tr><td colspan="3">Aucun fichier traité.</td></tr> }
        </tbody>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close type="button">Fermer</button></mat-dialog-actions>
  `
})
export class DutyVerificationDialogComponent {
  readonly data = inject<{ duties: Duty[] }>(MAT_DIALOG_DATA);
  readonly format = formatFrDate;
}
