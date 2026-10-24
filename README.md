# Hearthsmith

Planificateur de repas familial : menu de la semaine, recettes, liste d'épicerie, meal prep, profils du logis et assistant IA.

Version en ligne : https://exod19.github.io/Hearthsmith-project/

## Fonctionnalités

- **Semaine** : planifiez déjeuner, dîner, souper et collations en cliquant sur une case. Totaux kcal et protéines par jour, plusieurs semaines possibles.
- **Recettes** : bibliothèque avec recherche par nom ou ingrédient, filtres par moment du repas, photos réduites automatiquement.
- **Épicerie** : liste générée à partir du menu, quantités additionnées et classées par rayon, articles ajoutés à la main, export CSV et impression.
- **Prix et commande** (dans Épicerie) : compare Metro, Maxi et les autres enseignes avec l'API publique [épiceries.ca](https://epiceries.ca/developers). Choix automatique du produit (modifiable), nombre d'emballages, spéciaux, conseils tirés de l'historique de prix, meilleur plan entre magasins, économies par rapport à tout acheter au même endroit, puis liste par magasin pour remplir le panier en ligne produit par produit.
- **Meal prep** : recettes à cuisiner en lot ou au jour le jour, cases à cocher, notes par jour.
- **Logis** : profils des membres (restrictions, aversions, objectifs) et alertes quand un repas du menu entre en conflit avec un profil.
- **Assistant** : crée des recettes, remplit le menu ou propose un plan de meal prep (Groq, OpenAI ou API compatible ; la clé reste dans le navigateur).
- **Réglages** : connexion à l'IA, sauvegarde et restauration en JSON, espace utilisé, remise à zéro.

Les données sont enregistrées dans le `localStorage` du navigateur.

## Développement

```bash
npm install
npm run dev      # serveur local
npm run build    # vérification TypeScript + build de production
npm run lint     # oxlint
```

## Structure

```
src/
  App.jsx               coquille : en-tête, navigation (#/onglet), fenêtres partagées
  state/usePlanner.js   état global, actions et sauvegarde automatique
  data/defaults.js      constantes, profils et recettes d'exemple
  utils/                ingrédients, épicerie, prix (épiceries.ca), nutrition/alertes, stockage, fichiers
  components/           un composant par onglet + ui.jsx (briques communes)
  styles.css            système visuel « Nordic Cottage » (guide de marque V2)
  components/icons.jsx  pictogrammes SVG au trait
public/brand/           logo d'origine + versions allégées (crest.webp, mots-symboles ivoire / noyer)
public/hearthsmith/     textures d'origine et illustrations Nordic Cottage ; public/textures/ = textures allégées
docs/brand/             guide de marque V2, archives et index des fichiers (docs/brand/README.md)
```

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui construit l'app et la publie sur GitHub Pages.
