# Maestro — front React

Le front public est écrit en React JSX. Vite compile les composants, React DOM génère les trois pages au build. Aucun moteur React ni JavaScript applicatif n'est téléchargé par les visiteurs : les pages actuelles utilisent uniquement des liens natifs. Cela conserve le référencement, le fonctionnement sans JavaScript et la compatibilité mutualisé.

## Développement

Prérequis : Node >= 22.12 et pnpm 11.25 (ou Corepack).

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm preview
```

Ouvrir l'adresse indiquée par preview. Après modification d'un composant, relancer build puis rafraîchir. Aucun serveur Node nécessaire sur l'hébergement. Les scripts de postinstallation esbuild/sharp ne sont pas exécutés : leurs binaires précompilés sont fournis par les dépendances optionnelles ; ne pas installer avec --no-optional.

## Sources

- src/pages/ : accueil, carte et contact en React.
- src/components.jsx : navigation, footer, carte de pizza, adresses et bandeau Don Scata.
- src/pizzas.json : les 38 recettes et 114 tarifs conservés.
- src/styles.css : style existant préservé, sans Bootstrap/jQuery.
- images/ : images originales ; le build n'en publie que celles utilisées.
- scripts/build.mjs : optimisation WebP, variantes 480/800 px, empreintes de cache, rendu React et CSS minifié.
- scripts/build.test.mjs : contrôles des routes, ressources, titres, données et budgets.

## Administration et déploiement

Lire [ADMINISTRATION.md](ADMINISTRATION.md) pour les comptes, le stockage, les tests et le déploiement PHP/MySQL. L'administration React est servie sous /maestro/administration/. La vitrine reste sans JavaScript applicatif ; PHP remplit les gabarits issus de React avec les pizzas en base à chaque consultation, sans rebuild après modification.

Déployer dist/ dans public/ et .build/server/ dans server/ hors racine web. La configuration et les photos sont persistantes et privées ou contrôlées selon leur usage. Ne jamais publier le dépôt complet. src/pizzas.json sert uniquement à l'import initial des 38 recettes.

L'administration charge environ 73 Ko de JavaScript gzip, séparés du site public. Les images originales restent dans images/, les photos ajoutées sont optimisées en WebP côté PHP. Voir .build/report.json pour les mesures du build public.
