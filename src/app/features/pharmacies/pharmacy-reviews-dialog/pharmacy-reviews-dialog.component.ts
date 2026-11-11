import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Pharmacy } from '../../../core/models/pharmacy.model';
import { Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/reference.service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { NotifyService } from '../../../shared/notify/notify.service';
import { SkeletonTableComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { httpErrorMessage } from '../../../shared/util/http-error';

@Component({
  selector: 'app-pharmacy-reviews-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, DatePipe, SkeletonTableComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Avis — {{ data.pharmacy.name }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <app-skeleton-table [rows]="4" [columns]="1" />
      } @else if (!reviews().length) {
        <app-empty-state title="Aucun avis" icon="rate_review" />
      } @else {
        @for (review of reviews(); track review.id) {
          <article style="padding: 12px 0; border-bottom: 1px solid var(--pg-border)">
            <strong>{{ review.clientName || 'Client' }}</strong>
            <span class="pg-muted"> · {{ review.rating }}/5 · {{ review.createdAt | date:'dd MMM yyyy':'':'fr-FR' }}</span>
            <p>{{ review.comment }}</p>
            <button mat-button color="warn" type="button" (click)="remove(review)">Supprimer</button>
          </article>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Fermer</button>
    </mat-dialog-actions>
  `
})
export class PharmacyReviewsDialogComponent {
  readonly data = inject<{ pharmacy: Pharmacy }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<PharmacyReviewsDialogComponent>);
  private readonly reviewsApi = inject(ReviewService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly reviews = signal<Review[]>([]);

  constructor() {
    this.reviewsApi.getPharmacyReviews(this.data.pharmacy.id!, 0, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.reviews.set(rows || []); this.loading.set(false); },
      error: error => {
        this.loading.set(false);
        const message = httpErrorMessage(error, 'Avis indisponibles');
        if (message) this.notify.error(message);
      }
    });
  }

  remove(review: Review): void {
    this.confirm.ask({ title: 'Supprimer l’avis', message: 'Cet avis ne sera plus visible.', confirmText: 'Supprimer' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ok => {
        if (!ok) return;
        this.reviewsApi.deleteReview(review.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => { this.reviews.update(rows => rows.filter(item => item.id !== review.id)); this.notify.success('Avis supprimé'); },
          error: error => { const message = httpErrorMessage(error, 'Suppression impossible'); if (message) this.notify.error(message); }
        });
      });
  }
}
