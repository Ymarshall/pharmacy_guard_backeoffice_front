export type AppRole = 'ADMIN' | 'OPERATOR' | 'READER';

// Modèle pour l'authentification. Le rôle est optionnel : l'API actuelle ne le renvoie pas toujours.
export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  role?: AppRole | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Modèle pour le CRUD des utilisateurs
export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserUpdateRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
