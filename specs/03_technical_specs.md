# 03 — Spécifications techniques

## Architecture

Application **Angular 18 standalone** organisée par features. Décision structurante : [ADR-001](../docs/adr/ADR-001-angular-standalone-feature-first.md).

```
src/app/
  layout/          # header, sidebar
  login/
  dashboard|pharmacies|assurances|...   # features
  models/          # interfaces TS
  services/        # 12 services HTTP root
  app.routes.ts / app.config.ts
```

## Stack

| Élément | Version / choix |
|---------|-----------------|
| Angular | ^18.2.0 |
| Material / CDK | ^18.2.14 |
| RxJS | ~7.8.0 |
| TypeScript | ~5.5.2 |
| Zone.js | ~0.14.10 |
| Tests | Karma + Jasmine |
| State global | Aucun (pas NgRx) |
| Cartes / charts libs | Aucune (SVG maison pour rapports) |

## Patterns

- Composants `standalone: true` + imports explicites Material/Router.
- Formulaires réactifs (`ReactiveFormsModule`) pour CRUD et wizard.
- Guards fonctionnels `CanActivateFn`.
- Dialogs `MatDialog` (avis, vérifications).
- Pas d’interceptors HTTP opérationnels malgré `withInterceptorsFromDi()`.

## Auth & config

| Sujet | Implémentation |
|-------|----------------|
| Login | `POST /api/auth/login` |
| Stockage | `localStorage.currentUser` |
| Token | Non |
| API URL | Hardcodée `http://localhost:8080/api` dans chaque service |
| Proxy | `proxy.conf.json` → `:8080` (sous-utilisé car URLs absolues) |
| Environments | Absents (`environment.ts`) |

## Services HTTP

`AuthService`, `PharmacyService`, `AssuranceService`, `EmergencyNumberService`, `ZoneService`, `DutyPeriodService`, `DutyService`, `ClientService`, `UserService`, `DashboardService`, `ReportService`, `ReviewService`.

## Build & run

```bash
ng serve          # dev
ng build          # prod (budgets 500kB warn / 1MB error)
```

Thème : Material `indigo-pink` + variables CSS couleurs CI dans `styles.css`.
