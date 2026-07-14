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
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { DutyPeriodService } from '../../services/duty-period.service';
import { DutyPeriod } from '../../models/duty-period.model';

@Component({
  selector: 'app-duty-period-list',
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
    MatChipsModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './duty-period-list.component.html',
  styleUrl: './duty-period-list.component.css'
})
export class DutyPeriodListComponent implements OnInit {
  periods: DutyPeriod[] = [];
  filteredPeriods: DutyPeriod[] = [];
  displayedColumns: string[] = ['startDate', 'endDate', 'status', 'dutiesCount', 'actions'];
  isLoading = false;
  searchTerm = '';

  constructor(
    private dutyPeriodService: DutyPeriodService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPeriods();
  }

  loadPeriods(): void {
    this.isLoading = true;
    this.dutyPeriodService.getAll().subscribe({
      next: (periods) => {
        this.periods = periods;
        this.filteredPeriods = periods;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des périodes:', error);
        this.snackBar.open('Erreur lors du chargement des périodes', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPeriods = this.periods;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    this.filteredPeriods = this.periods.filter(period =>
      this.formatDate(period.startDate).toLowerCase().includes(search) ||
      this.formatDate(period.endDate).toLowerCase().includes(search) ||
      (period.status && period.status.toLowerCase().includes(search))
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  viewDetail(id: number): void {
    this.router.navigate(['/duty-periods', id]);
  }

  deletePeriod(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette période de garde ?')) {
      this.dutyPeriodService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Période supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPeriods();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de la période', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }

  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Brouillon',
      'PROCESSING': 'En traitement',
      'PROCESSED': 'Traité',
      'ACTIVE': 'Active',
      'COMPLETED': 'Terminée'
    };
    return labels[status || ''] || status || 'Brouillon';
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'DRAFT':
        return 'warn';
      case 'PROCESSING':
        return 'accent';
      case 'PROCESSED':
        return 'primary';
      case 'ACTIVE':
        return 'primary';
      case 'COMPLETED':
        return '';
      default:
        return 'warn';
    }
  }

  getDutiesCount(period: DutyPeriod): number {
    return period.duties?.length || 0;
  }
}
