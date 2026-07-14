import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assurance } from '../models/pharmacy.model';

export interface AssuranceCreateRequest {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssuranceService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<Assurance[]> {
    return this.http.get<Assurance[]>(`${this.apiUrl}/assurances`, { headers: this.headers });
  }

  getById(id: number): Observable<Assurance> {
    return this.http.get<Assurance>(`${this.apiUrl}/assurances/${id}`, { headers: this.headers });
  }

  create(assurance: AssuranceCreateRequest): Observable<Assurance> {
    return this.http.post<Assurance>(`${this.apiUrl}/assurances`, assurance, { headers: this.headers });
  }

  update(id: number, assurance: AssuranceCreateRequest): Observable<Assurance> {
    return this.http.put<Assurance>(`${this.apiUrl}/assurances/${id}`, assurance, { headers: this.headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assurances/${id}`, { headers: this.headers });
  }
}

