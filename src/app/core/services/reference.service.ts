import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { PageQuery, PageResult } from '../api/page-query';
import { EmergencyNumber, EmergencyNumberCreateRequest } from '../models/emergency-number.model';
import { Zone, ZoneCreateRequest } from '../models/zone.model';
import { Client, ClientStatusRequest, ClientUpdateRequest } from '../models/client.model';
import { User, UserCreateRequest, UserUpdateRequest } from '../models/user.model';
import { DutyPeriod, DutyPeriodCreateRequest } from '../models/duty-period.model';
import { DashboardStats } from '../models/dashboard.model';
import { AreaChartData, BarChartData, LineChartData, PieChartData } from '../models/report.model';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class EmergencyNumberService {
  private readonly api = inject(ApiClient);
  getAll(query?: PageQuery): Observable<EmergencyNumber[]> { return this.api.get('/emergency-numbers', query); }
  list(page = 0, size = 10): Observable<PageResult<EmergencyNumber>> { return this.api.get('/emergency-numbers', { page, size }); }
  getById(id: number): Observable<EmergencyNumber> { return this.api.get(`/emergency-numbers/${id}`); }
  create(body: EmergencyNumberCreateRequest): Observable<EmergencyNumber> { return this.api.post('/emergency-numbers', body); }
  update(id: number, body: EmergencyNumberCreateRequest): Observable<EmergencyNumber> { return this.api.put(`/emergency-numbers/${id}`, body); }
  delete(id: number): Observable<void> { return this.api.delete(`/emergency-numbers/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ZoneService {
  private readonly api = inject(ApiClient);
  getAll(query?: PageQuery): Observable<Zone[]> { return this.api.get('/zones', query); }
  list(page = 0, size = 10): Observable<PageResult<Zone>> { return this.api.get('/zones', { page, size }); }
  getById(id: number): Observable<Zone> { return this.api.get(`/zones/${id}`); }
  getByType(type: string): Observable<Zone[]> { return this.api.get(`/zones/type/${encodeURIComponent(type)}`); }
  getByRegion(region: string): Observable<Zone[]> { return this.api.get(`/zones/region/${encodeURIComponent(region)}`); }
  getActive(): Observable<Zone[]> { return this.api.get('/zones/active'); }
  create(body: ZoneCreateRequest): Observable<Zone> { return this.api.post('/zones', body); }
  update(id: number, body: ZoneCreateRequest): Observable<Zone> { return this.api.put(`/zones/${id}`, body); }
  delete(id: number): Observable<void> { return this.api.delete(`/zones/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly api = inject(ApiClient);
  getAll(query?: PageQuery): Observable<Client[]> { return this.api.get('/clients', query); }
  list(page = 0, size = 10): Observable<PageResult<Client>> { return this.api.get('/clients', { page, size }); }
  getById(id: number): Observable<Client> { return this.api.get(`/clients/${id}`); }
  update(id: number, body: ClientUpdateRequest): Observable<Client> { return this.api.put(`/clients/${id}`, body); }
  updateStatus(id: number, status: ClientStatusRequest): Observable<Client> { return this.api.put(`/clients/${id}/status`, status); }
  activate(id: number): Observable<Client> { return this.api.post(`/clients/${id}/activate`, null); }
  deactivate(id: number): Observable<Client> { return this.api.post(`/clients/${id}/deactivate`, null); }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiClient);
  getAll(query?: PageQuery): Observable<User[]> { return this.api.get('/users', query); }
  list(page = 0, size = 10): Observable<PageResult<User>> { return this.api.get('/users', { page, size }); }
  getById(id: number): Observable<User> { return this.api.get(`/users/${id}`); }
  create(body: UserCreateRequest): Observable<User> { return this.api.post('/users', body); }
  update(id: number, body: UserUpdateRequest): Observable<User> { return this.api.put(`/users/${id}`, body); }
  delete(id: number): Observable<void> { return this.api.delete(`/users/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class DutyPeriodService {
  private readonly api = inject(ApiClient);
  getAll(query?: PageQuery): Observable<DutyPeriod[]> { return this.api.get('/duty-periods', query); }
  list(page = 0, size = 10): Observable<PageResult<DutyPeriod>> { return this.api.get('/duty-periods', { page, size }); }
  getById(id: number): Observable<DutyPeriod> { return this.api.get(`/duty-periods/${id}`); }
  getCurrent(): Observable<DutyPeriod> { return this.api.get('/duty-periods/current'); }
  getAllCurrent(): Observable<DutyPeriod[]> { return this.api.get('/duty-periods/current/all'); }
  create(body: DutyPeriodCreateRequest): Observable<DutyPeriod> { return this.api.post('/duty-periods', body); }
  update(id: number, body: DutyPeriodCreateRequest): Observable<DutyPeriod> { return this.api.put(`/duty-periods/${id}`, body); }
  delete(id: number): Observable<void> { return this.api.delete(`/duty-periods/${id}`); }
  activate(id: number): Observable<DutyPeriod> { return this.api.post(`/duty-periods/${id}/activate`, null); }
  clear(id: number): Observable<void> { return this.api.delete(`/duty-periods/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);
  getStats(): Observable<DashboardStats> { return this.api.get('/dashboard/stats'); }
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiClient);
  getPharmacyStatusPie(): Observable<PieChartData> { return this.api.get('/reports/chart/pharmacy-status-pie'); }
  getPharmacyCreationTrendLine(startDate?: string, endDate?: string): Observable<LineChartData> {
    return this.api.get(`/reports/chart/pharmacy-creation-trend-line${query({ startDate, endDate })}`);
  }
  getTopZonesBar(): Observable<BarChartData> { return this.api.get('/reports/chart/top-zones-bar'); }
  getCumulativeTrendArea(startDate?: string, endDate?: string): Observable<AreaChartData> {
    return this.api.get(`/reports/chart/cumulative-trend-area${query({ startDate, endDate })}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ApiClient);
  getPharmacyReviews(pharmacyId: number, page = 0, size = 10): Observable<Review[]> {
    return this.api.get(`/client/pharmacies/${pharmacyId}/reviews?page=${page}&size=${size}`);
  }
  deleteReview(reviewId: number): Observable<void> {
    return this.api.delete(`/client/pharmacies/admin/reviews/${reviewId}`);
  }
}

function query(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const text = params.toString();
  return text ? `?${text}` : '';
}
