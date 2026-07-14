import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from '../layout/header/header.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats, Alert, AlertLevel } from '../models/dashboard.model';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  dashboardStats: DashboardStats | null = null;
  
  overviewStats: StatCard[] = [];

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.updateOverviewStats(stats);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  updateOverviewStats(stats: DashboardStats): void {
    this.overviewStats = [
      {
        title: 'Total Pharmacies',
        value: stats.overview.totalPharmacies || 0,
        icon: 'local_pharmacy',
        color: 'primary'
      },
      {
        title: 'Périodes de garde',
        value: stats.overview.totalPeriods || 0,
        icon: 'schedule',
        color: 'accent'
      },
      {
        title: 'Total Gardes',
        value: stats.overview.totalDuties || 0,
        icon: 'assignment',
        color: 'primary'
      },
      {
        title: 'Clients mobiles',
        value: stats.overview.totalClients || 0,
        icon: 'people',
        color: 'accent'
      },
      {
        title: 'Utilisateurs backoffice',
        value: stats.overview.totalUsers || 0,
        icon: 'admin_panel_settings',
        color: 'primary'
      },
      {
        title: 'Zones géographiques',
        value: stats.overview.totalZones || 0,
        icon: 'location_on',
        color: 'accent'
      }
    ];
  }

  getIconColor(color: string): string {
    return color === 'primary' 
      ? 'linear-gradient(135deg, var(--cote-ivoire-orange), var(--cote-ivoire-green))'
      : 'linear-gradient(135deg, var(--cote-ivoire-green), var(--cote-ivoire-orange))';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }

  getAlertIcon(level: AlertLevel): string {
    switch (level) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'notifications';
    }
  }

  getAlertColor(level: AlertLevel): string {
    switch (level) {
      case 'HIGH':
        return 'warn';
      case 'MEDIUM':
        return 'accent';
      case 'LOW':
        return 'primary';
      default:
        return '';
    }
  }

  getFileStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PROCESSING': 'En traitement',
      'PROCESSED': 'Traité',
      'FAILED': 'Échec'
    };
    return labels[status || ''] || status || 'Inconnu';
  }

  getFileStatusColor(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'PROCESSING':
        return 'accent';
      case 'PROCESSED':
        return 'primary';
      case 'FAILED':
        return 'warn';
      default:
        return '';
    }
  }

  calculateDaysRemaining(endDate?: string): number {
    if (!endDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  getBarPercentage(count: number, zones: Array<{ zone: string; count: number }>): number {
    if (!zones || zones.length === 0 || count === 0) return 0;
    const maxCount = Math.max(...zones.map(z => z.count));
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  }

  getPieChartColor(index: number): string {
    return index === 0 ? '#4CAF50' : '#FF9800';
  }

  getPieChartDashArray(count: number, total: number): string {
    if (total === 0) return '0 502.65'; // 2 * PI * 80
    const circumference = 2 * Math.PI * 80;
    const dashLength = (count / total) * circumference;
    return `${dashLength} ${circumference}`;
  }

  getPieChartDashOffset(previousCount: number, total: number): number {
    if (total === 0) return 0;
    const circumference = 2 * Math.PI * 80;
    const offset = (previousCount / total) * circumference;
    return -offset;
  }

  getTotalPharmacies(): number {
    if (!this.dashboardStats || !this.dashboardStats.pharmacyStats) return 0;
    return (this.dashboardStats.pharmacyStats.activePharmacies || 0) + (this.dashboardStats.pharmacyStats.inactivePharmacies || 0);
  }
}
