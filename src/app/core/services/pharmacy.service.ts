import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { PageQuery, PageResult } from '../api/page-query';
import { Assurance, AssuranceCreateRequest, Pharmacy, PharmacyCreateRequest } from '../models/pharmacy.model';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private readonly api = inject(ApiClient);

  getAll(query?: PageQuery): Observable<Pharmacy[]> {
    return this.api.get<Pharmacy[]>('/pharmacies', query);
  }

  list(page = 0, size = 10): Observable<PageResult<Pharmacy>> {
    return this.api.get<PageResult<Pharmacy>>('/pharmacies', { page, size });
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
