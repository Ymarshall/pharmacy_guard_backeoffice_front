import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { Pharmacy } from '../../models/pharmacy.model';

@Component({
  selector: 'app-pharmacy-reviews-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  templateUrl: './pharmacy-reviews-dialog.component.html',
  styleUrl: './pharmacy-reviews-dialog.component.css'
})
export class PharmacyReviewsDialogComponent implements OnInit {
  allReviews: Review[] = [];
  reviews: Review[] = [];
  isLoading = false;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  averageRating = 0;
  totalReviews = 0;

  constructor(
    public dialogRef: MatDialogRef<PharmacyReviewsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pharmacy: Pharmacy },
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.averageRating = this.data.pharmacy.averageRating || 0;
    this.totalReviews = this.data.pharmacy.totalReviews || 0;
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    // Charger toutes les reviews (on peut optimiser plus tard si nécessaire)
    this.reviewService.getPharmacyReviews(
      this.data.pharmacy.id!,
      0,
      1000 // Charger un grand nombre pour avoir toutes les reviews
    ).subscribe({
      next: (reviews: Review[]) => {
        this.allReviews = reviews || [];
        this.totalElements = this.allReviews.length;
        this.updateDisplayedReviews();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
        this.snackBar.open('Erreur lors du chargement des commentaires', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  updateDisplayedReviews(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.reviews = this.allReviews.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedReviews();
  }

  deleteReview(review: Review): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce commentaire ?`)) {
      this.reviewService.deleteReview(review.id).subscribe({
        next: () => {
          this.snackBar.open('Commentaire supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Retirer le commentaire de la liste
          this.allReviews = this.allReviews.filter(r => r.id !== review.id);
          this.totalElements = this.allReviews.length;
          this.updateDisplayedReviews();
          // Mettre à jour le total
          this.totalReviews = Math.max(0, this.totalReviews - 1);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression du commentaire', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i + 1);
  }

  getRoundedRating(rating: number): number {
    return Math.round(rating);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
