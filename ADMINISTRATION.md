# Administration des pizzas

Adresse VPS : https://dms-app.fr/maestro/administration/

À la première visite, renseigner le code privé livré séparément, choisir un identifiant (3 à 50 lettres/chiffres/points/tirets) et un mot de passe (12 à 72 caractères). Le code devient inutilisable après création du compte. Aucun compte de test n'est importé en production.

Rechercher ou sélectionner une pizza pour changer son nom, ses ingrédients, ses trois tarifs ou sa photo. « Ajouter une pizza » crée une nouvelle recette. Chaque pizza enregistrée est automatiquement visible sur la carte. Enregistrer applique les changements immédiatement au site. Les changements non enregistrés déclenchent un avertissement au départ. Un conflit entre deux onglets bloque l'écrasement : recharger la fiche.

## Construire et tester

Node >=22.12 et pnpm 11.25 : pnpm install --frozen-lockfile, pnpm typecheck, pnpm build, pnpm test.
Le preview statique ne fait pas fonctionner l'API. Tester le backend avec PHP 8.4, PDO MySQL, mbstring et GD compilé avec JPEG/PNG/WebP, sur une base MySQL 5.7 isolée. scripts/integration.py utilise volontairement un compte et des pizzas jetables : ne jamais le lancer sur la base de production. server/dev-router.php est réservé au serveur PHP de développement.

## Installer sur VPS ou mutualisé

1. Copier dist/ dans un dossier public/ et .build/server/ dans son voisin server/, hors racine web. Le domaine doit servir public/ uniquement.
2. Créer config.local.json à côté de public/ en suivant config.example.json : identifiants MySQL, base_path /maestro sur VPS ou chaîne vide à la racine IONOS, secure_cookies true en HTTPS, upload_dir absolu et persistant.
3. Importer server/schema.sql avec un compte de migration. Le compte applicatif utilise seulement SELECT/INSERT/UPDATE/DELETE.
4. Import initial : conserver les photos du seed dans uploads/ persistant avec noms de 40 caractères hexadécimaux et extension .webp ; mettre à jour les chemins du seed avant server/seed.php. Le seed est importé uniquement si la table pizzas est vide. Ne pas réimporter la carte sur une base active.
5. Générer un code aléatoire secret et placer son SHA-256 dans un fichier privé. Exécuter PHP server/seed.php chemin-du-fichier-hash. Remettre le code au propriétaire hors dépôt, puis supprimer les copies inutiles après activation.
6. Rendre uploads/ accessible en lecture dans public/ (lien symbolique ou alias VPS ; dossier public persistant sur IONOS). Seul ce dossier doit être inscriptible par PHP. Les photos sont réencodées WebP, maximum 6 Mo et 24 mégapixels en entrée. Configurer upload_max_filesize=6M, post_max_size=7M, display_errors=Off.
7. Apache : le .htaccess livré réécrit les pages .html vers index.php. Nginx : utiliser deploy/nginx-maestro-location.conf et valider nginx -t avant reload. Ne jamais ouvrir une exécution PHP générale dans uploads/.

Le VPS utilise des releases atomiques et shared/config.json + shared/uploads. La base, les photos et les comptes survivent aux releases. Sauvegarder ensemble la base et les photos. Conserver les anciennes photos après remplacement pour permettre une restauration ; leur nettoyage est une opération distincte. Les pages publiques ne doivent pas être mises en cache immutable.

## Maintenance

En cas de perte du mot de passe, un administrateur serveur peut remplacer uniquement le password_hash du compte concerné avec un hash produit par password_hash en PHP. Ne pas rouvrir l'activation ni exposer une route de réinitialisation sans protection. Le changement nécessite un accès privé au serveur ; aucun email de récupération n'est configuré.

Les actualités ne sont pas encore administrables. IONOS : adapter les chemins et vérifier les extensions PHP, les permissions et les règles Apache avant publication. La compatibilité du code PHP/MySQL ne remplace pas un test sur l'offre réelle.


## Supprimer une pizza

Ouvrir la fiche puis cliquer « Supprimer la pizza ». La confirmation affiche son nom et permet d'annuler. Après confirmation, la recette est supprimée définitivement de la base et retirée du site. Les fichiers photo restent conservés pour les sauvegardes ; cette conservation ne restaure pas la recette depuis l'interface.


## Photo par défaut

Une nouvelle pizza reçoit automatiquement le visuel Maestro utilisé pour la Rossi. Ajouter une photo reste facultatif et remplace ce visuel. Modifier une recette sans choisir de fichier conserve sa photo actuelle. Lors du déploiement, copier également le contenu de dist/uploads/ vers le dossier uploads persistant sans effacer les photos existantes ; server/default-photo.json contient son chemin public.

La case de visibilité et le mode brouillon ont été retirés. Chaque enregistrement publie la recette. Les anciens brouillons conservent leur état jusqu’à leur prochain enregistrement.

## Modification des horaires — 16 octobre 2026

La rubrique « Horaires » de l’administration gère les horaires communs aux deux établissements : lundi à dimanche et jours fériés, fermeture ou un à deux créneaux par jour. Les jours fériés remplacent l’horaire hebdomadaire. Les créneaux doivent se suivre sans chevauchement et se terminer le même jour après leur début.

Les horaires sont partagés entre visiteurs et appareils, stockés en MySQL dans opening_hours ; session, CSRF, validation serveur et contrôle de version protègent leur modification. Enregistrer les applique immédiatement au pied de page des trois pages et au bloc contact, sans rebuild. Les jours successifs identiques sont regroupés à l’affichage. L’annulation restaure la dernière lecture ; le retour aux horaires d’origine, confirmé, prépare le formulaire et nécessite un enregistrement pour remplacer les valeurs publiées. Les changements non enregistrés sont signalés et protégés au départ.

Installation existante : appliquer server/migrations/001-opening-hours.sql avec un compte de migration avant le nouveau code. Migration additive et réexécutable, sans changement des recettes, comptes ou réglages existants. Nouvelle installation : inclus dans schema.sql. Le compte applicatif doit disposer des droits SELECT/INSERT/UPDATE/DELETE sur la nouvelle table. Aucun horaire enregistré n’est remplacé par une mise à jour du code.


## Mise à jour Casa — 17 octobre 2026

Voir [CASA.md](CASA.md) : nouvelle page, deux établissements et horaires indépendants sur sept jours. Appliquer la migration 002 avant publication et ajouter la route Nginx Casa.
