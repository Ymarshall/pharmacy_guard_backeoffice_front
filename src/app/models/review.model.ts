export interface Review {
  id: number;
  pharmacyId: number;
  pharmacyName?: string;
  clientId: number;
  clientName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}
