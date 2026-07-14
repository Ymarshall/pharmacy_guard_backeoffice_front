import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DutyPeriod, DutyPeriodCreateRequest } from '../models/duty-period.model';

@Injectable({
  providedIn: 'root'
})
export class DutyPeriodService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<DutyPeriod[]> {
    return this.http.get<DutyPeriod[]>(`${this.apiUrl}/duty-periods`, { headers: this.headers });
  }

  getById(id: number): Observable<DutyPeriod> {
    return this.http.get<DutyPeriod>(`${this.apiUrl}/duty-periods/${id}`, { headers: this.headers });
  }

  getCurrent(): Observable<DutyPeriod> {
    return this.http.get<DutyPeriod>(`${this.apiUrl}/duty-periods/current`, { headers: this.headers });
  }

  getAllCurrent(): Observable<DutyPeriod[]> {
    return this.http.get<DutyPeriod[]>(`${this.apiUrl}/duty-periods/current/all`, { headers: this.headers });
  }

  create(period: DutyPeriodCreateRequest): Observable<DutyPeriod> {
    return this.http.post<DutyPeriod>(`${this.apiUrl}/duty-periods`, period, { headers: this.headers });
  }

  update(id: number, period: DutyPeriodCreateRequest): Observable<DutyPeriod> {
    return this.http.put<DutyPeriod>(`${this.apiUrl}/duty-periods/${id}`, period, { headers: this.headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/duty-periods/${id}`, { headers: this.headers });
  }

  activate(id: number): Observable<DutyPeriod> {
    // POST /api/duty-periods/{id}/activate - Activation d'une période de garde
    // L'API n'exige pas de body, on envoie null
    return this.http.post<DutyPeriod>(`${this.apiUrl}/duty-periods/${id}/activate`, null, { headers: this.headers });
  }

  clear(id: number): Observable<void> {
    // Supprimer toutes les duties associées puis supprimer la période
    // Pour l'instant, on utilise delete de la période (à adapter selon l'API)
    return this.http.delete<void>(`${this.apiUrl}/duty-periods/${id}`, { headers: this.headers });
  }
}

