# Marque HearthSmith : fichiers et emplacements

Référence visuelle : **`HEARTHSMITH_GUIDE_DE_MARQUE_V2.md`** (Nordic Cottage). Le V1 est archivé pour l'historique ; le V2 l'emporte sur le style.

## Documents (`docs/brand/`)

| Fichier | Rôle |
|---|---|
| `HEARTHSMITH_GUIDE_DE_MARQUE_V2.md` | Guide de référence : palette, typographie, composants, responsive |
| `HEARTHSMITH_GUIDE_DE_MARQUE_V1_archive.md` | Ancienne direction « cozy fantasy » (archive) |
| `BRIEF_CLAUDE_CODE.md` | Brief d'intégration fourni avec le kit |
| `hearthsmith-design-tokens-v1_reference.css` | Tokens du kit V1, pour référence (non importé) |
| `apercu-logos-nordic-cottage.webp` | Planche d'aperçu des déclinaisons du logo (image de présentation, ne pas découper) |

## Fichiers servis par le site (`public/`)

| Fichier | Usage dans l'app |
|---|---|
| `brand/Hearthsmith_Full logo.png` | Emblème d'origine (source, ne pas écraser) |
| `brand/Hearthsmith_Wordmark.png`, `brand/Hearthsmith_Full logo with wordmark*.png`, `*_monochrome_black.png` | Fichiers d'origine (sources) |
| `brand/crest.webp` | Emblème allégé, généré depuis l'original sans recadrage (barre latérale, barre mobile) |
| `brand/hearthsmith-wordmark-ivoire.webp` | Mot-symbole ivoire, sur fond noyer (barre latérale, barre mobile) |
| `brand/hearthsmith-wordmark-noyer.webp` | Mot-symbole noyer, pour fonds clairs (impression, documents) |
| `hearthsmith/nordic-cottage-v2/illustrations/livre-de-recettes.webp` (+ `-256`) | Illustration « registre B » : en-tête Recettes, états vides |
| `hearthsmith/nordic-cottage-v2/illustrations/cottage-logis.webp` (+ `-256`) | Illustration « registre B » : en-tête Membres du logis |
| `hearthsmith/textures/*.webp` | Textures d'origine (sources) ; versions allégées dans `textures/` |

Les pictogrammes de commande (registre A) sont dessinés en SVG dans `src/components/icons.jsx` (trait 1,75 px, `currentColor`).

## Manquant

- **Emblèmes Nordic Cottage en fichiers séparés** (PNG transparents : original, noyer, forêt, ivoire, terre cuite, sable ; horizontal, vertical, emblème seul). Seule la planche d'aperçu a été fournie ; l'app garde l'emblème d'origine en attendant.
- Textures `linen-warm.webp`, `wood-warm.webp`, `stone-moss-soft.webp` et ornements SVG annoncés par le guide V2.
