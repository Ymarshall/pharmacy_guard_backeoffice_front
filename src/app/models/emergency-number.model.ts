export enum EmergencyCategory {
  medical = 'medical',
  fire = 'fire',
  police = 'police',
  bloodBank = 'bloodBank',
  other = 'other'
}

export interface EmergencyNumber {
  id?: number;
  name: string;
  number: string;
  icon?: string;
  description?: string;
  color?: string;
  category?: EmergencyCategory;
}

export interface EmergencyNumberCreateRequest {
  name: string;
  number: string;
  icon?: string;
  description?: string;
  color?: string;
  category?: EmergencyCategory;
}

