# Prévisualisation VPS

Adresse : https://dms-app.fr/maestro/

Le fichier `nginx-maestro-location.conf` contient uniquement les emplacements Maestro à inclure dans le bloc HTTPS existant de `dms-app.fr`. Ne pas remplacer la configuration du site mariage avec cet extrait. Vérifier la configuration avec `nginx -t` avant rechargement et conserver une sauvegarde pour retour arrière.

Les fichiers publics sont déployés dans `/var/www/maestro/releases/<revision>/public`, avec un lien `/var/www/maestro/current` vers la version active. Transférer seulement les pages et ressources publiques : ne jamais publier Git, les journaux, les documents internes ou les secrets. Ne pas copier le `.htaccess` de production, qui redirige vers pizzamaestro.com.

La prévisualisation actuelle est le site HTML/CSS/JS existant extrait de `v2`, révision `1306793fd85e`. React, l'administration et les migrations applicatives restent à développer. Les fichiers PHP sont volontairement refusés dans cette route statique ; adapter la configuration de façon contrôlée à l'arrivée de l'application PHP.

La route `/maestro` redirige vers `/maestro/`, indispensable aux liens relatifs. L'ancien nom du VPS redirige vers cette nouvelle adresse. Le site est public ; les en-têtes noindex ne sont pas une protection d'accès. Une protection distincte devra être prévue avant de publier des contenus privés de test.

Pour les prochaines évolutions, gérer une base d'URL configurable : `/maestro/` ici et éventuellement `/` chez IONOS. Les ressources, liens, routes React, API et cookies doivent fonctionner sous ce préfixe sans perturber `/api/` de l'application mariage.

Après rechargement Nginx, utiliser des vérifications bornées avec répétition : les anciens workers peuvent encore répondre brièvement. Contrôler les pages, CSS, JavaScript et images de Maestro, ainsi que la racine mariage et son API de santé. Avant un prochain transfert, lire `VPS.md` et vérifier la version active.
