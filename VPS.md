# VPS de test Maestro

État vérifié le 16 octobre 2026. Ce document décrit les services installés ; le site Maestro n'est pas encore déployé.

## Accès

- Hôte : `vps-328a8329.vps.ovh.ca`.
- Utilisateur SSH : `ubuntu`.
- Clé locale fonctionnelle : `C:\Users\flori\.ssh\festi-app-vps` ; ne jamais copier son contenu dans le dépôt.
- Utiliser cette clé explicitement avec `ssh -i` ; l'agent SSH local n'était pas disponible pendant la vérification.

## Configuration constatée

- Ubuntu 26.04 LTS.
- Nginx déjà présent et actif.
- Application mariage existante : service `festi-app`, écoute sur `127.0.0.1:3001`, site Nginx `festi-app`, domaine `dms-app.fr`.
- Ne pas remplacer sa configuration ni utiliser ses répertoires ou données pour Maestro.

## Installation réalisée

Paquets installés depuis les dépôts Ubuntu : `php-fpm`, `php-cli`, `php-mysql`, `php-mbstring`, `php-xml`, `php-curl`, `php-gd`, `php-zip`, `mysql-server`, `unzip`.

- PHP installé : 8.5.4 ; service `php8.5-fpm` actif et activé au démarrage.
- Socket FPM : `/run/php/php8.5-fpm.sock`.
- MySQL installé : 8.4.11 ; service `mysql` actif et activé au démarrage.
- MySQL écoute sur `127.0.0.1:3306`, protocole X sur `127.0.0.1:33060` ; aucun accès réseau distant configuré.
- Base dédiée : `maestro_test`, encodage `utf8mb4`, collation `utf8mb4_unicode_ci`.
- Compte applicatif : `maestro_app@localhost`, droits SELECT, INSERT, UPDATE et DELETE uniquement sur `maestro_test`.
- Mot de passe aléatoire conservé uniquement dans `/etc/maestro/database.json`, fichier root `0600`, dossier `0700`. Ne pas afficher son contenu ni le versionner.
- Les migrations devront être exécutées séparément avec des droits adaptés. Le compte applicatif ne peut pas créer les tables.
- La configuration root-only n'est pas encore accessible à un processus applicatif : prévoir un utilisateur/pool PHP Maestro et une configuration lisible uniquement par cet utilisateur lors du déploiement.

## Contrôles réalisés

- `nginx -t` et `php-fpm8.5 -t` : réussis.
- Exécution FastCGI sur le socket FPM : réponse PHP 8.5.4 et extension `pdo_mysql` disponible. Le fichier temporaire de test a été supprimé.
- Connexion PHP PDO avec le compte applicatif à `maestro_test` : réussie.
- Services Nginx, PHP-FPM, MySQL et `festi-app` : actifs.
- API existante `/api/health` : `status=ok`.
- Site mariage via Nginx en HTTPS local, avec vérification du certificat : HTTP 200.
- Aucun site Maestro ni règle Nginx Maestro ajouté ; aucun rechargement Nginx nécessaire.

## Portabilité et suite

Respecter `ARCHITECTURE.md` : PHP 8.5 et MySQL 8.4 du VPS ne changent pas la cible MySQL 5.7 d'IONOS. La version PHP IONOS reste à confirmer. La compatibilité avec IONOS n'a pas encore été testée.

Avant publication : choisir le domaine de test, prévoir sa configuration DNS/HTTPS et sa protection d'accès, préparer le pool PHP et les répertoires dédiés, déployer la branche `v2`, appliquer les migrations, puis vérifier les parcours du site.
