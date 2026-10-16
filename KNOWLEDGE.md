# Knowledge — erreurs et apprentissages

Mémoire du projet créée le 16 octobre 2026. Lire ce fichier avant toute intervention et l'enrichir après une erreur réelle. Cette mémoire persiste dans les fichiers du projet ; elle ne suppose pas de mémoire automatique entre les conversations.

## Règles de tenue

- Consigner l'erreur observée, sa conséquence, sa correction et une règle de prévention.
- Ne pas inventer d'incident et ne pas transformer une hypothèse en fait.
- Ne jamais enregistrer de secrets, jetons, mots de passe ou contenus des journaux serveur.
- Fusionner les doublons et corriger les entrées devenues obsolètes.
- Conserver les décisions d'architecture dans `ARCHITECTURE.md`.

## Erreurs constatées le 16 octobre 2026

### Python non disponible dans le PATH

- Erreur : lancer l'installateur de skills avec `python` sans vérifier le runtime.
- Conséquence : échec, la commande renvoyait vers le raccourci Microsoft Store.
- Correction : utiliser le chemin absolu du Python fourni par Codex.
- Prévention : vérifier les exécutables ; retrouver les runtimes fournis avec `load_workspace_dependencies` si nécessaire.

### Contexte Git et propriétaire du dépôt différents

- Erreur : interroger depuis le compte sandbox un dépôt créé dans le contexte de l'utilisateur sans anticiper la différence de propriétaire.
- Conséquence : refus Git « dubious ownership ».
- Correction : exécuter les opérations nécessaires dans le contexte utilisateur autorisé pour ce dossier.
- Prévention : vérifier le contexte d'exécution ; éviter les exceptions globales `safe.directory=*`.

### Contrôle des espaces trop bavard

- Erreur : lancer `git diff --cached --check` sur le premier import sans limiter la sortie.
- Conséquence : des milliers de lignes de problèmes d'espaces préexistants ont saturé le résultat.
- Correction : conserver les sources à l'identique et examiner des résultats résumés ou ciblés.
- Prévention : anticiper le volume des commandes et limiter la sortie sans ignorer leur code de retour.

### Identité Git absente

- Erreur : tenter le premier commit sans vérifier l'identité d'auteur.
- Conséquence : commit refusé par Git.
- Correction : utiliser ponctuellement l'identité technique `Codex`, annoncée à l'utilisateur, sans modifier la configuration globale.
- Prévention : vérifier l'identité avant le commit ; ne pas inventer une adresse personnelle.

### Apostrophes typographiques dans PowerShell

- Erreur : intégrer du français avec des apostrophes typographiques dans des chaînes PowerShell délimitées par des apostrophes.
- Conséquence : erreur d'analyse syntaxique ; la commande de création des documents n'a pas été exécutée.
- Correction : préparer des fichiers UTF-8 séparés puis les transférer avec un script dont le contenu ne dépend pas de l'échappement du texte français.
- Prévention : ne pas imbriquer de longs documents dans du code shell ; séparer les données et les commandes.

## Repères pratiques

- Dossier réel : `F:\Flo\_AI\Projets\maestro`, différent du dossier initial de la conversation.
- Distant : https://github.com/FlowHartigan/maestro ; branche initiale : `main`.
- `logs/` contient des journaux serveur et reste exclu par `.gitignore`.
- Le site initial utilise Bootstrap, jQuery et des extensions. Examiner leurs usages et les sources SCSS avant modification.
- La capture du panneau IONOS ne permet pas de connaître la version PHP active.

## Modèle de nouvelle entrée

### AAAA-MM-JJ — Intitulé

- Erreur :
- Conséquence :
- Correction :
- Prévention :


### 2026-10-16 — Versions de test différentes de la cible attendue

- Erreur : installer PHP 8.5 et MySQL 8.4 fournis par Ubuntu pour préparer les tests, alors que le propriétaire attendait la parité PHP 8.4/MySQL 5.7.
- Conséquence : environnement insuffisamment représentatif ; une nouvelle installation a été nécessaire.
- Correction : environnement dédié PHP 8.4.26/MySQL 5.7.44, connexion PDO et FastCGI vérifiées, anciens services arrêtés et site existant contrôlé.
- Prévention : respecter les versions exactes demandées. La compatibilité supposée avec une version récente ne remplace pas un test sur la version cible ; distinguer les versions natives du serveur et celles exécutant l'application.


### 2026-10-16 — Contrôle MySQL avec un transport non autorisé

- Erreur : vérifier MySQL 5.7 en TCP avec `root@localhost`, alors que ce compte est limité au socket local.
- Conséquence : refus d'authentification dans la boucle de disponibilité malgré un serveur démarré.
- Correction : contrôle administrateur via le socket, puis test réseau PHP/PDO avec le compte applicatif ; requête réussie sur MySQL 5.7.44.
- Prévention : distinguer le transport, l'hôte autorisé du compte et le mot de passe ; ne pas élargir les droits root pour contourner un contrôle erroné. Attendre la fin de l'initialisation avant les opérations applicatives.


### 2026-10-16 — Vérification trop rapide après rechargement Nginx

- Erreur : tester la nouvelle route immédiatement après `systemctl reload nginx`, sans tenir compte de la transition entre les workers.
- Conséquence : une réponse du site par défaut a fait échouer le contrôle et déclenché le retour arrière ; le nouveau journal Maestro était encore vide.
- Correction : répéter les contrôles de façon bornée jusqu'à obtenir le contenu Maestro attendu ; pages et certificat ensuite vérifiés.
- Prévention : après un rechargement progressif, vérifier le contenu attendu et le certificat avec quelques tentatives limitées, sans désactiver la validation TLS ni se contenter d'un HTTP 200 provenant d'une autre application.


### 2026-10-16 — Casse des images et vérification incomplète au déploiement

- Erreur : publier les pages sans vérifier chaque photo de pizza. Les références `.JPG` ne correspondaient pas toujours aux fichiers `.jpg`, et `Escari.JPG` différait de `escari.jpg`.
- Conséquence : photos absentes sous Linux, malgré un site accessible et un logo correct. Les requêtes vers les mauvais chemins renvoyaient 404.
- Correction : aligner les références des pages accueil et pizzas sur les noms exacts versionnés, puis vérifier toutes les photos par HTTP après publication.
- Prévention : contrôler les noms avec une comparaison sensible à la casse, même depuis Windows. Une page HTTP 200 et un contrôle du logo ne suffisent pas à valider ses ressources ; vérifier aussi les images de fond CSS.

### 2026-10-16 — Lecture DOM des cadres de prévisualisation

- Erreur : tenter de lire contentDocument des iframes dans la portée DOM limitée du navigateur intégré.
- Conséquence : mesure automatique des débordements indisponible via cette méthode.
- Correction : contrôle visuel des cadres mobile et tablette, puis inspection directe de la page principale.
- Prévention : utiliser uniquement les capacités DOM exposées et distinguer contrôle visuel et mesure automatique.

### 2026-10-16 — Cache CSS après remplacement du fond

- Erreur : conserver la même URL de feuille CSS après modification du fond d’accueil.
- Conséquence : le navigateur pouvait afficher l’ancienne pizza malgré les fichiers corrects sur le serveur.
- Correction : versionner l’URL CSS de l’accueil.
- Prévention : modifier la version des ressources dépendantes lors d’une publication et vérifier le rendu navigateur.

### 2026-10-16 — Titre React et répertoire de commande

- Erreurs : créer un élément title avec plusieurs enfants JSX ; copier des fichiers avec des chemins relatifs après changement du dossier de travail.
- Conséquences : titre vide dans le HTML généré et copie initiale échouée.
- Corrections : une seule chaîne pour title, contrôlée par test ; chemins absolus pour les fichiers préparés hors dépôt.
- Prévention : comparer le texte et les liens avant/après migration ; ne pas déduire le répertoire source du cwd d'une commande.

### 2026-10-16 — Paramètre pnpm obsolète

- Erreur : utiliser ignoredBuiltDependencies avec pnpm 11.
- Conséquence : installation signalée en échec malgré les binaires disponibles.
- Correction : allowBuilds avec esbuild et sharp à false, puis installation verrouillée, build et tests réussis.
- Prévention : vérifier la documentation de la version effective du gestionnaire.


### 2026-10-16 — Réencodage des photos et fixtures

- Erreurs : supposer que GD permettait WebP sans vérifier sa compilation ; utiliser un PNG de test invalide.
- Conséquence : échecs d'ajout de pizza dans l'environnement isolé.
- Correction : compiler GD avec WebP et générer une vraie fixture PNG ; rejouer le parcours complet.
- Prévention : vérifier imagewebp et imagecreatefromstring sur le runtime cible avant publication, avec un vrai envoi de fichier.

### 2026-10-16 — Base des ressources Vite

- Erreur : utiliser ../ comme base Vite de l'administration.
- Correction : base ./ et ressources à côté de son index, dans administration/assets/.
- Prévention : contrôler les URL du build sous le préfixe réel, pas seulement à la racine du serveur local.

### 2026-10-16 — Cache PHP et bascule de release

- Erreur : vérifier immédiatement la nouvelle API après changement du lien current sans actualiser les workers PHP.
- Conséquence : ancienne réponse API servie par le cache des chemins ; contrôle de publication refusé et rollback automatique.
- Correction : rechargement gracieux de PHP-FPM (USR2), puis contrôle avec quelques tentatives bornées.
- Prévention : après bascule atomique PHP, renouveler les workers et vérifier une propriété de la nouvelle version de l’API.
