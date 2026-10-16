# Point de reprise — Maestro

Mis à jour le 16 octobre 2026. Lire ce fichier en premier dans un nouveau chat, puis AGENTS.md, ARCHITECTURE.md, KNOWLEDGE.md, ADMINISTRATION.md et VPS.md. Les dernières décisions datées remplacent les descriptions historiques devenues obsolètes.

## Projet et version

- Propriétaire : Florian. Répondre en français ; agir de manière autonome pour les évolutions demandées, avec vérifications et déploiement sur le VPS de test selon le périmètre autorisé.
- Dépôt de référence : F:\Flo\_AI\Projets\maestro.
- GitHub : https://github.com/FlowHartigan/maestro ; branche de travail et de publication v2.
- v1 et tag v1.0.0 conservent le site initial. Ne pas les modifier. Ne pas intégrer dans main sans demande.
- Dernier commit applicatif : 40edb11, gestion des horaires partagés dans l’administration. Le commit ajoutant ce point de reprise ne modifie pas le site.
- État Git avant ce document : propre, v2 synchronisée avec origin/v2.
- Le dossier C:\Users\flori\Documents\ChatGPT\maestro 2 est un espace de préparation, pas le dépôt Git de référence. Il contient des scripts temporaires et aperçus ; ne pas les exécuter aveuglément, certains supposent une base vide ou une release précise.

## Objectif et contraintes

Moderniser le site Pizza Maestro (Clermont-Ferrand et Chamalières), conserver les contenus/coordonnées existants et permettre la gestion de pizzas, puis à terme de news.

Le même code doit fonctionner sur le VPS Ubuntu et un mutualisé IONOS avec PHP 8.4/MySQL 5.7 Standard. Aucun Node permanent, aucune dépendance Docker obligatoire côté application. Docker fournit seulement les versions demandées sur le VPS. IONOS n'a pas encore été déployé ni testé réellement : vérifier extensions PHP, GD WebP, PDO MySQL, mbstring, règles Apache, chemins, uploads et HTTPS.

## État fonctionnel livré

- Site public : https://dms-app.fr/maestro/ ; carte menu.html et contact contact.html.
- Administration : https://dms-app.fr/maestro/administration/.
- Ajout, modification et suppression définitive d'une pizza ; nom, ingrédients, prix 26/33/40 cm, photo.
- Suppression avec confirmation nommée, session/CSRF et contrôle de version. Retrait immédiat du site et de la liste admin. Les fichiers photo sont conservés pour sauvegardes et références partagées.
- Nouvelle pizza sans photo : visuel Maestro images/pizza/pizza_off.jpg, utilisé notamment pour la Rossi. Envoi de photo facultatif ; aperçu par défaut dans le formulaire. Ne pas remplacer globalement les photos existantes.
- Le build génère server/default-photo.json et dist/uploads/da2c4f7cc46b1bbbb6ad81d6065f5a7af980f820.webp. Copier dist/uploads vers les uploads persistants sans effacer les autres médias.
- La case « Afficher sur la carte » a été retirée à la dernière demande. Tout futur enregistrement impose published=1 côté API, même si un ancien client envoie 0 ou omet le champ.
- Les anciens brouillons conservent leur état jusqu'à leur prochain enregistrement. Une publication globale de ces recettes a été rejetée par le contrôle automatique d'approbation ; aucune mise à jour globale SQL n'a été exécutée. Ne pas la relancer sans autorisation explicite.
- Pas de gestion de news livrée pour le moment. Pas de récupération de mot de passe par email. Ne pas inventer d'autres fonctionnalités ou tâches en attente.
- Premier compte : code privé à usage unique, puis identifiant et mot de passe choisis par le propriétaire. Ne pas supposer si l'activation a été faite depuis ; inspecter la session si nécessaire sans modifier les comptes.

## Horaires administrables — ajout du 16 octobre 2026

- Rubrique « Horaires » à côté de « Pizzas », après connexion. Horaires communs aux deux établissements, partagés en MySQL et visibles immédiatement sur tout le site.
- Sept jours et jours fériés, fermeture ou un/deux créneaux par jour, sans chevauchement ni passage de minuit. Jour férié prioritaire sur le jour hebdomadaire. Valeurs historiques conservées à la livraison.
- Sauvegarde protégée par session, CSRF et version ; avertissement de départ si modifications non enregistrées, annulation et retour confirmé aux horaires d’origine (à enregistrer pour appliquer).
- server/hours.php : validation, stockage et rendu ; server/hours-defaults.json : valeurs initiales ; admin/HoursEditor.tsx : formulaire ; composant Hours et slots publics.
- Installation existante : migration additive réexécutable server/migrations/001-opening-hours.sql avant le code. Inclus dans schema.sql pour une nouvelle installation. Ne pas remplacer un horaire enregistré par les valeurs initiales.
- Typecheck/build/6 tests et API isolée PHP 8.4/MySQL 5.7 réussis. UI vérifiée avec sauvegarde/rechargement, saisie invalide, annulation/réinitialisation, clavier et 390/768/1280 px, sans débordement mesuré ni erreur console. Après publication : pages publiques identiques avant/après, API privée 401, bundle et photos servis, mariage inchangé et sain.
- Environnement temporaire de cette intervention : maestro-hours-integration, base maestro_hours_integration et /var/www/maestro/hours-integration ; supprimés après vérifications. Aucun compte de test ajouté à la base réelle.

## Front et design

Le propriétaire a choisi le template Pizzeria TemplateMonster #78480. Voir TEMPLATE.md pour la provenance et le périmètre. L'identité sombre/or et les contenus Maestro ont été conservés. Accueil avec hero Fenati régénéré, section « La passion de la pizza, tout simplement. », puis bandeau orange Don Scata avec photo détourée générée.

Toutes les pages publiques sont écrites en React JSX, compilées par Vite et pré-rendues en gabarits HTML privés. PHP injecte les données MySQL échappées à chaque requête : changements de pizzas sans rebuild et zéro JavaScript applicatif téléchargé sur la vitrine. L'administration seule charge React/TypeScript (environ 73 Ko JS gzip). Pas de Bootstrap/jQuery.

- src/pages/, src/components.jsx, src/styles.css : front public.
- src/pizzas.json : 38 recettes initiales, uniquement source d'import ; la base est maintenant la référence des contenus partagés. Ne pas réimporter pour écraser les modifications du propriétaire.
- admin/main.tsx et admin/style.css : administration.
- server/api.php, bootstrap.php : API, authentification, données et photos.
- server/public.php : rendu public dynamique depuis les gabarits issus de React.
- server/schema.sql et seed.php : installation initiale MySQL 5.7 ; le seed ne remplace pas une table déjà remplie.
- public/index.php, public/api/index.php, public/.htaccess : entrées et routage Apache.
- scripts/build.mjs : images WebP, gabarits, assets avec empreinte, build admin.

## Backend et sécurité

PHP 8.4, PDO préparé sans émulation, MySQL 5.7. Tables administrators, app_settings, login_attempts, pizzas et opening_hours. Compte applicatif limité à SELECT/INSERT/UPDATE/DELETE. Sessions serveur ; mot de passe haché ; cookies Secure/HttpOnly/SameSite Strict, chemin /maestro/ ; CSRF et limitation des tentatives ; conflits de modifications rejetés avec 409.

Photos JPG/PNG/WebP, maximum 6 Mo et 24 mégapixels, validation serveur et réencodage WebP maximum 1200 px. Noms aléatoires de 40 caractères hexadécimaux. Aucun mot de passe/token/config réelle à versionner ou afficher.

## Serveur et déploiement

- VPS : vps-328a8329.vps.ovh.ca, Ubuntu. SSH utilisateur ubuntu ; clé locale C:\Users\flori\.ssh\festi-app-vps. Utiliser IdentitiesOnly=yes, BatchMode=yes, StrictHostKeyChecking=yes ; sudo -n disponible. Ne pas lire ni copier le contenu de la clé.
- Site mariage à la racine dms-app.fr : à préserver. API mariage /api/ proxifiée vers 127.0.0.1:3001 ; contrôle http://127.0.0.1:3001/api/health. Ne toucher qu'au périmètre Maestro.
- Nginx : /etc/nginx/sites-available/festi-app, bloc BEGIN/END MAESTRO PREVIEW. Configuration versionnée deploy/nginx-maestro-location.conf. Pages .html et API Maestro traitées par PHP ; autres PHP et fichiers privés non exposés.
- Release active après dernière intervention : /var/www/maestro/releases/switch-20261016-221007 ; lien /var/www/maestro/current. REVISION : 4886397. Revalider l'état réel avant toute modification.
- Une release comprend public/ (dist/) et server/ (.build/server/) hors racine publique. config.local.json est un lien vers shared/config.json.
- Persistance : /var/www/maestro/shared/config.json (root:www-data 0640), shared/uploads. Ne pas supprimer shared ni remplacer la base lors d'une mise à jour.
- MySQL : conteneur maestro-mysql57, MySQL 5.7.44, réseau maestro-test, aucun port publié ; base maestro_test, utilisateur maestro_app. Secrets privés serveur. Les secrets ne sont pas dans ce document.
- PHP : maestro-php84, image maestro-php:8.4-admin, PHP 8.4.26, GD avec WebP ; écoute FPM 127.0.0.1:9084. Montage global Maestro en lecture seule, uploads persistants en écriture. Ancien conteneur arrêté maestro-php84-before-admin conservé pour rollback.
- Runtime serveur : /opt/maestro-runtime/Dockerfile-admin, maestro-admin.ini ; upload 6M, post 7M, display_errors Off. Ne pas redémarrer les services du mariage.
- Sauvegardes par intervention sous /var/backups/maestro/ ; releases précédentes conservées. Après bascule du lien current, recharger gracieusement les workers PHP-FPM (USR2) pour vider les caches de chemins. Faire des vérifications bornées après rechargement.
- Pour modifier Nginx, sauvegarder d'abord, nginx -t avant reload, puis vérifier routes et santé mariage. Pas de changement Nginx nécessaire pour une simple nouvelle release de code.

## Vérifications réalisées

Dernière version : typecheck, build, 6 tests de build réussis. Tests API en environnement isolé sur MySQL 5.7/PHP 8.4 : activation unique, session, CSRF, validation, photo par défaut et photos personnalisées, publication automatique, XSS échappé, persistance, conflits, suppression protégée, déconnexion/reconnexion. UI d'administration vérifiée précédemment sur ordinateur et visuellement à 390/768 px. Publication : bundle sans case de visibilité, carte publique et accueil mariage identiques avant/après, santé API mariage OK.

L'environnement de test maestro-admin-integration et la base maestro_admin_integration ont été supprimés après les contrôles ; aucun compte de test n'a été ajouté à la base réelle. scripts/integration.py crée et supprime des recettes : l'exécuter uniquement contre une nouvelle base privée isolée, jamais maestro_test ni IONOS réel.

Commandes de contrôle : pnpm install --frozen-lockfile, pnpm typecheck, pnpm build, pnpm test. Node >=22.12, pnpm 11.25. Le preview statique ne fait pas fonctionner l'API.

## Outils Windows utiles

Selon l'environnement du nouveau chat, les commandes peuvent nécessiter un chemin explicite :

- Git : C:\Users\flori\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe.
- Node : même racine dependencies\node\bin\node.exe (ajouter son dossier au PATH pour pnpm).
- pnpm : dependencies\node\node_modules\pnpm\bin\pnpm.cjs, lancé avec Node.
- Python : dependencies\python\python.exe.
- Si nécessaire pour les lectures Git : -c safe.directory=F:/Flo/_AI/Projets/maestro. Ne pas modifier globalement la configuration pour contourner le sandbox.
- Selon les permissions du chat, écrire dans F: nécessite une élévation ; le cwd C: de préparation ne change pas le dépôt cible.

## Reprise attendue

La présentation de La Casa di Maestro est livrée sur le VPS : bouton entre les deux ambiances, page casa.html, coordonnées Beaumont, menu fourni et horaires distincts dans l’administration. Chamalières et la ligne jour férié sont retirés. Voir CASA.md pour les détails, images et migration 002. Les nouveaux commits restent locaux sur v2 : un contrôle automatique précédent a refusé l’envoi GitHub faute d’autorisation explicite dans ce chat. Attendre cet accord avant de pousser. Les news et le déploiement IONOS ne sont pas demandés.

Les aperçus et le fichier privé d'activation initial sont dans l'espace local de préparation, hors Git ; ne jamais recopier leurs secrets dans un compte rendu ou un commit. Lire KNOWLEDGE.md avant d'agir : chemins absolus, GD WebP réel, base Vite ./, cache PHP après bascule et contrôles après rechargement.


## Livraison Casa — 17 octobre 2026

Version applicative 6095b2d, release casa-20261016-220252 (horloge serveur UTC), sauvegarde /var/backups/maestro/casa-20261016-220252. Migration 002 additive appliquée, ligne Pizza inchangée. Route Nginx Casa ajoutée dans le bloc Maestro, configuration testée et rechargée. Quatre pages et ressources contrôlées, API protégée, cartes de pizzas identiques avant/après, accueil et API mariage intacts. Typecheck, build et sept tests de build réussis ; tests PHP/API isolés et UI mobile/ordinateur réussis. Aperçu public sans erreur console ni image manquante.


## Sélecteur intégré — 17 octobre 2026

Dernière release : switch-20261016-221007, révision 4886397. Sélecteur compact intégré à un en-tête commun, curseur entre les établissements et fondu natif CSS entre les pages ; préférence de réduction des mouvements respectée. Aucun JavaScript public ajouté. Typecheck, build et sept tests réussis ; navigation souris/clavier, rendu à 320/390/1280 px contrôlés. Quatre pages et ressources en ligne vérifiées, carte Pizza et site mariage inchangés. Aucune migration SQL ni modification Nginx pour cette livraison. Sauvegarde : /var/backups/maestro/switch-20261016-221007. Les commits restent locaux.
