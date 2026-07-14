// Modèle pour l'authentification
export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
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
