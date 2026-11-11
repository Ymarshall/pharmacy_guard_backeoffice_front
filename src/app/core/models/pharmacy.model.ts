export interface Assurance {
  id: number;
  name: string;
  description?: string;
}

export interface AssuranceCreateRequest {
  name: string;
  description?: string;
}

export interface Pharmacy {
  id?: number;
  name: string;
  pharmacistName?: string;
  phone1: string;
  phone2?: string;
  email: string;
  horaires: string;
  city: string;
  commune: string;
  district: string;
  description?: string;
  photo?: string;
  statut: 'ACTIF' | 'INACTIF';
  /** Null si l'officine n'a pas de coordonnées GPS. */
  location: string | null;
  assuranceIds?: number[]; // Pour l'envoi (create/update)
  assurances?: Assurance[]; // Pour la réception (get)
  averageRating?: number;
  totalReviews?: number;
}

export interface PharmacyCreateRequest {
  name: string;
  pharmacistName?: string;
  phone1: string;
  phone2?: string;
  email: string;
  horaires: string;
  city: string;
  commune: string;
  district: string;
  description?: string;
  photo?: string;
  statut: 'ACTIF' | 'INACTIF';
  location: string;
  assuranceIds: number[];
}

