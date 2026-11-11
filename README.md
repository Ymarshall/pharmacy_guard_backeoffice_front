# Pharmacie de garde — back-office

Back-office Angular 18 pour publier et piloter les pharmacies de garde en Côte d’Ivoire.

## Lancer en local

Le front appelle l’API via le chemin relatif `/api` (`environment.ts`). En développement, le proxy Angular redirige ce chemin vers `http://localhost:8080`.

```bash
npm install
ng serve
```

Application : http://localhost:4200

Pour des captures ou une démo sans le backend Spring, un serveur hors build est disponible :

```bash
node tools/demo-api/server.mjs
```

Il n’est pas compilé dans `ng build`.

## Build et tests

```bash
ng build
ng test --watch=false
```

Le bundle initial de production reste sous le budget (avertissement 500 kB, erreur 1 MB).
