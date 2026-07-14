# ADR-001: Architecture Angular standalone feature-first sans state management global

**État** : Accepté

## Contexte

Le back-office Pharmacy Guard doit couvrir un large spectre CRUD (pharmacies, zones, assurances, clients, users, urgences) plus un **wizard opérationnel** riche autour des périodes de garde (upload, traitement, vérification, activation).

Les objectifs d’équipe étaient :

- livrer rapidement une UI administrative Alignée Angular moderne ;
- limiter la complexité de boilderplate NgModule ;
- garder un mapping clair 1:1 avec les domaines de l’API Spring Boot ;
- éviter une couche de state global tant que les écrans restent des formulaires / listes pilotés par HTTP.

Les alternatives évaluées implicitement : NgModules legacy, NgRx/Akita pour un store centralisé, architecture core/shared/features stricte.

## Décision

Nous retenons **Angular 18** avec :

1. **100 % composants `standalone`** — bootstrap via `bootstrapApplication`, aucun `NgModule` applicatif.
2. **Organisation feature-first** — un dossier domaine par capacité (`pharmacies/`, `duty-periods/`, `dashboard/`, …) avec composants, templates et styles colocalisés.
3. **Services HTTP `@Injectable({ providedIn: 'root' })`** dans `services/`, un service par ressource API, sans store global (pas de NgRx).
4. **RxJS impératif** côté composants (subscribe local) plutôt que patterns réactifs avancés (`async` pipe généralisé, facades).
5. **UI Material** + guards fonctionnels (`authGuard`, `loginGuard`) et session BO stockée en `localStorage` (`currentUser`).

Cette décision est visible dans `src/main.ts`, `app.config.ts`, `app.routes.ts` et la structure `src/app/*`.

## Conséquences

### Avantages

- **Onboarding simplifié** : chaque feature est localisable sans graphe de modules.
- **Alignement API** : la surface services reflète fidèlement le backend.
- **Stack moderne** : Angular 18 / builder `application`, Material 18 — pérennité framework.
- **Pas de sur-ingénierie** : absence de store global adaptée à un BO majoritairement CRUD + wizard.

### Points d’attention / risques

- **Duplication de la couche HTTP** : `apiUrl = http://localhost:8080/api` répété dans ~12 services ; le proxy Angular est configuré mais contournné — frein multi-environnements.
- **Auth fragile** : présence d’un user en `localStorage` sans Bearer/JWT ni interceptor ; non alignée avec une sécurisation future du backend.
- **Composants volumineux** : le détail période de garde (~900 LOC) concentre trop de responsabilités (candidat découpage).
- **Layout répété** : header/sidebar importés par page plutôt qu’un shell route parent — dette de maintenance UI.
- **Évolution concurrente** : si le BO gagne du temps réel ou des écrans fortement synchronisés, l’absence de state management devra être revisitée (nouvel ADR).
