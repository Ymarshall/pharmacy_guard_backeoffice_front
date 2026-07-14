import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PieChartData, LineChartData, BarChartData, AreaChartData } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getPharmacyStatusPie(): Observable<PieChartData> {
    return this.http.get<PieChartData>(`${this.apiUrl}/reports/chart/pharmacy-status-pie`, { headers: this.headers });
  }

  getPharmacyCreationTrendLine(startDate?: string, endDate?: string): Observable<LineChartData> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<LineChartData>(`${this.apiUrl}/reports/chart/pharmacy-creation-trend-line`, { headers: this.headers, params });
  }

  getTopZonesBar(): Observable<BarChartData> {
    return this.http.get<BarChartData>(`${this.apiUrl}/reports/chart/top-zones-bar`, { headers: this.headers });
  }

  getCumulativeTrendArea(startDate?: string, endDate?: string): Observable<AreaChartData> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<AreaChartData>(`${this.apiUrl}/reports/chart/cumulative-trend-area`, { headers: this.headers, params });
  }
}

