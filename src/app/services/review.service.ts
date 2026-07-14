import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getPharmacyReviews(pharmacyId: number, page: number = 0, size: number = 10): Observable<Review[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Review[]>(
      `${this.apiUrl}/client/pharmacies/${pharmacyId}/reviews`,
      { headers: this.headers, params }
    );
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/client/pharmacies/admin/reviews/${reviewId}`,
      { headers: this.headers }
    );
  }
}
