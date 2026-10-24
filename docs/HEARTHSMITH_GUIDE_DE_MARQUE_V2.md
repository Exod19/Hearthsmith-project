# HEARTHSMITH — GUIDE DE MARQUE 2.0
## Nordic Cottage | Identité, direction artistique et design system

**Édition : 24 octobre 2026**  
**Statut : direction artistique retenue pour production, valeurs techniques proposées à valider dans l'application**  
**Produit : HearthSmith — planification des repas, recettes, épicerie, préparation et vie du logis**  
**Destination : direction de création, intégration React/Vite, Claude Code, fournisseurs de visuels**

> **Principe directeur :** un cottage nordique baigné de lumière d'automne, où l'on cuisine, planifie et partage. Le soin des matières et les traces du fait-main créent la personnalité. La fonctionnalité reste celle d'une bonne application moderne.

> **Priorité absolue :** conserver le logo HearthSmith initialement approuvé. Ne pas remplacer, recadrer, réinventer ou couper l'emblème. Les fichiers d'origine déjà présents dans le dépôt font foi.

---

## 01. Origine, décision et intention

### Ce qui est déjà décidé

- Nom officiel visible : **HearthSmith** (casse exacte).
- Univers : foyer, cuisine, repas partagés, organisation domestique, racines nordiques et légère fantasy.
- Direction actuellement recherchée : **mix Taverne Nordique + Pierre & Forêt**, clarifié par **cottagecore et boho**.
- Évolution demandée : **plus clair, plus naturel, plus automnal et plus chaleureux** que les versions sombres.
- À éviter explicitement : aspect **cartoon**, icônes de jeu vidéo, bronze 3D clinquant, arabesques génératives répétées, surenchère de détails et look « généré par IA ».
- Textures existantes dans `public/hearthsmith/textures/` à préserver; `paper-noise.png` est **exclu**.
- Le logo existant et le wordmark originaux sont à préserver. Une variante antérieure où l'image était coupée n'est **pas** admissible.

### ADN de marque

**Promesse fonctionnelle :** cuisiner, planifier et organiser les repas du foyer sans frictions.  
**Promesse émotionnelle :** rendre l'organisation domestique plus sereine, accueillante et satisfaisante.  
**Personnalité :** humaine, chaleureuse, ingénieuse, terre-à-terre, attentive, jamais théâtrale.  
**Signature éditoriale proposée :** « Cuisiner. Planifier. Partager. »  
**Phrase d'accueil facultative :** « De bons repas pour de belles journées. »

Le résultat doit évoquer un carnet de cuisine ouvert sur une table en chêne, près d'une fenêtre donnant sur les arbres d'automne. **Pas** une interface de jeu de rôle ni un site e-commerce médiéval.

### Les 6 valeurs visuelles

1. **Lumière** : des surfaces claires pour les tâches quotidiennes; les matières foncées encadrent et ancrent.
2. **Authenticité** : imperfection légère, vraie photographie culinaire, matériaux crédibles.
3. **Nature** : feuillages locaux, sauge, mousse, lin, pierre, bois; jamais jungle tropicale.
4. **Chaleur** : terre cuite, lumière dorée, encre brune; aucun néon.
5. **Sobriété** : un détail artisanal vaut mieux que cinq ornements superposés.
6. **Utilité** : l'ergonomie, le contraste et les vraies données l'emportent toujours sur le décor.

---

## 02. Positionnement stylistique

### Mélange attendu

- **45 % Cottage nordique** : calme, maison de campagne, bois naturel, lumière douce, céramique.
- **30 % Pierre & Forêt** : roche, mousse, fougères, herbes, patine végétale.
- **20 % Taverne nordique** : chaleur d'un foyer, noyer, fonte, cuir usé, orange automnal.
- **5 % Fantasy** : mystère discret, symbole du logis, quelques références artisanales.

Ces pourcentages servent uniquement de boussole créative, pas d'algorithme de styles.

### À rechercher

Photographie éditoriale, lumière naturelle latérale, table de bois brossé, détails de lin, bols de céramique mate, casseroles en fonte, feuilles rousses, herbes séchées, bois de noyer, petites pièces de cuivre patiné, typographie avec empattements douce, compositions respirantes.

### À bannir

- Cadres métalliques dorés sur chaque carte; coins celtiques saturés.
- Icônes réalistes hyper-3D en miniature; ombres portées épaisses; fausse gravure spectaculaire.
- Effets « jeu mobile » : boutons en relief exagéré, badges lumineux, gros dégradés.
- Parchemin très taché derrière les listes à cocher ou les tableaux nutritifs.
- Photos générées où les ingrédients paraissent plastiques ou impossibles.
- Motifs répétés mécaniquement sans logique de matière ou de composition.
- Tout texte contenu dans les backgrounds ou images décoratives.

---

## 03. Palette de référence

### Couleurs principales

| Rôle | Nom | Code | Usage |
|---|---|---|---|
| Structure | Noyer profond | `#352A22` | Navigation, contraste fort, texte sur surface claire |
| Action | Forêt profonde | `#344C3C` | Boutons principaux, liens actifs, focus logique |
| Matière | Sauge | `#71816C` | Éléments secondaires, tags, fonds doux |
| Accent | Terre cuite | `#B66743` | Accents automnaux et petits motifs, pas texte long |
| Accent accessible | Argile sombre | `#7C402C` | Liens colorés sur fond clair, informations en accent |
| Fond | Crème | `#F3E8D4` | Grands panneaux, surfaces naturelles |
| Lecture | Ivoire papier | `#FAF6ED` | Cartes, champs, fiches, zones de lecture |
| Fond extérieur | Lin clair | `#EEE5D6` | Fond général de l'application |
| Matière | Sable / lin | `#C5A782` | Bordures fines, séparateurs, tags discrets |
| Matière | Pierre | `#8B8B7B` | Gris minéral pour éléments secondaires |
| Texte | Encre brune | `#2D261F` | Texte courant, titres et valeurs |
| Texte atténué | Encre douce | `#66584C` | Aide, légendes, métadonnées |
| Bordure | Brume de lin | `#D7C9B4` | Bordures standard des cartes |

### Couleurs de statut

| Statut | Code | Règle |
|---|---|---|
| Succès | `#2F6748` | Avec texte et/ou pictogramme |
| Avertissement | `#966124` | Avec texte clair sur panneau et résumé |
| Erreur | `#A13C35` | Réservé aux erreurs réelles |
| Information | `#426478` | Rare et fonctionnel |
| Focus | `#B66743` | Anneau visible, largeur minimale 2 px |

### Distribution des couleurs

**70 % clair / 20 % naturel foncé / 10 % accents**, comme point de départ. Éviter d'assombrir toute la page derrière un parchemin blanc : seules la navigation, les bandeaux d'accueil et quelques cartes d'ancrage doivent être foncés.

**Contraste vérifié :** `#2D261F` sur `#FAF6ED` > 13:1; `#344C3C` sur `#FAF6ED` > 8:1. `#B66743` sur `#FAF6ED` ≈ 3,9:1 : **ne pas utiliser la terre cuite pour le texte courant**. Préférer `#7C402C` pour du petit texte accentué.

---

## 04. Typographie et voix

### Polices de travail

- **Titres et citations éditoriales :** `Lora`, à défaut `Georgia`, puis `serif`. Garamond/Cormorant possibles uniquement si une implémentation cohérente et lisible a été testée. On recherche le livre de cuisine, pas le grimoire.
- **Interface, formulaires, boutons, données :** `Inter`, sinon `system-ui`, puis `sans-serif`.
- **Wordmark :** logo original en image. **Ne pas** reproduire le mot-symbole avec une nouvelle police.
- **Jamais de troisième police décorative** pour les listes, tableaux, ingrédients ou écrans d'assistant IA.

| Élément | Desktop | Mobile | Interligne |
|---|---:|---:|---:|
| Titre d'accueil | 42 px | 31 px | 1,12 |
| H1 page | 34 px | 27 px | 1,16 |
| H2 section | 25 px | 22 px | 1,25 |
| H3 carte | 19 px | 18 px | 1,30 |
| Texte courant | 16 px | 16 px | 1,55 |
| Métadonnée | 14 px | 14 px | 1,45 |
| Micro-légende | 12 px | 12 px | 1,40 |

### Règles de rédaction

- Privilégier les verbes d'action : « Ajouter au menu », « Consulter la recette », « Préparer l'épicerie ».
- Ton francophone québécois naturel, sans médiévalismes inventés.
- Les titres peuvent être chaleureux; les commandes et erreurs doivent être explicites.
- Avertissements de profils : **contextuels**, précis et liés aux repas concernés, sans harceler l'utilisateur à chaque écran.
- Messages de l'IA : transparents sur les ajustements proposés, avec confirmation avant toute modification persistée.

---

## 05. Logo, emblème et usages

### Source de vérité connue

Les fichiers originaux connus par l'application sont :

- `/brand/Hearthsmith_Full logo.png` (emblème original);
- `/brand/Hearthsmith_Wordmark.png` (mot-symbole original);
- `/brand/Hearthsmith_Full logo with wordmark.png` (assemblage, si présent);
- variantes `_copper.png`, `_monochrome_black.png` si présentes dans le dépôt.

**Attention :** les fichiers physiques ne sont pas inclus dans ce pack, car le dépôt source n'a pas été fourni ici. Les chemins documentent les versions réelles à récupérer dans le projet; ils ne garantissent pas leur présence. Le pack ne contient **aucun faux remplacement** du logo.

### Priorités d'intégration

1. Réutiliser exactement le crest + wordmark approuvés et leurs ratios natifs.
2. Tester sur fond crème, fond forêt et fond bois; sur support complexe, fournir une surface unie sous la signature.
3. Créer favicon, versions monochromes et inversion **à partir des originaux** seulement, après vérification, jamais par recadrage approximatif de captures d'écran.
4. Prévoir alternative `HearthSmith` en texte accessible si un fichier manque, sans la présenter comme logo officiel.

**Zone de protection :** au moins une demi-hauteur de l'emblème autour de l'ensemble.  
**Affichage :** `object-fit: contain`, `width: auto`, `height: auto`, jamais `object-fit: cover` pour un logo.  
**Interdit :** recadrage, étirement, extrusion bronze, ombre lourde, animation de rotation, répétition du logo dans toutes les cartes.

---

## 06. Texture, photographie et matériaux

### Bibliothèque existante à vérifier dans le dépôt

| Fichier existant prévu | Usage conseillé en V2 |
|---|---|
| `parchment-bg.webp` | Cartes secondaires, si le grain reste discret |
| `parchment-light.webp` | Fiches et zones de lecture |
| `parchment-aged.webp` | Rarement : intro éditoriale, détails patrimoniaux |
| `dark-wood-bg.webp` | Sidebar ou panneau spécial uniquement |
| `leather-bg.webp` | Petite zone décorative facultative |
| `green-metal.webp` | À rétrograder : trop métallique pour boutons V2 si effet 3D visible |
| `bronze-metal.webp` | À rétrograder : micro-ornement seulement |
| `paper-noise.png` | **Ne pas importer, ne pas utiliser** |

### Nouveaux assets livrés dans ce kit

- `linen-warm.webp` : texture de surface en lin crème, volontairement subtile.
- `wood-warm.webp` : variante de bois plus chaleureuse (recolorisation d'une texture d'ambiance produite précédemment).
- `stone-moss-soft.webp` : texture minérale douce pour un panneau décoratif, non pour du texte dense.
- `botanical-sprig.svg` et `divider-organic.svg` : détails à usage très limité.
- `icons/*.svg` : pictogrammes fonctionnels, sobres, sans effet cartoon.

### Photographies de repas

**Source privilégiée : photographies réelles des repas**, lumière diffuse latérale, vaisselle de céramique, tables de bois/lin, herbes fraîches, cadrage généreux. Ne pas mettre une icône fantasy sur une photo de recette; laisser le repas faire son travail.

**Ratios** : carte repas 4:3 (avec `object-fit: cover`); fiche détail 16:9; portrait membre 1:1; bandeau 16:7 environ, ajustable selon le contenu. Pour les visuels paysage, ne pas insérer de visage ou d'objet important à moins de 15 % des bords.

**Éviter** : mains et objets déformés, nourriture irréaliste, couleurs trop saturées, surfaces mouillées artificiellement, composition répétitive de plusieurs plats identiques.

### Textures en UI

Utiliser une **couleur de fond unie et accessible**, puis une texture légère en arrière-plan, avec `background-size` cohérent. Ne pas superposer plusieurs textures bruyantes ni un filtre de grain global. Les images de texture fournies dans le kit ne doivent pas remplacer les vraies valeurs CSS de surface.

---

## 07. Iconographie

### Deux registres distincts

**Registre A — fonctionnel** : SVG monochrome 20-24 px, traits discrets de 1,65-1,85 px, caps arrondis, aucune ombre, détails minimaux. C'est le registre pour la navigation, les actions, les champs et les chiffres. Les SVG du pack sont prévus pour `currentColor`.

**Registre B — atmosphérique** : photographie d'objets authentiques (casserole, carnet, panier, herbes, bois), à réserver aux tuiles d'accueil, aux bannières et aux états vides. Ne jamais réduire une photo réaliste d'ustensile à 18 px pour en faire une icône.

### Règles

- Même famille de pictogrammes pour tous les modules; ne pas mixer 3D, cartoon et line art.
- Une icône ne doit pas être l'unique indicateur d'un état critique.
- Les icônes ne remplacent pas les libellés de navigation.
- Taille recommandée : 20 px navigation, 18 px métadonnées, 24 px bouton icône; surface tactile 44 × 44 px.
- Chaque icône doit fonctionner en noir, en forêt et en blanc sur sombre.
- Décor botanique et emblème de marque **ne sont pas** des icônes de commande.

---

## 08. Layout, composants et interaction

### Structure générale

- Desktop >= 1024 px : navigation latérale 238-252 px; contenu fluide, largeur de lecture 1280-1440 px max.
- Tablette 641-1023 px : navigation compacte ou tiroir accessible; cartes sur 2 colonnes, fiche détail sur 1 colonne au besoin.
- Mobile <= 640 px : navigation responsive (tiroir ou barre inférieure existante), colonnes uniques, menus et tableaux réorganisés **sans scroll horizontal**.
- Panneaux : marges 24-32 px desktop / 14-18 px mobile; espacement fondamental 8 px.

### Cartes et surfaces

| Composant | Norme |
|---|---|
| Panneau principal | Crème clair, rayon 16 px, bordure 1 px lin, ombre douce chaude |
| Carte repas | Photo 4:3, corps ivoire, H3 serif, métadonnées compactes, vrai bouton accessible |
| Panneau sombre | Forêt/noisette, réservé aux actions phares et récapitulatifs |
| Bouton primaire | Forêt profond, texte crème, rayon 10 px, hauteur min. 44 px |
| Bouton secondaire | Fond ivoire, bordure taupe/lin, texte encre |
| Bouton destructif | Fond crème, texte rouge sombre, confirmation si action irréversible |
| Badge | Fond sauge/lin/terre cuite très pâle; texte brun ou vert sombre |
| Champ | Fond ivoire uni, contour lisible, label extérieur visible, focus 2 px |
| Avertissement | Encadré explicite, titre utile, prochaine action claire; jamais uniquement orange |
| État vide | Illustration discrète ou icône; titre + explication + une action |

### Mouvement

- Transitions : 120-180 ms pour les contrôles; 180-240 ms pour l'ouverture de panneaux.
- Pas de particules, braises en mouvement, clignotements, animations décoratives infinies.
- Respecter `prefers-reduced-motion`; aucune transition ne doit bloquer une saisie.

### Performance

- WebP pour photos/textures, SVG pour icônes, `loading="lazy"` hors écran, `fetchpriority="high"` uniquement pour vraie image héro.
- Pas de background 4K sur toutes les pages; dimensionner selon affichage réel.
- Ne pas importer une planche d'icônes entière et la découper avec CSS; utiliser les fichiers SVG individuels.
- Toujours prévoir fallback de couleur si fichier image manquant.

---

## 09. Modules applicatifs

### Accueil / Tableau de bord

Hero **modéré** (pas plein écran), ambiance lumineuse sur une portion de l'écran; accès direct aux repas et au menu, récapitulatif utile. Une seule action primaire dominante par zone.

### Bibliothèque des repas

Grille de 3-4 cartes desktop, 2 tablettes, 1 mobile. Image, titre, temps, portions, éventuels tags; favoris et menu accessibles sans déborder sur l'image. Vérifier le contenu en l'absence de photo.

### Fiche repas

Photo généreuse mais non écrasante; blocs bien séparés : infos, ingrédients, préparation, nutrition, conservation, notes. Les macros doivent rester en données HTML, pas des valeurs peintes sur une image. Une interaction pour modifier les portions; respect de l'accessibilité des listes cochées.

### Menu hebdomadaire

Sept jours visibles sur grand écran si la largeur le permet; sur mobile, navigation jour par jour ou scroll avec focus clair. Ne pas placer 7 colonnes miniatures illisibles sur téléphone.

### Épicerie

Rendre la tâche rapide : groupement par rayon, grands checkboxes, portions et quantités lisibles. Éviter la texture bois sous une liste dense.

### Meal prep

Décomposer par tâches réelles, temps estimé et dépendances. Privilégier une chronologie ou checklist claire. Les ornements ne doivent jamais masquer le statut d'une tâche.

### Membres du logis

Portraits au premier plan, cartes humaines et chaleureuses; informations importantes visibles mais sans stigmatisation ni avertissements répétitifs. Alertes alimentaires contextuelles lors de la planification de repas et consultables sur le profil.

### Assistant IA

Même style de panneaux que le reste de l'application, messages distincts mais non futuristes. Configuration du fournisseur/clé dans les paramètres globaux, non un écran isolé. Toute génération ou modification doit présenter un aperçu et une validation avant écriture en base.

### Paramètres, images et exports

Interface calme et très fonctionnelle : formulaires contrastés, états de sauvegarde visibles, navigation fiable, import/export sans surprises. Les couleurs de marque ne doivent pas masquer les champs techniques.

---

## 10. Responsive et accessibilité

### Paliers de test obligatoires

- **360 × 800** : téléphone compact;
- **390 × 844** : téléphone courant;
- **768 × 1024** : tablette portrait;
- **1024 × 768** : tablette paysage;
- **1366 × 768** et **1440 × 900** : desktop;
- **1920 × 1080** : grand écran.

### Critères de validation

- Aucun scroll horizontal incontrôlé; aucun élément de navigation inaccessible.
- Touch targets de 44 px si possible; labels explicites; focus clavier visible.
- Contraste WCAG AA : texte normal 4,5:1; texte large et contrôles pertinents 3:1.
- Images avec `alt` utile (pas « image recette »); ornements avec `aria-hidden` ou fond CSS.
- Fonctionnement sans texture et sans photographie (grâce aux couleurs de secours).
- Aucun texte intégré à une image décorative; zoom 200 % sans perte d'action principale.
- Réduction d'animation respectée; état d'erreur communiqué autrement que par couleur.

---

## 11. Règles anti-« look IA »

1. **Réduire les artifices.** Un fond de matière, une bordure délicate et un bon espacement suffisent.
2. **Ne pas rendre tout symétrique.** Les compositions photographiques peuvent être légèrement asymétriques; les grilles UI restent géométriquement cohérentes.
3. **Refuser les images trop parfaites.** Préférer de vrais matériaux, vrais ingrédients, petits défauts d'usage.
4. **Pas de bronze liquide.** Le cuivre est un accent de matière, pas un filtre de rendu.
5. **Éviter la surcharge médiévale.** Une petite référence nordique par grand écran est suffisante.
6. **Pas de textes inventés dans les visuels.** Tous les libellés sont rendus en HTML et modifiables.
7. **Pas de composants sans fonction.** Une décoration n'imite jamais un bouton.
8. **Alignements humains et précis.** L'impression d'artisanat vient des matériaux, pas de grilles mal alignées.
9. **Laisser respirer les recettes.** La photo du repas est le héros, pas le cadre.
10. **Tester à taille réelle.** Une icône détaillée peut être belle en 300 px et illisible en 20 px.

---

## 12. Système de fichiers, migration et gouvernance

### Arborescence cible dans React/Vite

```text
public/
  brand/
    Hearthsmith_Full logo.png                 # EXISTANT, NE PAS ECRASER
    Hearthsmith_Wordmark.png                  # EXISTANT, NE PAS ECRASER
  hearthsmith/
    textures/                                 # TEXTURES EXISTANTES
      parchment-bg.webp
      parchment-light.webp
      parchment-aged.webp
      dark-wood-bg.webp
      leather-bg.webp
      green-metal.webp
      bronze-metal.webp
    nordic-cottage-v2/
      textures/
        linen-warm.webp
        wood-warm.webp
        stone-moss-soft.webp
      icons/
        *.svg
      ornaments/
        botanical-sprig.svg
        divider-organic.svg

src/
  styles/
    hearthsmith-nc-tokens.css                 # import 1 fois
    hearthsmith-nc-components.css             # opt-in sous .hs-nc
```

### Ordre d'implémentation

**0. Audit** : lister les vrais fichiers, composants, styles, routes, points de sauvegarde et dépendances.  
**1. Tokens** : intégrer la nouvelle palette et les surfaces sans écraser les anciennes variables tant qu'elles sont utilisées.  
**2. Composants pilotes** : sidebar, barre de navigation, panneau, bouton, champ, carte repas; faire valider desktop/mobile.  
**3. Déployer** : menu hebdomadaire, épicerie, meal prep, membres, IA, paramètres.  
**4. Vérifier** : persistance, changements d'onglet, chargement d'images, import/export, accessibilité, responsive.  
**5. Nettoyer** : retirer seulement les styles réellement obsolètes après vérification.

### Non-régression technique

- Ne pas modifier les clés `localStorage` ou la structure des données pendant la refonte purement visuelle.
- Ne pas déplacer des images persistées ou changer le mécanisme d'hébergement.
- Ne pas changer les URLs de fichiers sans mise à jour testée.
- Ne pas casser la configuration globale de l'assistant IA ni son accès depuis les autres modules.
- Préférer un namespace CSS V2 (`.hs-nc` / `--hs-nc-*`) plutôt que d'écraser aveuglément les classes existantes.
- Garder un point de retour Git avant changements; commits ciblés par composant.

---

## 13. Critères d'acceptation et validation finale

La V2 est prête seulement si :

- [ ] Le logo initial apparaît intact, net, jamais rogné.
- [ ] La page paraît **plus lumineuse** que les maquettes Taverne Nordique sombres.
- [ ] La palette rappelle **forêt d'automne + cottage chaleureux**, pas RPG médiéval.
- [ ] Les icônes de commande fonctionnent à 20-24 px et n'ont pas d'allure cartoon.
- [ ] Aucune bordure dorée dominante, aucun cadre 3D envahissant.
- [ ] Les recettes, quantités et macros sont lisibles sans effort.
- [ ] Épicerie/meal prep sont réellement pratiques sur téléphone.
- [ ] Aucun écran ne dépend d'une image pour comprendre une action.
- [ ] L'interface fonctionne au clavier et avec `prefers-reduced-motion`.
- [ ] Aucune donnée utilisateur ou connexion IA n'est affectée.
- [ ] Le guide, les tokens et le code d'exemple utilisent les mêmes couleurs et noms.

---

## 14. Statut et décisions ouvertes

**Direction approuvée pour exploration :** Nordic Cottage, mélange cottagecore-boho + Pierre & Forêt + chaleur automnale de Taverne Nordique.  
**En attente de validation sur le vrai dépôt :** intégration du logo original, contraste sur chaque surface actuelle, présence des textures listées, compatibilité CSS avec les composants du projet.  
**À ne pas interpréter comme acquis :** les recettes, valeurs nutritives et contenus des maquettes conceptuelles; elles sont illustratives et non des données métier.

**Document de référence :** cette spécification prime sur les anciennes directions très sombres ou très métalliques pour le style, mais **pas** sur les fonctionnalités, les assets officiellement retenus ni sur les décisions explicites de l'utilisateur.
