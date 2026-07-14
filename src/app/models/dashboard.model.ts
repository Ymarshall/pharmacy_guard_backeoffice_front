export interface OverviewStats {
  totalPharmacies: number;
  totalPeriods: number;
  totalDuties: number;
  totalClients: number;
  totalUsers: number;
  totalZones: number;
}

export interface CurrentDutyPeriodInfo {
  periodId?: number;
  startDate?: string;
  endDate?: string;
  pharmaciesInDuty?: number;
  zonesCovered?: number;
  filesUploaded?: number;
  filesProcessed?: number;
  daysRemaining?: number;
}

export interface PharmacyStats {
  activePharmacies: number;
  inactivePharmacies: number;
  pharmaciesByZone: { [key: string]: number };
  topZones: Array<{ zone: string; count: number }>;
  pharmaciesCreatedThisMonth: number;
}

export interface FileProcessingStats {
  totalFiles: number;
  pendingFiles: number;
  processingFiles: number;
  completedFiles: number;
  failedFiles: number;
  successRate: number;
  totalPharmaciesExtracted: number;
}

export interface RecentPeriod {
  id: number;
  startDate: string;
  endDate: string;
  dutiesCount: number;
}

export interface RecentFile {
  id: number;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  uploadedAt: string;
}

export interface RecentPharmacy {
  id: number;
  name: string;
  zone: string;
  createdAt: string;
}

export interface RecentActivity {
  recentPeriods: RecentPeriod[];
  recentFiles: RecentFile[];
  recentPharmacies: RecentPharmacy[];
}

export type AlertType = 'FILE_ERROR' | 'PROCESSING_STUCK' | 'NO_ACTIVE_PERIOD' | 'PERIOD_EXPIRING' | 'PENDING_FILES';
export type AlertLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Alert {
  type: AlertType;
  level: AlertLevel;
  message: string;
  count?: number;
}

export interface DashboardStats {
  overview: OverviewStats;
  currentPeriod: CurrentDutyPeriodInfo | null;
  pharmacyStats: PharmacyStats;
  fileStats: FileProcessingStats;
  recentActivity: RecentActivity;
  alerts: Alert[];
}

