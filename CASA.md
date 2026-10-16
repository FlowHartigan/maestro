# La Casa di Maestro — 17 octobre 2026

Le bouton commun aux pages permet de passer de Pizza Maestro (Clermont-Ferrand) à `casa.html`, restaurant italien La Casa di Maestro à Beaumont. Chamalières est retiré des pages publiques. Coordonnées fournies par le propriétaire : 09 84 67 49 49, 1 rue Barbier d’Aubrée, 63110 Beaumont.

L’ambiance Casa utilise une feuille CSS dédiée, crème, olive et rouge, et un en-tête de lasagnes. La photo du menu fournie est affichée dessous avec une transcription accessible. Le menu reste une ressource du site : pour le renouveler, remplacer `images/casa/menu-du-jour.png` et sa transcription dans `src/pages/Casa.jsx`, puis reconstruire. Il n’y a pas de téléversement de menu dans l’administration.

## Horaires partagés

Administration → Horaires → choisir Pizza Maestro ou La Casa di Maestro. Les sauvegardes concernent tous les visiteurs, avec authentification, CSRF et contrôle de version serveur. Chaque établissement possède sa propre version. Les sept jours sont modifiables, sans ligne de jour férié. Annuler conserve les valeurs enregistrées ; Horaires d’origine nécessite confirmation puis enregistrement.

Valeurs Casa issues de la capture fournie : lundi à jeudi 11h30–14h ; vendredi 11h30–14h et 18h30–22h ; samedi et dimanche fermés. Définitions dans `server/casa-hours-defaults.json`, valeurs Pizza dans `server/hours-defaults.json`. Stockage MySQL `opening_hours`, id 1 Pizza, id 2 Casa. Les anciens enregistrements de huit jours sont lus en conservant les sept jours, sans réécriture automatique.

## Installation et vérification

Commandes habituelles : `pnpm typecheck`, `pnpm build`, `pnpm test`. Le backend PHP/MySQL reste nécessaire pour les horaires partagés. Sur une base existante disposant de la migration 001, appliquer `server/migrations/002-casa-hours.sql` avant de publier le code. Cette migration ajoute uniquement la ligne Casa si elle manque. Pour Nginx, ajouter la route PHP exacte `/maestro/casa.html` selon `deploy/nginx-maestro-location.conf`.

Vérifications : typecheck, construction et sept tests de build ; tests API dans une base jetable PHP 8.4/MySQL 5.7 (sauvegarde, validation, persistance, conflits et indépendance des deux établissements) ; test PHP de compatibilité des anciens horaires ; affichage mobile et ordinateur, navigation entre les ambiances, menu accessible et absence d’erreurs console.

## Provenance des images

`images/casa/menu-source.png` est la capture fournie par le propriétaire (non publiée). `menu-du-jour.png` en est une retouche par l’outil imagegen intégré : supprimer uniquement les pastilles sociales en bas, reconstruire le décor, conserver les mots, prix, mise en page, logo et cadrage. La transcription et les tarifs ont été vérifiés visuellement.

`hero-lasagnes.png` est une illustration photographique générée, pas une photographie du restaurant. Prompt : photographie naturelle horizontale 16:9 de lasagnes bolognaises sur assiette ivoire, basilic, vapeur discrète, fourchette et lin sur table en noyer rustique ; lumière ambrée, vert olive et mur crème flou ; plat à droite et espace à gauche pour le titre HTML ; sans personne, texte, logo ni filigrane. Ambiance inspirée de la référence fournie.

Les sources PNG sont conservées dans ce dossier ; la construction produit des WebP responsives, avec qualité accrue pour la lisibilité du menu.


## Configuration par établissement — 17 octobre 2026

L’administration commence par le choix de l’établissement. Pizza Maestro propose Pizzas et Horaires ; La Casa propose Menu du jour et Horaires. Les horaires restent indépendants (id 1 Pizza, id 2 Casa). Le même compte administrateur gère les deux établissements ; il ne s’agit pas de comptes ou de droits distincts.

Pour Casa : choisir une image JPG, PNG ou WebP, contrôler l’aperçu, puis Publier le menu. La publication est partagée entre tous les visiteurs et ne nécessite pas de reconstruction du site. Les modifications non enregistrées sont signalées et protégées au changement de rubrique ou d’établissement. Annuler conserve la publication ; Menu d’origine demande confirmation et restaure l’image initiale. En cas de conflit, recharger avant de réessayer.

Limites : 6 Mo, 24 mégapixels ; vérification et décodage côté serveur, réencodage WebP (bord maximal 2400 px, qualité 92 pour la lisibilité), nom aléatoire dans les uploads persistants. Table `daily_menu` : image nullable, version ; NULL utilise `default-menu.json` issu du build. Les anciennes images restent conservées pour les sauvegardes. Session, CSRF et contrôle de version protègent l’enregistrement. Aucun secret côté navigateur.

Appliquer la migration additive et réexécutable `server/migrations/003-daily-menu.sql` avant le code ; elle ne modifie ni les pizzas ni les horaires. La page Casa injecte l’image depuis MySQL. Lors d’un remplacement, la transcription du menu initial est retirée afin de ne pas afficher des plats obsolètes ; elle revient avec Menu d’origine. Le nouveau menu image n’a pas de transcription automatique.

Vérifications : typecheck, build, sept tests de build ; tests API isolés de validation (dont fichier trop lourd et faux PNG), authentification, CSRF, téléversement, persistance après reconnexion, conflits, restauration, publication Casa et non-modification des pizzas/horaires. Parcours de choix d’établissement et de publication vérifié dans le navigateur, dont mobile 390 px.
