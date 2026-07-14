export enum ZoneType {
  VILLE = 'VILLE',
  COMMUNE = 'COMMUNE',
  DEPARTEMENT = 'DEPARTEMENT',
  REGION = 'REGION'
}

export interface Zone {
  id?: number;
  name: string;
  type: ZoneType;
  region: string;
  departement: string;
  isActive: boolean;
}

export interface ZoneCreateRequest {
  name: string;
  type: ZoneType;
  region: string;
  departement: string;
  isActive: boolean;
}

