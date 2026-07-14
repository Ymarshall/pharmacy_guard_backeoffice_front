import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { DutyService } from '../../services/duty.service';
import { Duty } from '../../models/duty.model';
import { DutyProcessDialogComponent } from '../duty-process-dialog/duty-process-dialog.component';

@Component({
  selector: 'app-duty-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatChipsModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './duty-list.component.html',
  styleUrl: './duty-list.component.css'
})
export class DutyListComponent implements OnInit {
  duties: Duty[] = [];
  filteredDuties: Duty[] = [];
  displayedColumns: string[] = ['name', 'description', 'fileName', 'status', 'createdAt', 'actions'];
  isLoading = false;
  searchTerm = '';

  constructor(
    private dutyService: DutyService,
    public router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDuties();
  }

  loadDuties(): void {
    this.isLoading = true;
    this.dutyService.getAll().subscribe({
      next: (duties) => {
        this.duties = duties;
        this.filteredDuties = duties;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des gardes:', error);
        this.snackBar.open('Erreur lors du chargement des gardes', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDuties = this.duties;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    this.filteredDuties = this.duties.filter(duty =>
      (duty.name && duty.name.toLowerCase().includes(search)) ||
      (duty.description && duty.description.toLowerCase().includes(search)) ||
      (duty.fileName && duty.fileName.toLowerCase().includes(search))
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  editDuty(id: number): void {
    this.router.navigate(['/duties/edit', id]);
  }

  deleteDuty(id: number, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la garde "${name || 'sans nom'}" ?`)) {
      this.dutyService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Garde supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadDuties();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de la garde', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
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

  isPending(duty: Duty): boolean {
    return duty.status === 'PENDING' || !duty.status;
  }

  openProcessDialog(duty: Duty): void {
    const dialogRef = this.dialog.open(DutyProcessDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processDuty(duty.id!, result);
      }
    });
  }

  processDuty(id: number, processRequest: any): void {
    this.dutyService.process(id, processRequest).subscribe({
      next: () => {
        this.snackBar.open('Fichier en cours de traitement', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadDuties();
      },
      error: (error) => {
        console.error('Erreur lors du traitement:', error);
        this.snackBar.open('Erreur lors du traitement du fichier', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PROCESSED':
        return 'Traité';
      case 'FAILED':
        return 'Échec';
      default:
        return 'En attente';
    }
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
}
