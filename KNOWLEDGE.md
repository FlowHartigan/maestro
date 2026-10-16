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
