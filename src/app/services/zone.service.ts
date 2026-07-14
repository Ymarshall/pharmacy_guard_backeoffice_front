import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone, ZoneCreateRequest } from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zones`, { headers: this.headers });
  }

  getById(id: number): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/zones/${id}`, { headers: this.headers });
  }

  getByType(type: string): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zones/type/${type}`, { headers: this.headers });
  }

  getByRegion(region: string): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zones/region/${region}`, { headers: this.headers });
  }

  getActive(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zones/active`, { headers: this.headers });
  }

  create(zone: ZoneCreateRequest): Observable<Zone> {
    return this.http.post<Zone>(`${this.apiUrl}/zones`, zone, { headers: this.headers });
  }

  update(id: number, zone: ZoneCreateRequest): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/zones/${id}`, zone, { headers: this.headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/zones/${id}`, { headers: this.headers });
  }
}

