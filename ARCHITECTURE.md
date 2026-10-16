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

- Version PHP active et versions disponibles dans le contrat IONOS. La capture ne les montre pas. Cible souhaitée : PHP 8.4 ou supérieure maintenue, sous réserve de disponibilité et de compatibilité.
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
