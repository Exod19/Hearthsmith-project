# Marque HearthSmith : fichiers et emplacements

Référence visuelle : **`HEARTHSMITH_GUIDE_DE_MARQUE_V2.md`** (Nordic Cottage). Direction retenue : un mélange — base claire du guide V2, ambiance plus riche (bois, feuillage) réservée à la barre latérale et à l'accueil, comme dans les maquettes.

Source des fichiers : dossier Google Drive « Nouvelle image de marque » (24 octobre 2026). Les PNG d'origine des illustrations y restent ; le dépôt garde des versions WebP.

## Logo (`public/brand/`)

| Fichier | Usage |
|---|---|
| `hearthsmith-embleme-ivoire.webp` | Emblème sur fond noyer : barre latérale, barre mobile |
| `hearthsmith-embleme-original.webp` | Emblème en couleurs d'origine, sur fond clair ; source des favicons |
| `hearthsmith-embleme-noyer.webp` | Emblème monochrome noyer, sur fond clair |
| `hearthsmith-wordmark-ivoire.webp` | Mot-symbole sur fond noyer : barre latérale, barre mobile |
| `hearthsmith-wordmark-noyer.webp` | Mot-symbole sur fond clair |
| `hearthsmith-logo-horizontal-{original,noyer,ivoire}.webp` | Emblème + mot-symbole + signature « Cuisiner · Planifier · Partager » |
| `hearthsmith-logo-vertical-original.webp` | Composition verticale avec signature |

Les WebP sont redimensionnés à partir des PNG d'origine ; seule la marge entièrement transparente autour du dessin est retirée, le dessin n'est jamais coupé. Les PNG d'origine sont dans `docs/brand/sources-logo/`. L'ancien emblème illustré est archivé dans `docs/brand/ancien-logo/`.

## Illustrations (`public/hearthsmith/nordic-cottage-v2/illustrations/`)

Registre « atmosphérique » du guide : en-têtes de page et états vides seulement, jamais comme icônes de commande. Chaque fichier existe en 768 px et en `-256` pour l'affichage.

| Fichier | Où |
|---|---|
| `calendrier-menu` | En-tête Semaine |
| `livre-de-recettes` | En-tête et état vide Recettes |
| `panier-epicerie` | En-tête et état vide Épicerie |
| `marmite-meal-prep` | En-tête et état vide Meal prep |
| `famille-logis` | En-tête Membres du logis |
| `cottage-logis` | Disponible (accueil, futurs écrans) |
| `loupe-recherche` | Recherche sans résultat |

## Ornements (`public/hearthsmith/nordic-cottage-v2/ornaments/`)

| Fichier | Usage |
|---|---|
| `coin-branche.webp` | Coin de la bannière d'accueil |
| `separateur-branche.webp`, `cadre-bois.webp`, `cadre-ivoire.webp` | Disponibles ; à utiliser avec parcimonie (le guide proscrit les cadres sur chaque carte) |

## Pictogrammes

Registre « fonctionnel » : SVG au trait dans `src/components/icons.jsx` (1,75 px, `currentColor`), alignés sur la planche `apercu-icones-et-textures.png`.

## Documents (`docs/brand/`)

| Fichier | Rôle |
|---|---|
| `HEARTHSMITH_GUIDE_DE_MARQUE_V2.md` | Guide de référence |
| `HEARTHSMITH_GUIDE_DE_MARQUE_V1_archive.md` | Ancienne direction (archive) |
| `BRIEF_CLAUDE_CODE.md` | Brief d'intégration fourni avec le kit |
| `hearthsmith-design-tokens-v1_reference.css` | Tokens du kit V1 (non importé) |
| `apercu-palettes-et-compositions.png`, `apercu-icones-et-textures.png` | Planches de présentation (ne pas découper) |

## Non intégré

- Texture de grain transparente (`…01_29_59 PM-4.png` dans le Drive) : équivalent de `paper-noise`, exclu par le guide.
- Textures « Lin chaud », « Bois chaleureux », « Pierre douce » : présentes seulement sur la planche d'aperçu, pas en fichiers séparés.
