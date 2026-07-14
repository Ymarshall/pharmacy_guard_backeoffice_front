# 01 — Exigences métier (Business Requirements)

## Vision

Offrir aux opérateurs et administrateurs un **back-office web** pour publier, vérifier et piloter les pharmacies de garde en Côte d’Ivoire, en s’appuyant sur l’API `pharmaciegarde`.

## Problématique

Sans outil d’administration dédié :

- l’ingestion des listes officielles reste manuelle et opaque ;
- l’activation d’une période de garde manque de contrôles ;
- le pilotage (volumes, erreurs fichiers, alertes) est impossible.

## Objectifs

| ID | Objectif | Critère de succès |
|----|----------|-------------------|
| O1 | CRUD complet des référentiels | Pharmacies, assurances, zones, urgences, users, clients |
| O2 | Orchestrer le cycle de vie d’une période de garde | Wizard 5 étapes jusqu’à activation |
| O3 | Traiter les fichiers sources | Upload PDF/JPEG/Excel + lancement process |
| O4 | Donner de la visibilité | Dashboard KPIs + rapports graphiques |
| O5 | Modérer le contenu utilisateur | Consultation / suppression d’avis |
| O6 | Contrôler l’accès BO | Login email/password + guards de routes |

## Périmètre

**Inclus** : UI Angular Material, routes authentifiées, appels REST vers `:8080`.

**Exclu** : cartes interactives, i18n multi-langue, paramètres persistés backend, export rapports avancé (placeholders présents).

## Parties prenantes

| Acteur | Besoin principal |
|--------|------------------|
| Opérateur | Publier une période de garde sans erreur |
| Administrateur | Gérer comptes et référentiels |
| Produit | Suivre KPIs opérationnels |

## Contraintes

- Angular 18 + Material.
- Langue UI : français ; timezone métier `Africa/Abidjan`.
- Dépendance forte au contrat API backend.
