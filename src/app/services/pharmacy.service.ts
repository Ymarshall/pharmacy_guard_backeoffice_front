import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pharmacy, PharmacyCreateRequest } from '../models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pharmacy[]> {
    return this.http.get<Pharmacy[]>(`${this.apiUrl}/pharmacies`, { headers: this.headers });
  }

  getById(id: number): Observable<Pharmacy> {
    return this.http.get<Pharmacy>(`${this.apiUrl}/pharmacies/${id}`, { headers: this.headers });
  }

  create(pharmacy: PharmacyCreateRequest): Observable<Pharmacy> {
    return this.http.post<Pharmacy>(`${this.apiUrl}/pharmacies`, pharmacy, { headers: this.headers });
  }

  update(id: number, pharmacy: PharmacyCreateRequest): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/pharmacies/${id}`, pharmacy, { headers: this.headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pharmacies/${id}`, { headers: this.headers });
  }
}

