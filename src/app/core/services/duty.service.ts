import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { PageQuery, PageResult } from '../api/page-query';
import { Duty, DutyCreateRequest, DutyProcessRequest } from '../models/duty.model';

@Injectable({ providedIn: 'root' })
export class DutyService {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

  getAll(query?: PageQuery): Observable<Duty[]> {
    return this.api.get<Duty[]>('/duty-files', query);
  }

  list(page = 0, size = 10): Observable<PageResult<Duty>> {
    return this.api.get<PageResult<Duty>>('/duty-files', { page, size });
  }

  getById(id: number): Observable<Duty> {
    return this.api.get<Duty>(`/duty-files/${id}`);
  }

  getByPeriodId(dutyPeriodId: number): Observable<Duty[]> {
    return this.api.get<Duty[]>(`/duty-files/period/${dutyPeriodId}`);
  }

  getDutiesByPeriod(dutyPeriodId: number): Observable<Duty[]> {
    return this.api.get<Duty[]>(`/duties/period/${dutyPeriodId}`);
  }

  create(duty: DutyCreateRequest): Observable<Duty> {
    return this.http.post<Duty>(this.api.url('/duty-files/upload'), toForm(duty));
  }

  uploadMultiple(files: File[], dutyPeriodId?: number): Observable<Duty[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (dutyPeriodId) {
      formData.append('dutyPeriodId', String(dutyPeriodId));
    }
    return this.http.post<Duty[] | Duty>(this.api.url('/duty-files/upload'), formData).pipe(
      map(body => Array.isArray(body) ? body : [body])
    );
  }

  uploadMultipleWithProgress(files: File[], dutyPeriodId?: number): Observable<{ progress: number } | { files: Duty[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (dutyPeriodId) {
      formData.append('dutyPeriodId', String(dutyPeriodId));
    }
    return this.http.post<Duty[] | Duty>(this.api.url('/duty-files/upload'), formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          return { progress: event.total ? Math.round((100 * event.loaded) / event.total) : 0 };
        }
        if (event.type === HttpEventType.Response) {
          const body = event.body;
          return { files: Array.isArray(body) ? body : body ? [body] : [] };
        }
        return null;
      }),
      filter((event): event is { progress: number } | { files: Duty[] } => event !== null)
    );
  }

  update(id: number, duty: DutyCreateRequest): Observable<Duty> {
    return this.http.put<Duty>(this.api.url(`/duties/${id}`), toForm(duty));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/duty-files/${id}`);
  }

  process(id: number, processRequest: DutyProcessRequest): Observable<Duty> {
    return this.api.post<Duty>(`/duty-files/${id}/process`, processRequest);
  }

  uploadExcel(file: File, dutyPeriodId: number): Observable<Duty> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dutyPeriodId', String(dutyPeriodId));
    return this.http.post<Duty>(this.api.url('/duty-files/upload-excel'), formData);
  }

  disableDuty(dutyId: number): Observable<void> {
    return this.api.put<void>(`/duties/${dutyId}/disable`, {});
  }

  enableDuty(dutyId: number): Observable<void> {
    return this.api.put<void>(`/duties/${dutyId}/enable`, {});
  }

  /**
   * Rattachement corrigé d'une garde. Contrat préparé, absent de l'API actuelle :
   * PUT /api/duties/{id}/pharmacy { pharmacyId: number }
   */
  reassignPharmacy(dutyId: number, pharmacyId: number): Observable<Duty> {
    return this.api.put<Duty>(`/duties/${dutyId}/pharmacy`, { pharmacyId });
  }
}

function toForm(duty: DutyCreateRequest): FormData {
  const formData = new FormData();
  if (duty.file) {
    formData.append('file', duty.file);
  }
  if (duty.name) {
    formData.append('name', duty.name);
  }
  if (duty.description) {
    formData.append('description', duty.description);
  }
  if (duty.dutyPeriodId) {
    formData.append('dutyPeriodId', String(duty.dutyPeriodId));
  }
  return formData;
}
