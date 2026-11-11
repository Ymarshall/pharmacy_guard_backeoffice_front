import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { PageQuery, PageResult } from '../api/page-query';
import { Assurance, AssuranceCreateRequest, Pharmacy, PharmacyCreateRequest } from '../models/pharmacy.model';

export interface PharmacySearchHit {
  id: number;
  name: string;
  city?: string | null;
  commune?: string | null;
  district?: string | null;
  phone?: string | null;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

  getAll(query?: PageQuery): Observable<Pharmacy[]> {
    return this.api.get<Pharmacy[]>('/pharmacies', query);
  }

  list(page = 0, size = 10, search?: string, sort?: string): Observable<PageResult<Pharmacy>> {
    return this.api.get<PageResult<Pharmacy>>('/pharmacies', { page, size, search, sort });
  }

  search(q: string, limit = 20): Observable<PageResult<PharmacySearchHit>> {
    const params = new HttpParams().set('page', '0').set('limit', String(Math.min(limit, 50))).set('q', q);
    return this.http.get<PageResult<PharmacySearchHit>>(this.api.url('/pharmacies/search'), { params });
  }

  getById(id: number): Observable<Pharmacy> {
    return this.api.get<Pharmacy>(`/pharmacies/${id}`);
  }

  create(pharmacy: PharmacyCreateRequest): Observable<Pharmacy> {
    return this.api.post<Pharmacy>('/pharmacies', { ...pharmacy, name: pharmacy.name.toUpperCase() });
  }

  update(id: number, pharmacy: PharmacyCreateRequest): Observable<Pharmacy> {
    return this.api.put<Pharmacy>(`/pharmacies/${id}`, { ...pharmacy, name: pharmacy.name.toUpperCase() });
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/pharmacies/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class AssuranceService {
  private readonly api = inject(ApiClient);

  getAll(query?: PageQuery): Observable<Assurance[]> {
    return this.api.get<Assurance[]>('/assurances', query);
  }

  list(page = 0, size = 10): Observable<PageResult<Assurance>> {
    return this.api.get<PageResult<Assurance>>('/assurances', { page, size });
  }

  getById(id: number): Observable<Assurance> {
    return this.api.get<Assurance>(`/assurances/${id}`);
  }

  create(assurance: AssuranceCreateRequest): Observable<Assurance> {
    return this.api.post<Assurance>('/assurances', assurance);
  }

  update(id: number, assurance: AssuranceCreateRequest): Observable<Assurance> {
    return this.api.put<Assurance>(`/assurances/${id}`, assurance);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/assurances/${id}`);
  }
}
