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

## Déploiement

Transférer uniquement le contenu de dist/ dans la racine publique voulue. Les URL relatives fonctionnent sous /maestro/ ou à la racine. Aucun fallback SPA ni réécriture supplémentaire requis ; conserver index.html, menu.html et contact.html. Ne pas publier src/, .build/, node_modules/, les documents ou le .htaccess historique. Sur le VPS, créer une nouvelle release et basculer current après contrôle, en gardant l'ancienne pour retour arrière. Sur IONOS, transférer dist/ par SFTP et vérifier les trois pages.

Les noms des images et du CSS incluent une empreinte : les mises à jour ne dépendent pas de la purge du cache navigateur. Ne pas mettre les HTML en cache immutable.

## Poids mesuré

Rapport détaillé créé dans .build/report.json. Images sources utilisées : 20,15 Mo ; images publiées, variantes comprises : 5,01 Mo (−75 %). CSS gzip : environ 2,5 Ko. HTML gzip : environ 2,6 Ko accueil, 4,1 Ko carte, 1,4 Ko contact. JavaScript public : 0 octet. Ces chiffres ne comptent pas les polices Google Fonts et ne sont pas une mesure Lighthouse ni une promesse de débit.

## Limites actuelles

La vitrine est statique ; modifier pizzas.json demande un rebuild. Administration, API PHP et persistance MySQL restent à réaliser. L'intégration future devra conserver la publication dynamique demandée sans rebuild manuel, en ajoutant React côté navigateur uniquement là où nécessaire. La compatibilité de cette livraison statique est vérifiée sur le VPS ; aucun déploiement IONOS n'a été réalisé.
