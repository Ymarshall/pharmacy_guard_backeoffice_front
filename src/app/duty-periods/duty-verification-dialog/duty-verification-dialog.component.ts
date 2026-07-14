import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Duty } from '../../models/duty.model';

@Component({
  selector: 'app-duty-verification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './duty-verification-dialog.component.html',
  styleUrl: './duty-verification-dialog.component.css'
})
export class DutyVerificationDialogComponent {
  displayedColumns: string[] = ['fileName', 'status', 'processedDate'];

  constructor(
    public dialogRef: MatDialogRef<DutyVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { duties: Duty[] }
  ) {}

  onContinue(): void {
    this.dialogRef.close('continue');
  }

  onClear(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes ces données ? Cette action est irréversible.')) {
      this.dialogRef.close('clear');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PROCESSED': 'Traité',
      'FAILED': 'Échec'
    };
    return labels[status || ''] || status || 'En attente';
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'PROCESSED':
        return 'primary';
      case 'FAILED':
        return 'warn';
      default:
        return 'warn';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
