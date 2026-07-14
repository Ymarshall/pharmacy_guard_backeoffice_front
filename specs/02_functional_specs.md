# 02 — Spécifications fonctionnelles

## Personas

- **Opérateur de garde** : cœur du wizard périodes.
- **Administrateur** : users, zones, pharmacies.
- **Lecteur stats** : dashboard / rapports.

## User stories

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| US-01 | Opérateur | Me connecter au BO | Accéder aux fonctions sensibles |
| US-02 | Opérateur | Créer une période de garde | Préparer le prochain cycle |
| US-03 | Opérateur | Uploader PDF/JPEG et Excel | Alimenter l’extraction |
| US-04 | Opérateur | Lancer le traitement des fichiers | Générer les gardes |
| US-05 | Opérateur | Vérifier les gardes par zone | Valider avant publication |
| US-06 | Opérateur | Activer la période | Diffuser vers le mobile |
| US-07 | Admin | CRUD pharmacies / assurances / zones / urgences | Maintenir le référentiel |
| US-08 | Admin | Activer/désactiver des clients mobiles | Contrôler l’accès app |
| US-09 | Admin | Gérer les utilisateurs BO | Déléguer l’administration |
| US-10 | Lecteur | Consulter le dashboard | Détecter alertes (fichiers en erreur, période expirante) |
| US-11 | Lecteur | Voir les rapports graphiques | Analyser la répartition / tendances |
| US-12 | Modérateur | Consulter/supprimer des avis | Garantir la qualité |

## Flux — Wizard période de garde (5 étapes)

```
1. Créer la période (dates)
2. Upload fichiers (PDF/JPEG + Excel)
3. Traiter / suivre le processing
4. Vérifier les Duty (filtres zone, enable/disable)
5. Activer la période (isCurrent)
```

## Navigation (routes)

| Route | Fonction | Guard |
|-------|----------|-------|
| `/login` | Authentification | loginGuard |
| `/dashboard` | KPIs | authGuard |
| `/pharmacies*` | CRUD pharmacies + avis | authGuard |
| `/assurances*` | CRUD assurances | authGuard |
| `/emergency-numbers*` | CRUD urgences | authGuard |
| `/duty-periods*` | Liste + wizard détail | authGuard |
| `/duties*` | Fichiers/gardes (hors menu) | authGuard |
| `/zones*` | CRUD zones | authGuard |
| `/clients` | Clients mobiles | authGuard |
| `/users*` | Users BO | authGuard |
| `/rapports` | Charts | authGuard |
| `/parametres` | Settings UI (non persisté) | authGuard |

## Règles UI

- Session : objet `User` dans `localStorage` clé `currentUser`.
- Logout : purge localStorage + redirect `/login`.
- Feedback erreurs : snackbars Material + logs console.
- Dates : locale `fr-FR`.
