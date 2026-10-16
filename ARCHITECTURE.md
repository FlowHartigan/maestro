# Architecture de Pizza Maestro

Décisions validées le 16 octobre 2026. Ce document décrit la cible à construire, pas des fonctionnalités déjà implémentées.

## Objectif et contraintes

Moderniser le site et fournir une administration pour gérer les pizzas, les actualités et les informations des établissements sans modifier le code.

- Hébergement mutualisé IONOS existant.
- MySQL 5.7 Standard : schéma, requêtes et migrations compatibles avec cette version.
- Déploiement par SFTP des fichiers compilés et PHP, avec installation ou migration SQL.
- Aucun serveur Node.js permanent requis en production.
- Préserver les contenus métier et les URL existantes, ou prévoir leurs redirections.

## Architecture validée

| Partie | Solution |
| --- | --- |
| Site public | Pages générées en PHP, HTML/CSS, composants React pour les interactions utiles. |
| Administration `/admin` | React + TypeScript. |
| Compilation frontend | Vite, en local ou dans une chaîne de compilation avant déploiement. |
| Backend | PHP avec une API pour les opérations de l'administration et les interactions qui en ont besoin. |
| Données partagées | MySQL 5.7. |
| Images | Fichiers sur l'hébergement ; références et métadonnées en base. |

Le contenu principal des pages publiques doit être présent dans le HTML envoyé par PHP pour le référencement et un affichage rapide. Le site public ne devient pas une application entièrement rendue dans le navigateur.

Vite produit les fichiers JavaScript et CSS à transférer chez IONOS. Node.js sert au développement et à la compilation, sans service Node.js sur le mutualisé.

## Deux environnements : VPS de test et mutualisé IONOS

Décision validée le 16 octobre 2026 : publier d’abord sur le VPS du propriétaire pour tester, tout en conservant la compatibilité avec le mutualisé IONOS. Les caractéristiques et accès du VPS restent à fournir ; aucun déploiement n’est encore réalisé.

- Conserver une seule base de code et les mêmes fichiers applicatifs compilés pour les deux environnements. Seules la configuration locale et la configuration du serveur web diffèrent.
- Garder les contraintes IONOS comme socle de portabilité : PHP, MySQL 5.7 et ressources React compilées ; aucun service Node.js permanent, Docker, Redis ou processus de fond obligatoire pour faire fonctionner le site.
- Fixer la version minimale de PHP et les extensions requises après vérification des deux hébergements. Une version plus récente sur le VPS ne doit pas introduire de dépendance incompatible avec IONOS.
- Le SQL reste compatible MySQL 5.7 même si le VPS utilise une version MySQL plus récente ou MariaDB. Un succès sur MariaDB ou MySQL récent ne prouve pas la compatibilité MySQL 5.7 : prévoir un contrôle sur la version cible avant livraison IONOS.
- Isoler la configuration de chaque environnement : URL du site, connexion à la base, chemins des médias, sessions, mode debug et journaux. Aucune adresse VPS, URL de production ou chemin absolu d’hébergement ne doit être codé dans les composants.
- Prévoir une configuration PHP locale non versionnée, hors de la racine publique, utilisable sans dépendre de variables système configurables uniquement avec des droits administrateur. Fournir un exemple sans secrets lors de l’implémentation.
- Séparer les bases, comptes administrateurs, secrets et médias de test et de production. Ne pas utiliser la base IONOS pour les tests sur le VPS.
- Conserver le même domaine d’origine pour les pages, l’administration et l’API au sein de chaque environnement, afin de simplifier les sessions et éviter une dépendance CORS inutile.
- Ne pas imposer un serveur web spécifique au code applicatif. Si le VPS utilise Nginx, documenter les règles équivalentes aux règles Apache/`.htaccess` de l’hébergement cible.
- Examiner le `.htaccess` existant avant le premier déploiement : il redirige actuellement vers `pizzamaestro.com`. L’environnement de test doit rester sur son propre domaine, et le domaine de production conserver ses redirections prévues.
- Protéger l’accès au site de test et demander sa non-indexation, sans confondre cette dernière avec une protection d’accès.
- Prévoir sauvegarde et retour à la version précédente avant les mises à jour du site et de la base. Documenter les fichiers et migrations utilisés pour chaque publication.

### Vérification de portabilité

Avant de déclarer la compatibilité, vérifier sur chaque cible : pages et ressources, routes, API, connexion et déconnexion, autorisations, sauvegarde d’une pizza et d’une actualité, affichage public après publication, upload d’image et persistance après rechargement.

L’état « fonctionne sur les deux » ne peut être annoncé qu’après les vérifications réalisées sur les deux environnements. D’ici là, distinguer la compatibilité prévue des résultats effectivement observés.

## Publication des contenus

1. L'administrateur se connecte à l'interface React.
2. Il ajoute ou modifie une pizza ou une actualité.
3. PHP vérifie la session, les autorisations et les données.
4. PHP enregistre les contenus dans MySQL et les images sur l'hébergement.
5. Le site public lit les contenus publiés depuis la base.

L'ajout d'une pizza ou d'une actualité ne nécessite aucune recompilation de React ni nouvel envoi du code. Un éventuel cache doit respecter ce fonctionnement.

## Périmètre retenu

- Refonte des pages publiques, utilisables sur mobile et ordinateur.
- Administration des pizzas et des actualités.
- Gestion des informations des établissements.
- Authentification et autorisations vérifiées côté serveur.

## Détails proposés, à préciser

Ces éléments sont des propositions de conception, pas un cahier des charges détaillé validé.

- Pages : accueil, carte, actualités et établissements.
- Pizzas : nom, ingrédients, catégorie, photo facultative, tarifs, visibilité et ordre d'affichage ; duplication possible.
- Actualités : titre, résumé, texte, image facultative, brouillon, prévisualisation et publication ; expiration des offres à envisager.
- Établissements : horaires, coordonnées et fermetures exceptionnelles.
- Administration sobre, formulaires lisibles, erreurs explicites et confirmation de sauvegarde.

## Règles d'implémentation

- Stocker les contenus et réglages partagés côté serveur ; `localStorage` ne remplace pas MySQL.
- Conserver les secrets côté serveur, hors des ressources publiques et du dépôt Git.
- Protéger les actions PHP par la session, les autorisations et une protection CSRF adaptée à l'authentification.
- Hacher les mots de passe, utiliser des requêtes SQL préparées et encoder les contenus selon leur contexte d'affichage.
- Valider le type et la taille des images envoyées et empêcher l'exécution de scripts dans le dossier des médias.
- Séparer les pages publiques, l'administration, l'accès aux données et la configuration serveur.
- Documenter l'installation, les migrations et le déploiement.

## Points ouverts

- Version PHP active et versions disponibles dans le contrat IONOS. La capture ne les montre pas. Version demandée : PHP 8.4. Vérifier sa disponibilité dans le contrat IONOS.
- Extensions PHP et possibilités de configuration du mutualisé.
- Carte et tarifs identiques ou différents entre Clermont-Ferrand et Chamalières.
- Canal de commande : téléphone, plateforme externe ou prise de commande sur le site. Aucun panier ni paiement en ligne n'a été validé.
- Champs détaillés, tailles de pizzas et droits des comptes administrateurs.
- Direction graphique finale : rouge tomate, blanc, vert profond et photos généreuses restent une piste proposée.
- Bibliothèques PHP éventuelles, structure des dossiers et automatisation du déploiement : pas encore choisies.

## Références consultées

- React : https://react.dev/learn/add-react-to-an-existing-project
- Vite : https://vite.dev/guide/static-deploy.html
- PHP chez IONOS : https://www.ionos.fr/assistance/hebergement/gerer-la-version-php-dans-le-espace-client/afficher-ou-changer-la-version-de-php/
- Versions PHP maintenues : https://www.php.net/supported-versions.php

## Mise à jour

Lorsqu'une décision change, noter la date, le nouveau choix et sa raison. Distinguer les décisions validées, les propositions et les contraintes vérifiées.

## Versions du projet

Décision du 16 octobre 2026 : le site initial est conservé dans la branche `v1` et identifié par le tag `v1.0.0`. La branche `v2` contient les documents de conception et accueillera la refonte React/PHP/MySQL, les adaptations de déploiement et toutes les évolutions suivantes. Les développements et intégrations ciblent `v2` ; `v1` reste une référence figée.


## Installation du VPS — 16 octobre 2026

Installation initiale : PHP-FPM 8.5.4 et MySQL 8.4.11. Ces versions ont ensuite été remplacées pour Maestro par PHP 8.4 et MySQL 5.7 à la demande du propriétaire ; les anciens services sont arrêtés. Voir `VPS.md` pour les détails et les opérations restantes. Maestro ne dispose pas encore de site Nginx ni de déploiement applicatif. La cible IONOS reste inchangée.


## Versions exactes de test — décision du 16 octobre 2026

Le propriétaire impose PHP 8.4 et MySQL 5.7 sur le VPS. Environnement actif : PHP 8.4.26 et MySQL 5.7.44 en conteneurs dédiés, car ces deux branches ne sont pas proposées par les dépôts standards du VPS Ubuntu 26.04. Les services natifs PHP 8.5 et MySQL 8.4 précédemment installés sont arrêtés et désactivés.

Docker est autorisé pour fournir cet environnement de test ; il ne doit pas devenir une dépendance du code ni une exigence pour le mutualisé IONOS. La même application doit fonctionner directement sur PHP 8.4/MySQL 5.7 chez IONOS. Voir `VPS.md` pour les accès, ports, volumes, contrôles et limites actuelles.


## Adresse de test — décision du 16 octobre 2026

La prévisualisation est publiée sous `https://dms-app.fr/maestro/`. L'application mariage reste à la racine et conserve son API `/api/`. Les prochaines évolutions doivent gérer ce préfixe pour les liens, ressources, routes React, API et cookies tout en conservant une base d'URL configurable pour IONOS. Voir `VPS.md` et `deploy/README.md` pour l'état réel du déploiement.


## Direction graphique — 16 octobre 2026

Le propriétaire choisit le template Pizzeria #78480 de TemplateMonster et demande de récupérer les fichiers publics de sa démo. Adaptation sur v2 des pages accueil, carte et contact, avec les contenus Maestro et les URL existantes. Voir TEMPLATE.md pour la provenance, la palette et le périmètre. Ce choix remplace la piste graphique proposée auparavant et ne change pas la cible PHP/React/MySQL.

## Front entièrement React et poids minimal — 16 octobre 2026

Nouvelle demande du propriétaire : réécrire tout le front en React, aussi léger que possible. Les trois pages publiques sont désormais des composants React JSX compilés avec Vite puis rendus en HTML au build par React DOM. Cette mise en œuvre remplace les anciennes pages HTML écrites à la main ; aucun JavaScript React n'est envoyé au navigateur tant que les pages n'ont pas d'interaction applicative. Navigation par vrais liens et URL historiques conservées.

Les images sont transformées en WebP et redimensionnées au build ; les pizzas ont deux variantes et un srcset. CSS minifié, noms de ressources avec empreinte de contenu, chargement différé des photos sous la ligne de flottaison. Seul dist/ est publié, sans Node permanent. Les originaux restent dans images/ pour les futurs builds.

La cible backend PHP 8.4/MySQL 5.7 et l'administration React restent maintenues mais non implémentées. Le front livré ici est statique : les données viennent de src/pizzas.json et une modification nécessite actuellement un build. Lors de l'ajout de l'administration, la publication des contenus depuis PHP/MySQL devra rendre ces données disponibles sans rebuild manuel (API avec composants React interactifs, ou génération de pages déclenchée côté serveur). Ce raccordement reste à concevoir et vérifier sur les deux hébergements ; ne pas présenter la gestion dynamique comme déjà réalisée.

Les polices Google Fonts existantes restent externes. Les mesures locales de poids excluent ces réponses tierces. Voir README.md pour les commandes et les chiffres de build.


## Administration des pizzas — 16 octobre 2026

Route validée : /maestro/administration/. Administration React + TypeScript compilée avec Vite, chargée uniquement à cette adresse. Ajout et modification : nom, ingrédients, tarifs 26/33/40 cm, photo et état publié/brouillon. Pas de suppression définitive : masquer une recette conserve ses données.

API PHP 8.4, PDO et MySQL 5.7. Sessions serveur, mots de passe hachés, protection CSRF, limite de tentatives de connexion, contrôle de version contre les écrasements simultanés. Premier compte créé avec un code privé à usage unique. Photos validées puis réencodées WebP et stockées dans un dossier persistant.

Les composants React produisent aussi des gabarits privés au build. PHP y insère les données MySQL échappées à chaque consultation : les pizzas changent sans rebuild, toujours sans JavaScript public. Cette décision remplace la limite statique précédente. src/pizzas.json devient uniquement la source d'import initial ; ne pas écraser la base lors d'un déploiement.

Livraison : dist/ vers public/, .build/server/ vers server/ hors racine publique, configuration privée par environnement. Nginx sur VPS et réécriture Apache .htaccess sur IONOS conservent les URL .html. Aucun Node permanent ni Docker obligatoire côté application. Voir ADMINISTRATION.md pour les prérequis ; IONOS reste à tester réellement.
