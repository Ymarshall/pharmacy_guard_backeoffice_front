import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Duty, DutyCreateRequest, DutyProcessRequest } from '../models/duty.model';

@Injectable({
  providedIn: 'root'
})
export class DutyService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    // Ne pas définir Content-Type pour permettre au navigateur de définir le boundary pour multipart/form-data
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<Duty[]> {
    return this.http.get<Duty[]>(`${this.apiUrl}/duty-files`, { headers: this.headers });
  }

  getById(id: number): Observable<Duty> {
    return this.http.get<Duty>(`${this.apiUrl}/duty-files/${id}`, { headers: this.headers });
  }

  getByPeriodId(dutyPeriodId: number): Observable<Duty[]> {
    return this.http.get<Duty[]>(`${this.apiUrl}/duty-files/period/${dutyPeriodId}`, { headers: this.headers });
  }

  getDutiesByPeriod(dutyPeriodId: number): Observable<Duty[]> {
    return this.http.get<Duty[]>(`${this.apiUrl}/duties/period/${dutyPeriodId}`, { headers: this.headers });
  }

  create(duty: DutyCreateRequest): Observable<Duty> {
    const formData = new FormData();
    
    // Le fichier est obligatoire pour la création
    if (duty.file) {
      formData.append('file', duty.file);
    }
    
    // Les autres champs sont optionnels
    if (duty.name) {
      formData.append('name', duty.name);
    }
    if (duty.description) {
      formData.append('description', duty.description);
    }
    
    // dutyPeriodId est requis si fourni
    if (duty.dutyPeriodId) {
      formData.append('dutyPeriodId', duty.dutyPeriodId.toString());
    }

    return this.http.post<Duty>(`${this.apiUrl}/duty-files/upload`, formData);
  }

  uploadMultiple(files: File[], dutyPeriodId?: number): Observable<Duty[]> {
    const formData = new FormData();
    
    // Ajouter tous les fichiers dans le champ "files"
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // dutyPeriodId est requis si fourni
    if (dutyPeriodId) {
      formData.append('dutyPeriodId', dutyPeriodId.toString());
    }

    return this.http.post<Duty[]>(`${this.apiUrl}/duty-files/upload`, formData);
  }

  update(id: number, duty: DutyCreateRequest): Observable<Duty> {
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

    return this.http.put<Duty>(`${this.apiUrl}/duties/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/duty-files/${id}`, { headers: this.headers });
  }

  process(id: number, processRequest: DutyProcessRequest): Observable<Duty> {
    const jsonHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Duty>(`${this.apiUrl}/duty-files/${id}/process`, processRequest, { headers: jsonHeaders });
  }

  uploadExcel(file: File, dutyPeriodId: number): Observable<Duty> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dutyPeriodId', dutyPeriodId.toString());

    return this.http.post<Duty>(`${this.apiUrl}/duty-files/upload-excel`, formData);
  }

  disableDuty(dutyId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/duties/${dutyId}/disable`, {}, { headers: this.headers });
  }

  enableDuty(dutyId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/duties/${dutyId}/enable`, {}, { headers: this.headers });
  }
}

