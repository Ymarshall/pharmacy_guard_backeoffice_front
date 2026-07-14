import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '../layout/header/header.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { ReportService } from '../services/report.service';
import { PieChartData, LineChartData, BarChartData, AreaChartData } from '../models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  isLoading = {
    pie: false,
    line: false,
    bar: false,
    area: false
  };

  pieChartData: PieChartData | null = null;
  lineChartData: LineChartData | null = null;
  barChartData: BarChartData | null = null;
  areaChartData: AreaChartData | null = null;

  lineDateForm: FormGroup;
  areaDateForm: FormGroup;

  constructor(
    private reportService: ReportService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Formulaire pour les dates du graphique ligne
    this.lineDateForm = this.fb.group({
      startDate: [this.getDefaultStartDate()],
      endDate: [this.getDefaultEndDate()]
    });

    // Formulaire pour les dates du graphique area
    this.areaDateForm = this.fb.group({
      startDate: [this.getDefaultStartDate()],
      endDate: [this.getDefaultEndDate()]
    });
  }

  ngOnInit(): void {
    this.loadAllCharts();
  }

  getDefaultStartDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }

  getDefaultEndDate(): Date {
    return new Date();
  }

  loadAllCharts(): void {
    this.loadPieChart();
    this.loadBarChart();
    this.loadLineChart();
    this.loadAreaChart();
  }

  loadPieChart(): void {
    this.isLoading.pie = true;
    this.reportService.getPharmacyStatusPie().subscribe({
      next: (data) => {
        this.pieChartData = data;
        this.isLoading.pie = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du graphique camembert:', error);
        this.snackBar.open('Erreur lors du chargement du graphique de répartition', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading.pie = false;
      }
    });
  }

  loadLineChart(): void {
    this.isLoading.line = true;
    const startDate = this.formatDateForApi(this.lineDateForm.value.startDate);
    const endDate = this.formatDateForApi(this.lineDateForm.value.endDate);
    
    this.reportService.getPharmacyCreationTrendLine(startDate, endDate).subscribe({
      next: (data) => {
        this.lineChartData = data;
        this.isLoading.line = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du graphique ligne:', error);
        this.snackBar.open('Erreur lors du chargement du graphique de tendance', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading.line = false;
      }
    });
  }

  loadBarChart(): void {
    this.isLoading.bar = true;
    this.reportService.getTopZonesBar().subscribe({
      next: (data) => {
        this.barChartData = data;
        this.isLoading.bar = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du graphique barres:', error);
        this.snackBar.open('Erreur lors du chargement du graphique des zones', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading.bar = false;
      }
    });
  }

  loadAreaChart(): void {
    this.isLoading.area = true;
    const startDate = this.formatDateForApi(this.areaDateForm.value.startDate);
    const endDate = this.formatDateForApi(this.areaDateForm.value.endDate);
    
    this.reportService.getCumulativeTrendArea(startDate, endDate).subscribe({
      next: (data) => {
        this.areaChartData = data;
        this.isLoading.area = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du graphique zone:', error);
        this.snackBar.open('Erreur lors du chargement du graphique cumulatif', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading.area = false;
      }
    });
  }

  refreshChart(chartType: 'pie' | 'line' | 'bar' | 'area'): void {
    switch (chartType) {
      case 'pie':
        this.loadPieChart();
        break;
      case 'line':
        this.loadLineChart();
        break;
      case 'bar':
        this.loadBarChart();
        break;
      case 'area':
        this.loadAreaChart();
        break;
    }
  }

  formatDateForApi(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Méthodes pour le graphique camembert
  getPieChartPercentage(index: number): number {
    if (!this.pieChartData || !this.pieChartData.values || this.pieChartData.values.length <= index) return 0;
    const total = this.pieChartData.total || this.pieChartData.values.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return (this.pieChartData.values[index] / total) * 100;
  }

  getPieChartColor(index: number): string {
    if (this.pieChartData && this.pieChartData.colors && this.pieChartData.colors[index]) {
      return this.pieChartData.colors[index];
    }
    return index === 0 ? '#10B981' : '#EF4444'; // Actif: Vert, Inactif: Rouge
  }

  getPieChartDashArray(index: number): string {
    const circumference = 2 * Math.PI * 80;
    const percentage = this.getPieChartPercentage(index);
    const dashLength = (percentage / 100) * circumference;
    return `${dashLength} ${circumference}`;
  }

  getPieChartDashOffset(index: number): number {
    if (index === 0) return 0;
    const circumference = 2 * Math.PI * 80;
    const previousPercentage = this.getPieChartPercentage(0);
    const offset = (previousPercentage / 100) * circumference;
    return -offset;
  }

  // Méthodes pour le graphique ligne
  getLineChartMaxValue(): number {
    if (!this.lineChartData || !this.lineChartData.values || this.lineChartData.values.length === 0) return 10;
    return Math.max(...this.lineChartData.values, 1);
  }

  getLineChartY(value: number): number {
    const max = this.getLineChartMaxValue();
    const height = 200;
    return height - (value / max) * height;
  }

  // Méthodes pour le graphique barres
  getBarChartMaxValue(): number {
    if (!this.barChartData || !this.barChartData.values || this.barChartData.values.length === 0) return 10;
    return Math.max(...this.barChartData.values, 1);
  }

  getBarChartHeight(value: number): number {
    const max = this.getBarChartMaxValue();
    const maxHeight = 200;
    return (value / max) * maxHeight;
  }

  // Méthodes pour le graphique zone
  getAreaChartMaxValue(): number {
    if (!this.areaChartData || !this.areaChartData.series || this.areaChartData.series.length === 0) return 10;
    let max = 0;
    this.areaChartData.series.forEach(series => {
      series.data.forEach(value => {
        if (value > max) max = value;
      });
    });
    return max > 0 ? max : 10;
  }

  getAreaChartY(value: number): number {
    const max = this.getAreaChartMaxValue();
    const height = 200;
    return height - (value / max) * height;
  }

  exportChart(chartType: string): void {
    // TODO: Implémenter l'export CSV/PDF
    this.snackBar.open(`Export ${chartType} - Fonctionnalité à venir`, 'Fermer', {
      duration: 3000
    });
  }

  hasInactiveWarning(): boolean {
    if (!this.pieChartData || !this.pieChartData.values || this.pieChartData.values.length < 2) return false;
    const total = this.pieChartData.total || this.pieChartData.values.reduce((a, b) => a + b, 0);
    if (total === 0) return false;
    const inactivePercentage = (this.pieChartData.values[1] / total) * 100;
    return inactivePercentage > 20;
  }

  // Méthodes pour le graphique ligne
  getLineChartX(index: number): number {
    if (!this.lineChartData || !this.lineChartData.labels || this.lineChartData.labels.length === 0) return 0;
    const total = this.lineChartData.labels.length - 1;
    if (total === 0) return 300;
    return (index / total) * 600;
  }

  getLineChartPoints(): string {
    if (!this.lineChartData || !this.lineChartData.values || this.lineChartData.values.length === 0) return '';
    return this.lineChartData.values.map((value, index) => {
      const x = this.getLineChartX(index);
      const y = this.getLineChartY(value);
      return `${x},${y}`;
    }).join(' ');
  }

  // Méthodes pour le graphique zone
  getAreaChartX(index: number): number {
    if (!this.areaChartData || !this.areaChartData.labels || this.areaChartData.labels.length === 0) return 0;
    const total = this.areaChartData.labels.length - 1;
    if (total === 0) return 300;
    return (index / total) * 600;
  }

  getAreaChartLinePoints(seriesIndex: number): string {
    if (!this.areaChartData || !this.areaChartData.series || this.areaChartData.series.length <= seriesIndex) return '';
    const series = this.areaChartData.series[seriesIndex];
    return series.data.map((value, index) => {
      const x = this.getAreaChartX(index);
      const y = this.getAreaChartY(value);
      return `${x},${y}`;
    }).join(' ');
  }

  getAreaChartPath(seriesIndex: number): string {
    if (!this.areaChartData || !this.areaChartData.series || this.areaChartData.series.length <= seriesIndex) return '';
    const series = this.areaChartData.series[seriesIndex];
    if (series.data.length === 0) return '';
    
    const points: string[] = [];
    
    // Point de départ (bas gauche)
    points.push(`M ${this.getAreaChartX(0)} 200`);
    
    // Points de la ligne
    series.data.forEach((value, index) => {
      const x = this.getAreaChartX(index);
      const y = this.getAreaChartY(value);
      points.push(`L ${x} ${y}`);
    });
    
    // Point de fin (bas droit)
    const lastIndex = series.data.length - 1;
    points.push(`L ${this.getAreaChartX(lastIndex)} 200`);
    
    // Fermer le chemin
    points.push('Z');
    
    return points.join(' ');
  }
}
