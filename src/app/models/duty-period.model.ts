import { Duty } from './duty.model';

export interface DutyPeriod {
  id?: number;
  startDate: string;
  endDate: string;
  status?: 'DRAFT' | 'PROCESSING' | 'PROCESSED' | 'ACTIVE' | 'COMPLETED';
  createdAt?: string;
  updatedAt?: string;
  duties?: Duty[];
}

export interface DutyPeriodCreateRequest {
  startDate: string;
  endDate: string;
}

