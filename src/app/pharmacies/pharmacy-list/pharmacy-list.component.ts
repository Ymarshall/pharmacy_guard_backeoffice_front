import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { PharmacyService } from '../../services/pharmacy.service';
import { Pharmacy } from '../../models/pharmacy.model';
import { PharmacyReviewsDialogComponent } from '../pharmacy-reviews-dialog/pharmacy-reviews-dialog.component';

@Component({
  selector: 'app-pharmacy-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './pharmacy-list.component.html',
  styleUrl: './pharmacy-list.component.css'
})
export class PharmacyListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  pharmacies: Pharmacy[] = [];
  dataSource = new MatTableDataSource<Pharmacy>([]);
  displayedColumns: string[] = ['name', 'city', 'commune', 'phone1', 'email', 'rating', 'statut', 'actions'];
  isLoading = false;
  searchTerm = '';
  
  // Pagination settings
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];

  constructor(
    private pharmacyService: PharmacyService,
    public router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPharmacies();
  }

  loadPharmacies(): void {
    this.isLoading = true;
    this.pharmacyService.getAll().subscribe({
      next: (pharmacies) => {
        this.pharmacies = pharmacies || [];
        this.dataSource.data = this.pharmacies;
        this.isLoading = false;
        // Attacher le paginator après le rendu
        this.attachPaginator();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pharmacies:', error);
        this.snackBar.open('Erreur lors du chargement des pharmacies', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Configuration du filtre personnalisé une seule fois
    this.dataSource.filterPredicate = (data: Pharmacy, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.name?.toLowerCase().includes(searchStr) || false) ||
        (data.city?.toLowerCase().includes(searchStr) || false) ||
        (data.commune?.toLowerCase().includes(searchStr) || false) ||
        (data.phone1?.toLowerCase().includes(searchStr) || false) ||
        (data.email?.toLowerCase().includes(searchStr) || false)
      );
    };
  }
  
  attachPaginator(): void {
    // Méthode pour attacher le paginator après le rendu conditionnel
    setTimeout(() => {
      if (this.paginator && !this.dataSource.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }, 100);
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  editPharmacy(id: number): void {
    this.router.navigate(['/pharmacies/edit', id]);
  }

  deletePharmacy(id: number, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la pharmacie "${name}" ?`)) {
      this.pharmacyService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Pharmacie supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Recharger les pharmacies et mettre à jour la source de données
          this.loadPharmacies();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de la pharmacie', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatutColor(statut: string): string {
    return statut === 'ACTIF' ? 'primary' : 'warn';
  }

  viewReviews(pharmacy: Pharmacy): void {
    this.dialog.open(PharmacyReviewsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { pharmacy },
      disableClose: false
    });
  }

  getRatingDisplay(rating?: number): string {
    if (!rating || rating === 0) {
      return 'N/A';
    }
    return rating.toFixed(1);
  }

  hasReviews(pharmacy: Pharmacy): boolean {
    return (pharmacy.totalReviews || 0) > 0;
  }

  getStars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  getRoundedRating(rating?: number): number {
    if (!rating) return 0;
    return Math.round(rating);
  }
}
