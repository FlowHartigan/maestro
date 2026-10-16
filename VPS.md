# VPS de test Maestro

État au 16 octobre 2026. Le site existant est publié en prévisualisation à https://dms-app.fr/maestro/.

## Accès et services existants

- Hôte : `vps-328a8329.vps.ovh.ca`, utilisateur SSH `ubuntu`.
- Clé locale : `C:\Users\flori\.ssh\festi-app-vps`, à utiliser explicitement avec `ssh -i`. Ne jamais versionner son contenu.
- Ubuntu 26.04 LTS et Nginx.
- Site mariage : service `festi-app`, API sur `127.0.0.1:3001`, domaine `dms-app.fr`. Préserver ses fichiers, données et configuration Nginx.

## Versions imposées pour Maestro

Le propriétaire a demandé PHP **8.4** et MySQL **5.7**. Les services natifs PHP 8.5 et MySQL 8.4 installés initialement ne constituent plus l'environnement actif de Maestro.

Ces versions sont exécutées dans des conteneurs sur le VPS Ubuntu 26.04. Docker est un outil de cet environnement de test ; le code doit rester déployable directement sur PHP/MySQL chez IONOS, sans dépendance applicative à Docker.

| Composant | Configuration active |
| --- | --- |
| PHP | 8.4.26, conteneur `maestro-php84`, image locale `maestro-php:8.4`. |
| PHP-FPM | Port du VPS `127.0.0.1:9084` vers le port 9000 du conteneur. |
| MySQL | 5.7.44, conteneur `maestro-mysql57`, image officielle `mysql:5.7.44`. |
| Réseau Docker | `maestro-test`, communication PHP/MySQL par le nom `maestro-mysql57`. |
| Stockage MySQL | Volume persistant `maestro-mysql57-data`. |
| Redémarrage | Docker activé au démarrage, conteneurs avec `unless-stopped`. |

MySQL ne publie aucun port sur le VPS ni sur Internet. Le port FastCGI reste limité à la boucle locale et sera utilisé par le futur site Nginx Maestro.

## Configuration et secrets

- Base : `maestro_test`, `utf8mb4`, collation `utf8mb4_unicode_ci`.
- Compte applicatif : `maestro_app`, droits SELECT, INSERT, UPDATE et DELETE sur cette seule base ; migrations à exécuter avec un compte adapté séparé.
- Configuration de connexion : `/etc/maestro/database.json`, root uniquement. Copie en lecture seule dans le conteneur PHP à `/run/secrets/maestro-database.json`.
- Secrets MySQL dans `/etc/maestro/runtime-secrets`, utilisés comme fichiers montés en lecture seule ; ne jamais afficher ni versionner leur contenu.
- La configuration PHP reste root-only : une configuration lisible par le futur processus applicatif doit être préparée au déploiement, sans élargir publiquement les permissions.
- Répertoire applicatif réservé : `/var/www/maestro`, monté en lecture seule dans PHP au même chemin. Prévoir un montage d'écriture dédié aux médias lors de l'implémentation.
- Dockerfile de PHP et script de préparation : `/opt/maestro-runtime`. Le script de préparation ne doit pas être relancé aveuglément : il refuse les conteneurs déjà existants.
- Image PHP de base épinglée : `php:8.4-fpm-bookworm@sha256:6bfef8e416977aa41f48e3e42a40c1e08050d24e4a938c6edb421400bff24601`.
- Image MySQL épinglée : `mysql:5.7.44@sha256:4bc6bc963e6d8443453676cae56536f4b8156d78bae03c0145cbe47c2aad73bb`.

## Vérifications de la bascule

- La base Maestro native ne contenait aucune table ; configuration et export sauvegardés dans `/etc/maestro/before-php84-mysql57`.
- PHP 8.4 : extensions `pdo_mysql`, `mbstring`, `gd`, `zip`, `intl`, OPcache, cURL et XML disponibles.
- Connexion PHP 8.4 vers MySQL 5.7.44 avec le compte applicatif et requête préparée : réussies.
- Exécution FastCGI sur `127.0.0.1:9084` : PHP 8.4.26 ; fichier temporaire supprimé après le contrôle.
- Anciens services natifs `php8.5-fpm` et `mysql` arrêtés et désactivés après les tests. Leurs paquets et les anciennes données restent présents pour retour arrière ; les commandes PHP/MySQL natives ne désignent pas les versions des conteneurs.
- Nginx : configuration validée ; site mariage HTTPS HTTP 200 et API saine après bascule.
- Depuis la publication : une route `/maestro/` est ajoutée dans le site Nginx `festi-app`. Le nom du VPS redirige vers cette adresse.

## Commandes de contrôle

```sh
sudo docker ps
sudo docker exec maestro-php84 php -v
sudo docker exec maestro-php84 php-fpm -t
sudo docker exec maestro-mysql57 mysql --defaults-extra-file=/run/secrets/mysql-root.cnf -e 'SELECT VERSION();'
```

Ne jamais afficher `docker inspect` sans filtrer les champs ni lire les fichiers de secrets dans une sortie partagée.

## Suite

Choisir le domaine de test, préparer DNS/HTTPS et protection d'accès, ajouter un site Nginx Maestro indépendant, préparer les permissions des configurations et médias, déployer `v2` et ses migrations puis vérifier les parcours. Les versions et paramètres effectifs IONOS restent à contrôler ; la parité des versions ne prouve pas à elle seule le fonctionnement complet sur IONOS.


## Publication de la prévisualisation — 16 octobre 2026

- Adresse principale : https://dms-app.fr/maestro/ ; `/maestro` redirige vers `/maestro/`.
- Révision publique : `1306793fd85e`, branche `v2`. Il s'agit du site initial, sans refonte ni administration encore implémentées.
- Fichiers : `/var/www/maestro/releases/1306793fd85e/public`, lien `current` ; archives publiques seules, sans `.htaccess`, logs, Git, documentation ni secrets.
- Route Nginx ajoutée dans `/etc/nginx/sites-available/festi-app`, avant le proxy `/api/`. Extrait versionné dans `deploy/nginx-maestro-location.conf`.
- L'ancienne adresse `vps-328a8329.vps.ovh.ca` redirige en HTTP et HTTPS vers `https://dms-app.fr/maestro$request_uri`.
- Un certificat distinct `maestro-vps` a été émis pour l'ancienne adresse, renouvellement automatique Certbot avec webroot `/var/www/maestro/current/public`. Le certificat existant dms-app.fr sert la nouvelle route.
- Prévisualisation publique du contenu existant ; en-têtes noindex sur Maestro. Aucune administration exposée.
- Contrôles : les trois pages contiennent bien Maestro, CSS/JS/logo accessibles, affichage navigateur HTTPS confirmé ; empreinte HTML de l'accueil mariage identique avant/après et API saine.
- Sauvegardes Nginx dans `/var/backups/maestro/`, dont `route-20261016-195123` avant l'ajout du préfixe. Ne pas restaurer aveuglément un fichier complet sans vérifier les changements ultérieurs.
- Lire `deploy/README.md` avant les mises à jour et adapter la configuration lors de l'arrivée du backend PHP et de l'administration.

## Correction des photos — 16 octobre 2026

Version active : `74b867e2a31e`, dossier `/var/www/maestro/releases/74b867e2a31e/public`. Les chemins de 26 photos ont été corrigés dans chacune des deux pages `index.html` et `menu.html` pour respecter la casse des fichiers Linux. Les 38 images de pizzas référencées ont été contrôlées en HTTPS : HTTP 200 et type image. Les deux pages publiées correspondent aux sources corrigées. Version précédente conservée pour retour arrière : `1306793fd85e`.

## Adaptation Pizzeria — 16 octobre 2026

Version publique active : `838adba009f9`, dans `/var/www/maestro/releases/838adba009f9/public`. Accueil, carte et contact utilisent la direction du template choisi. Ancienne version conservée : `74b867e2a31e`. Contrôles HTTPS : trois pages identiques aux sources, 42 images accessibles (38 pizzas, logo et trois médias du template), CSS accessible, accueil mariage inchangé et API saine. Contrôle visuel navigateur effectué ; aucune erreur dans les journaux console consultés. Aucune modification Nginx ou base de données.

## Front React pré-rendu

La livraison React publie uniquement dist/ (trois HTML et assets avec empreintes), préparé par pnpm build et pnpm test. Aucun Node ou React côté serveur de production, aucun changement PHP/MySQL/Nginx nécessaire. Les anciennes sources HTML/CSS/jQuery ne sont plus les sources de référence ; lire README.md.


## Administration publiée — 16 octobre 2026

État courant : release admin-20261016-210424 sous /var/www/maestro/releases/, accessible via current. Administration : https://dms-app.fr/maestro/administration/. Les 38 pizzas d'origine sont importées dans maestro_test. Aucun compte administrateur n'est précréé ; activation privée à usage unique.

- PHP-FPM : conteneur maestro-php84, image maestro-php:8.4-admin (PHP 8.4.26, GD WebP activé). Port toujours 127.0.0.1:9084. Ancien conteneur arrêté conservé sous maestro-php84-before-admin pour retour arrière.
- Configuration persistante : /var/www/maestro/shared/config.json, root:www-data 0640, hors racine publique. Médias persistants : shared/uploads. Les photos initiales sont copiées vers ce stockage avec noms hachés. Ne jamais supprimer shared lors d'une release.
- Runtime : /opt/maestro-runtime/Dockerfile-admin et maestro-admin.ini, upload 6M, post 7M, erreurs masquées. Montage global Maestro en lecture seule ; seul shared/uploads est monté en écriture pour PHP.
- MySQL reste maestro-mysql57, version 5.7.44, sans port publié. Tables administrators, app_settings, login_attempts et pizzas. Droits applicatifs SELECT/INSERT/UPDATE/DELETE.
- Nginx : seules les routes Maestro sont remplacées selon deploy/nginx-maestro-location.conf. Les pages .html passent par PHP, l'API sous /maestro/api/index.php, les ressources admin sont statiques. /api/ du mariage est préservé.
- Sauvegarde avant bascule : /var/backups/maestro/admin-20261016-210424, ancien Nginx, lien de release et dump MySQL. Retour arrière : restaurer le bloc Maestro après comparaison, repointer current, nginx -t puis reload ; conserver base et médias.

Vérifications : typecheck/build et 5 tests de build réussis ; syntaxe PHP 8.4 et nginx -t valides. Tests API sur une base isolée : activation unique, authentification, CSRF, validation de données et images, brouillons/publication, échappement XSS, conflits de version, persistance et déconnexion. Modification par formulaire vérifiée dans le navigateur. Après publication : 38 photos servies, ressources admin disponibles, configuration et sources privées inaccessibles, API privée 401 sans session, cookie Secure/HttpOnly/SameSite Strict au chemin /maestro/. Accueil mariage inchangé et santé API OK. IONOS non déployé.

Contrôle visuel du formulaire à 390 et 768 px : champs, prix et photo accessibles, disposition empilée sans débordement horizontal visible.
