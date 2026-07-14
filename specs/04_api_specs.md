# 04 — Spécifications API (contrats consommés)

Le front-office est **consommateur** de l’API `pharmaciegarde`. Source de vérité runtime : `http://localhost:8080/api-docs`.

Base URL effective dans le code : `http://localhost:8080/api`.

## Mapping services → endpoints

| Service Angular | Endpoints principaux |
|-----------------|----------------------|
| `AuthService` | `POST /auth/login` |
| `PharmacyService` | CRUD `/pharmacies` |
| `AssuranceService` | CRUD `/assurances` |
| `EmergencyNumberService` | CRUD `/emergency-numbers` |
| `ZoneService` | CRUD `/zones` |
| `DutyPeriodService` | CRUD `/duty-periods`, `GET /current`, `PUT /{id}/activate` |
| `DutyService` | `/duty-files/*` (upload, process, excel), `/duties/*` |
| `ClientService` | `/clients`, activate/deactivate |
| `UserService` | CRUD `/users` |
| `DashboardService` | `GET /dashboard/stats` |
| `ReportService` | `GET /reports/chart/*` |
| `ReviewService` | `/client/pharmacies/{id}/reviews*` |

## Upload multipart

| Action | Content-Type | Endpoint |
|--------|--------------|----------|
| PDF/JPEG | `multipart/form-data` | `POST /duty-files/upload` |
| Excel | `multipart/form-data` | `POST /duty-files/upload-excel` |
| Process | JSON/empty | `POST /duty-files/{id}/process` |

## Auth côté client

- Aucun header `Authorization` n’est attaché.
- Les guards Angular n’impliquent pas de session serveur.
- En cas de hardening backend (JWT), un interceptor et un store de token seront nécessaires (nouvel ADR).

## Erreurs

Gestion locale dans les composants (`subscribe.error` → snackbar). Pas d’interceptor global 401 → logout.

## Proxy (référence)

```json
{ "/api": { "target": "http://localhost:8080", "secure": false } }
```

Recommandation doc : migrer les services vers des URLs relatives `/api` pour activer le proxy et les environments.
