export interface Duty {
  id?: number;
  name?: string;
  description?: string;
  file?: string;
  fileName?: string;
  status?: 'PENDING' | 'PROCESSED' | 'FAILED' | 'ACTIVE' | 'TO_VERIFY' | 'DISABLE' | 'DISABLED';
  processedDate?: string | null;
  zone?: string;
  zoneName?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Champs pour les duties traitées (processées)
  pharmacyId?: number;
  pharmacyName?: string;
  pharmacyZone?: string;
  pharmacyCommune?: string;
  pharmacyDistrict?: string | null;
  dutyPeriodId?: number;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  dutyFileId?: number;
  dutyFileName?: string;
}

export interface DutyProcessRequest {
  startDate: string;
  endDate: string;
}

export interface DutyCreateRequest {
  name?: string;
  description?: string;
  file?: File;
  dutyPeriodId?: number;
}

