import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmergencyNumber, EmergencyNumberCreateRequest } from '../models/emergency-number.model';

@Injectable({
  providedIn: 'root'
})
export class EmergencyNumberService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmergencyNumber[]> {
    return this.http.get<EmergencyNumber[]>(`${this.apiUrl}/emergency-numbers`, { headers: this.headers });
  }

  getById(id: number): Observable<EmergencyNumber> {
    return this.http.get<EmergencyNumber>(`${this.apiUrl}/emergency-numbers/${id}`, { headers: this.headers });
  }

  create(emergencyNumber: EmergencyNumberCreateRequest): Observable<EmergencyNumber> {
    return this.http.post<EmergencyNumber>(`${this.apiUrl}/emergency-numbers`, emergencyNumber, { headers: this.headers });
  }

  update(id: number, emergencyNumber: EmergencyNumberCreateRequest): Observable<EmergencyNumber> {
    return this.http.put<EmergencyNumber>(`${this.apiUrl}/emergency-numbers/${id}`, emergencyNumber, { headers: this.headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/emergency-numbers/${id}`, { headers: this.headers });
  }
}

