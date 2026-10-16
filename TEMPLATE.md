# Adaptation du template Pizzeria

Référence choisie par le propriétaire le 16 octobre 2026 : https://demo.templatemonster.com/fr/demo/78480.html
Démo publique : https://pro-theme.com/html/pizzeria/home.html

Les fichiers HTML, CSS, JavaScript et médias accessibles publiquement ont été téléchargés dans le dossier de travail `template-source`. Ce téléchargement est une copie des fichiers servis au navigateur, pas le paquet source complet du vendeur. Le manifeste détaille les téléchargements et les ressources absentes (404 dans la démo).

L'adaptation utilise la photo d'accueil, la texture de fond et le bandeau du template dans `images/pizzeria/`. Les typographies sont Fredericka the Great, Abril Fatface et Josefin Sans. Le CSS dédié `css/maestro-pizzeria.css` reprend cette direction avec une navigation accessible et une mise en page responsive. Les anciens plugins ne sont pas nécessaires à cette adaptation statique.

Palette : charbon #181818, noir #050505, texte #f6f3ed, jaune #ffbf26, orange #d94f2b. Composition : grande photographie et titres centrés, sections sombres texturées, carte en trois colonnes sur ordinateur et une sur mobile. Les photos de pizzas, ingrédients, trois prix, coordonnées, horaires et liens de commande proviennent du site Maestro existant.

Cette livraison porte sur la présentation des trois pages publiques. Elle conserve les URL HTML et les chemins relatifs pour fonctionner à la racine ou sous /maestro/. La migration PHP/React et l'administration MySQL restent à implémenter selon ARCHITECTURE.md. Aucun panier, paiement, compte client ou fausse actualité de la démo n'est activé.

## Vérifications

Les 38 noms et les 114 valeurs de prix sont identiques à la version précédente. Toutes les références locales des trois pages existent avec leur casse exacte. Affichages contrôlés dans le navigateur à 1265 px et dans des cadres de 390 px (carte) et 768 px (contact). Liens de navigation, de téléphone, de livraison et de courriel conservés ; courriel de contact corrigé pour utiliser réellement pizza.maestro@yahoo.com.
