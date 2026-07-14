# 06 — Glossaire — pharmacy_guard

| Terme | Définition |
|-------|------------|
| **Back-office / BO** | Application Angular d’administration Pharmacy Guard. |
| **Feature-first** | Organisation du code par domaine métier plutôt que par couche technique. |
| **Standalone component** | Composant Angular autonome déclarant ses imports, sans NgModule. |
| **Wizard période** | Parcours en 5 étapes pour préparer et activer une DutyPeriod. |
| **Période de garde** | Voir DutyPeriod (backend) — fenêtre publiable des gardes. |
| **Duty / Garde** | Affectation pharmacie ↔ période, gérable (enable/disable) dans le BO. |
| **DutyFile** | Fichier importé (PDF, image, Excel) traité par le backend. |
| **Guard Angular** | Fonction `CanActivateFn` contrôlant l’accès aux routes (`authGuard`, `loginGuard`). |
| **currentUser** | Clé `localStorage` stockant l’utilisateur BO connecté. |
| **Snackbar** | Notification toast Material pour succès / erreurs. |
| **Dashboard** | Écran de KPIs et alertes opérationnelles. |
| **Rapports** | Visualisations SVG (pie, line, bar, area) basées sur `/api/reports`. |
| **Client mobile** | Utilisateur de l’app Flutter, administrable (activate/deactivate) depuis le BO. |
| **Zone** | Découpage géographique utilisé pour filtrer/vérifier les gardes. |
| **Proxy Angular** | Redirection dev `/api` → backend ; actuellement sous-utilisée. |
