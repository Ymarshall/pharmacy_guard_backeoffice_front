import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageQuery, toHttpParams } from './page-query';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  readonly root = environment.apiUrl.replace(/\/$/, '');

  url(path: string): string {
    return `${this.root}${path.startsWith('/') ? path : `/${path}`}`;
  }

  get<T>(path: string, query?: PageQuery): Observable<T> {
    const params = environment.serverPagination ? toHttpParams(query) : new HttpParams();
    return this.http.get<T>(this.url(path), { params });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }
}
