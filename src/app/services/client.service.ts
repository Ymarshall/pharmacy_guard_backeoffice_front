import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientUpdateRequest, ClientStatusRequest } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`, { headers: this.headers });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`, { headers: this.headers });
  }

  update(id: number, client: ClientUpdateRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/clients/${id}`, client, { headers: this.headers });
  }

  updateStatus(id: number, status: ClientStatusRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/clients/${id}/status`, status, { headers: this.headers });
  }

  activate(id: number): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients/${id}/activate`, null, { headers: this.headers });
  }

  deactivate(id: number): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients/${id}/deactivate`, null, { headers: this.headers });
  }
}

