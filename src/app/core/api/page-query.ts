import { HttpParams } from '@angular/common/http';

/** Requête de liste, prête à être envoyée quand la pagination serveur existera. */
export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
}

/** `sort=champ,asc` uniquement si la colonne est dans la liste blanche du backend. */
export function buildSort(query: PageQuery, fields: Record<string, string>): string | undefined {
  if (!query.sort || !fields[query.sort]) {
    return undefined;
  }
  return `${fields[query.sort]},${query.direction === 'desc' ? 'desc' : 'asc'}`;
}

export function toHttpParams(query?: PageQuery): HttpParams {
  let params = new HttpParams();
  if (!query) {
    return params;
  }
  (Object.keys(query) as (keyof PageQuery)[]).forEach(key => {
    const value = query[key];
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });
  return params;
}
