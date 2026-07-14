# Assets UI/UX — pharmacy_guard (Back-office)

## Identité visuelle (implémentée)

- Langue : français.
- Thème Material `indigo-pink` + accents drapeau ivoirien (`--cote-ivoire-orange`, `--cote-ivoire-green`).
- Layout : header + sidebar sur chaque page authentifiée.
- Composants récurrents : listes Material, forms réactifs, dialogs, snackbars, wizard stepper périodes de garde.

## Écrans clés à mockuper / lier

| Écran | Priorité | Statut design |
|-------|----------|---------------|
| Login | Haute | Implémenté — lien Figma _à renseigner_ |
| Dashboard | Haute | Implémenté |
| Wizard période de garde (5 steps) | Critique | Implémenté |
| Liste / fiche pharmacie + avis | Haute | Implémenté |
| Rapports (charts SVG) | Moyenne | Implémenté |
| Paramètres | Basse | Placeholder UI |

## Wireframes / Figma

- **Lien Figma BO** : _à renseigner_
- Déposer ici les exports PNG/PDF des wireframes (`login.png`, `duty-period-wizard.png`, …).

## Guidelines UX

1. Une action primaire claire par étape du wizard.
2. Feedback immédiat sur upload / process (statuts PENDING → COMPLETED / FAILED).
3. Confirmation avant enable/disable de gardes et activation de période.
4. Pas de carte interactive dans le BO actuel (coords en champs texte).
