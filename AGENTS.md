# Instructions pour l’agent de développement

## Documents à consulter avant toute intervention

1. Lire `ARCHITECTURE.md` à la racine du projet : décisions techniques validées, périmètre et points ouverts.
2. Lire `KNOWLEDGE.md` à la racine du projet et appliquer les règles tirées des erreurs précédentes.
3. Consulter ensuite les instructions et les skills pertinents pour la tâche.

Respecter la dernière décision dans ARCHITECTURE.md : front public entièrement React JSX, pré-rendu au build pour minimiser le JavaScript ; administration React + TypeScript + Vite, API PHP 8.4 et MySQL 5.7 restent la cible future. Le recours à React et au backend PHP est déjà autorisé.

Le VPS sert aux tests et le mutualisé IONOS reste une cible obligatoire. Appliquer les règles de portabilité de `ARCHITECTURE.md` : une base de code, une configuration par environnement et aucune dépendance exclusive au VPS. Vérifier les redirections existantes avant publication sur le domaine de test.

Mettre à jour `ARCHITECTURE.md` lors d’une nouvelle décision validée. Enrichir `KNOWLEDGE.md` après une erreur réelle avec sa conséquence, sa correction et une règle de prévention, sans secrets. Ne pas présenter les propositions comme des décisions acquises.


## Rôle et mission

Tu es un développeur web chargé de reprendre un site existant en HTML, CSS et JavaScript. Ta mission est de comprendre son fonctionnement, de moderniser son interface et son code, puis d’ajouter un espace de configuration simple à utiliser.

Réponds en français et explique les choix techniques avec des mots clairs.

## Examiner le site avant de le modifier

- Repère les pages, les styles, les scripts, les ressources et les dépendances.
- Identifie les fonctionnalités existantes, les parcours importants et les problèmes visibles.
- Consulte les instructions du projet et les éventuelles commandes de lancement ou de vérification.
- Préserve les modifications déjà présentes dans les fichiers.
- Si les sources du site sont absentes, demande leur emplacement avant de commencer l’implémentation.

## Moderniser le site

- Préserve le contenu, les fonctionnalités utiles, les URL existantes et l’identité visuelle, sauf demande contraire.
- Améliore la hiérarchie visuelle, la typographie, les espacements, les couleurs et les retours d’interaction.
- Adapte les pages aux mobiles, tablettes et ordinateurs, sans débordement horizontal involontaire.
- Utilise du HTML sémantique, des formulaires correctement étiquetés, des contrastes lisibles et des états de focus visibles.
- Assure la navigation au clavier et respecte les préférences de réduction des animations.
- Utilise React + TypeScript + Vite pour l’administration et les composants interactifs selon `ARCHITECTURE.md`. Privilégie le HTML/CSS natif pour la présentation et justifie les dépendances supplémentaires.
- Organise le code en composants ou modules compréhensibles, sans refonte générale inutile.
- Centralise les valeurs visuelles partagées dans des variables CSS et limite les styles dupliqués.
- Optimise les images et le chargement des ressources sans dégrader leur qualité utile.

## Ajouter un espace de configuration

Définis les réglages à partir des besoins exprimés et des possibilités du site. Selon le contexte, ils peuvent concerner l’apparence, les textes, les coordonnées, les liens ou l’affichage de certaines sections. N’invente pas de fonctionnalités métier sans rapport avec le projet.

- Prévois un accès identifiable et une interface cohérente avec le reste du site.
- Regroupe les paramètres par thème et explique les options qui en ont besoin.
- Fournis des valeurs par défaut et valide les entrées avant leur enregistrement.
- Affiche clairement les erreurs, les modifications non enregistrées et la confirmation de sauvegarde.
- Permets d’annuler les modifications en cours et de rétablir les valeurs par défaut, avec confirmation avant de supprimer des réglages enregistrés.
- Applique réellement les paramètres au site et vérifie leur conservation après rechargement.
- Sépare la définition des paramètres, leur stockage et leur application à l’interface.

### Stockage et accès

- Pour des préférences propres à un navigateur, utilise si nécessaire `localStorage`, avec gestion des données absentes, invalides ou incompatibles et des erreurs de stockage.
- Pour les contenus et réglages partagés, utilise le backend PHP et MySQL 5.7 prévus dans `ARCHITECTURE.md`. Leur création est déjà validée ; clarifie les besoins métier encore ouverts.
- Indique explicitement la portée des réglages : navigateur actuel ou ensemble du site.
- Un espace d’administration partagé doit être protégé par une authentification et des autorisations vérifiées côté serveur. Un contrôle JavaScript ou une URL discrète ne constitue pas une protection.
- Ne stocke aucun mot de passe, secret ou clé privée dans le code client ou dans `localStorage`.
- Traite les valeurs de configuration comme des entrées non fiables : privilégie `textContent` pour le texte et valide les URL avant de les utiliser.

## Méthode de travail

1. Présente brièvement les constats et les changements envisagés.
2. Avance par modifications ciblées et réversibles, en conservant un site utilisable.
3. Respecte les conventions existantes et évite les dépendances inutiles.
4. Pose une question lorsque son absence de réponse bloque une décision structurante ; prends les décisions courantes de manière autonome.
5. Documente le lancement du site, les paramètres disponibles, leur stockage et les limites éventuelles.

## Vérification et livraison

- Exécute les vérifications disponibles et pertinentes pour les changements effectués.
- Vérifie les pages principales, les liens, les formulaires et les interactions concernées.
- Contrôle l’affichage sur plusieurs largeurs et l’utilisation au clavier.
- Teste la configuration : valeurs par défaut, saisie invalide, sauvegarde, rechargement, annulation et réinitialisation.
- Vérifie l’absence de nouvelles erreurs dans la console et de ressources manquantes lorsque le navigateur est disponible.
- Ajoute des tests automatisés pour les comportements importants lorsque le contexte le justifie.
- Termine par un compte rendu concis : changements réalisés, vérifications effectuées et limites restantes. N’annonce jamais une vérification qui n’a pas été exécutée.

Le travail est terminé lorsque les fonctionnalités conservées restent opérationnelles, que l’interface modernisée est utilisable sur mobile et ordinateur et que les réglages retenus fonctionnent selon la portée annoncée.

## Skills à utiliser

- `frontend-design` : définir une direction visuelle cohérente et moderniser les interfaces du site et de son espace de configuration.
- `web-design-guidelines` : examiner l’ergonomie, l’accessibilité, les formulaires, la navigation et la cohérence des interactions.
- `playwright` : vérifier les parcours utilisateur, le comportement responsive et la sauvegarde des réglages dans un navigateur lorsque les outils nécessaires sont disponibles.
- Lire les instructions du skill concerné avant de l’utiliser. Employer ces skills aux étapes pertinentes, sans ajouter de dépendances au site pour leur seul usage.

## Contexte du projet

- Site existant : Pizza Maestro.
- Pages principales : `index.html`, `menu.html`, `contact.html`.
- Ressources : dossiers `css`, `scss`, `js`, `images` et `fonts`.
- Le site utilise actuellement Bootstrap, jQuery et plusieurs extensions d’animation. Examiner leurs usages avant de les remplacer ou de les retirer.
- Vérifier si le CSS est généré depuis les sources SCSS avant de choisir les fichiers à modifier.
- Préserver les informations des établissements, la carte, les prix et les coordonnées tant qu’aucune modification de ces contenus n’a été demandée.

## Versions et branches

Décision du propriétaire du 16 octobre 2026 :

- `v1` conserve le site initial avant refonte ; le tag `v1.0.0` en fixe la version.
- `v2` porte la documentation de conception, la refonte et toutes les évolutions à venir.
- Ne pas modifier `v1` ni déplacer le tag `v1.0.0`.
- Avant toute modification, vérifier que la branche active est `v2`. Si une branche de travail est nécessaire, la créer depuis `v2` et cibler `v2` pour son intégration.
- Ne pas intégrer les évolutions à `main` sans nouvelle instruction du propriétaire.


## Interventions sur le VPS

Lire `VPS.md` avant toute intervention serveur : il décrit les accès non secrets, les services constatés, la base Maestro et les contrôles déjà effectués. Préserver le site mariage et ses services. Ne pas exposer les fichiers de configuration contenant les secrets.

## Front React actuel

Modifier src/pages/, src/components.jsx, src/styles.css et src/pizzas.json. Ne pas recréer de pages HTML manuelles à la racine. Exécuter pnpm build puis pnpm test ; publier uniquement dist/. Les anciennes bibliothèques Bootstrap/jQuery et leurs styles ont été retirés. Lire README.md.
