export enum ProviderType {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  APPLE = 'APPLE'
}

export interface Client {
  id?: number;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  providerType?: ProviderType;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ClientUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
}

export interface ClientStatusRequest {
  isActive: boolean;
}

