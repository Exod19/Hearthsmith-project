# HEARTHSMITH — GUIDE DE MARQUE ET DESIGN SYSTEM

**Version :** 1.0 — 24 octobre 2026  
**Statut :** spécification de référence destinée à Claude Code  
**Périmètre :** interface web React/Vite, desktop, tablette et mobile  
**Langue de l'interface :** français (Québec)

> **Directive prioritaire pour Claude Code :** respecter le logo original et les assets existants. L'objectif est de rendre l'application actuelle cohérente et immersive **sans refaire sa logique métier, sans supprimer ses fonctionnalités et sans briser sa persistance de données**. Les fichiers cités dans ce guide doivent être vérifiés dans le dépôt avant utilisation. Ne jamais inventer un nom ou un chemin d'asset.

## 0. Décisions établies et propositions de normalisation

Ce guide consolide les orientations déjà retenues pour HearthSmith et ajoute des normes de production. Pour éviter de transformer des propositions antérieures en faux acquis :

- **Établi :** marque HearthSmith; ambiance fantasy/viking chaleureuse; foyer, cuisine, repas et vie quotidienne; logo d'origine à conserver; bois sombre, parchemin, cuivre/bronze, vert forêt; design détaillé mais lisible; fonctionnement responsive irréprochable.
- **Établi :** textures téléversées sous `public/hearthsmith/textures/` à l'exception de `paper-noise.png`, qu'il ne faut **pas** utiliser. Les fichiers exacts sont à vérifier dans le dépôt.
- **Établi :** logo/wordmark existants sous `public/brand/` dans des variantes nommées plus bas; ne pas recadrer ni redessiner.
- **Direction recommandée dans ce document :** codes hexadécimaux définitifs, échelles de typographie, mesures CSS, règles de composants, breakpoints, accessibilité et animations. Ce sont des **standards de mise en œuvre proposés**, pas une affirmation qu'ils sont déjà codés ou formellement approuvés.
- **À vérifier :** les cadres PNG, notamment `corner-gold.png`, peuvent être prévus sans être présents dans le dépôt. Prévoir une solution CSS élégante si absents.

---

## 1. ADN de marque

### 1.1 Essence

**HearthSmith est l'atelier du foyer.** Une application qui aide un ménage à organiser ses repas, ses besoins, ses routines et sa logistique quotidienne comme on entretient un foyer : avec soin, méthode et chaleur.

**Promesse émotionnelle :** transformer des corvées domestiques en un rituel simple, serein et satisfaisant.

**Positionnement visuel :** *cozy Nordic fantasy*, entre une maison longue nordique accueillante, un carnet de cuisine ancien et une application moderne, rapide et fiable.

**Mots-clés :** chaleureux, artisanal, fiable, accueillant, tangible, organisé, immersif, rustique raffiné, lisible.

**Ce que HearthSmith n'est pas :** jeu vidéo médiéval, interface RPG bruyante, grimoire illisible, esthétique gothique/grimdark, site de restaurant, dashboard SaaS froid, démo générée avec effets décoratifs gratuits.

### 1.2 Principes immuables

1. **Utilité avant décor.** L'utilisateur doit accomplir une action quotidienne en quelques secondes.
2. **L'immersion vient des matières.** Bois, parchemin, cuir et métaux racontent l'univers; les contrôles restent contemporains.
3. **Un foyer, une marque.** Chaque module appartient au même produit, pas à une application différente.
4. **Raffinement plutôt que surcharge.** Les ornements marquent les moments importants, pas chaque cellule.
5. **Responsive natif.** Aucun écran n'est une réduction miniature du desktop.
6. **Humain avant magique.** Les membres du foyer, les vraies photos et les repas sont plus importants que des illustrations fantasy génériques.
7. **Fiabilité visible.** Les états de sauvegarde, d'erreur, de confirmation et de chargement sont explicites.

### 1.3 Sensation recherchée

L'ouverture de l'application doit évoquer une table de bois sombre sur laquelle repose un carnet de recettes en parchemin. Des accents de cuivre attrapent la lumière; les actions utiles se distinguent en vert forêt. L'ensemble est accueillant, lumineux au centre, profond en périphérie. Pas d'ambiance lugubre, pas de runes clignotantes.

---

## 2. Architecture de marque et nomenclature

**Marque-mère :** HearthSmith (casse officielle dans l'interface et le code de marque; éviter les variations Hearthsmith / Hearth Smith sur les surfaces visibles).

**Modules actuels ou déjà envisagés :**

| Espace | Rôle | Traitement visuel |
|---|---|---|
| Tableau de bord / Le foyer | Vue d'ensemble, priorités, actions rapides | Panneau d'accueil, éléments principaux bien hiérarchisés |
| Menu hebdomadaire | Planification des repas et rotations | Grille de jours desktop, navigation par jour mobile |
| Bibliothèque des repas | Cartes et fiches repas, photos, macros | Photos généreuses, métadonnées compactes |
| Liste d'épicerie | Liste issue des menus, cases à cocher | Forte lisibilité et grands contrôles tactiles |
| Meal prep / Préparation | Séquence des tâches de cuisine | Checklist et étapes chronologiques |
| Créateur de menu | Construction et ajustements | Processus clair, étapes et confirmations |
| Membres du logis | Profils, préférences et contraintes | Portraits, fiches personnelles, alertes utiles |
| Assistant IA | Conversation et actions proposées | Même langage de panneaux, messages faciles à distinguer |
| Paramètres | Configuration commune de l'app | Formulaires fonctionnels et explicites |
| Images / Exportations | Gestion des médias et données | Outils secondaires, sans style visuel discordant |

**Principe :** n'ajouter un module à la navigation que s'il existe réellement. Conserver les libellés actuellement fonctionnels lorsque leur changement impliquerait des régressions. Harmoniser graduellement la nomenclature visible sans changer les clés de données internes.

**Voix de l'interface :** chaleureuse, brève, rassurante, jamais caricaturale. « Ajouter un repas », « Planifier la semaine », « Voir le profil », « Préparer l'épicerie ». Les allusions fantasy sont réservées aux titres d'accueil, illustrations ou petites touches éditoriales; éviter « Ô valeureux voyageur » dans les formulaires.

---

## 3. Logo et identité primaire

### 3.1 Sources de vérité

Rechercher d'abord les versions originales dans `public/brand/`, notamment :

- `Hearthsmith_Full logo.png`
- `Hearthsmith_Wordmark.png`
- `Hearthsmith_Full logo with wordmark.png`
- variantes `_copper.png` ou monochromes si elles sont effectivement présentes.

**Important :** ces noms proviennent de travaux antérieurs; vérifier la casse, les espaces et les fichiers réellement présents. La version retenue de référence est **le premier logo original apprécié**, et non une reproduction ultérieure qui modifiait le symbole ou coupait le visuel.

### 3.2 Règles d'emploi

- **Header desktop :** signature horizontale officielle, à gauche. Variante claire/cuivre si le fond est sombre et si elle est lisible.
- **Navigation mobile :** emblème compact existant, ou wordmark suffisamment petit pour tenir sans compression; ne pas fabriquer un emblème par crop destructif.
- **Écran d'accueil / présentation :** logo complet si l'espace le justifie; jamais au détriment du contenu.
- **Favicon :** fichier d'emblème dédié si présent, sinon conserver le favicon existant jusqu'à validation.
- **Interdits :** étirer, rogner, redessiner, ajouter des halos agressifs, ombres opaques, biseaux, traductions du nom ou logos différents par module.
- **Espace de protection recommandé :** au moins 0,5 fois la hauteur visuelle de l'emblème autour du logo.
- **Largeur cible recommandée :** 170–235 px pour une signature horizontale desktop; adapter à son ratio réel. Minimum de lisibilité évalué visuellement, non imposé au pixel au détriment du fichier.

**Implémentation :** utiliser `width: auto`, `height: auto`, `max-width: 100%`, `object-fit: contain`; prévoir des conteneurs qui ne coupent jamais l'image. Éviter `overflow: hidden` sur un parent trop étroit du logo.

---

## 4. Palette couleur canonique de travail

Cette palette harmonise les directions antérieures. Les rôles sémantiques priment sur le nombre exact de couleurs. **Ne pas multiplier les bruns et les ors légèrement différents d'une page à l'autre.**

| Token | Hex | Usage |
|---|---|---|
| `--hs-wood-deep` | `#1B1008` | Fond de navigation, grandes zones sombres |
| `--hs-wood` | `#25160C` | Sidebar, surfaces sombres secondaires |
| `--hs-wood-raised` | `#352012` | Relief discret, hover sur fond sombre |
| `--hs-canvas` | `#F5EFE4` | Fond général de contenu |
| `--hs-parchment` | `#FFF8EA` | Cartes principales claires |
| `--hs-parchment-mid` | `#F8ECD5` | Panneaux et niveaux secondaires |
| `--hs-parchment-aged` | `#ECD8B6` | Accents de vieux papier, encarts |
| `--hs-ink` | `#2B1608` | Titres et corps sur fond clair |
| `--hs-ink-muted` | `#634A32` | Informations secondaires sur fond clair |
| `--hs-copper` | `#B96F2C` | Accent décoratif, surlignement limité |
| `--hs-copper-light` | `#E3A45C` | Filets, reflets sur fond sombre |
| `--hs-copper-dark` | `#794219` | Texte accentué sur parchemin |
| `--hs-gold` | `#C28A36` | Cadres et distinctions importantes |
| `--hs-forest` | `#244F36` | Actions principales et éléments actifs |
| `--hs-forest-hover` | `#35623E` | Hover vert |
| `--hs-forest-dark` | `#183925` | Pressed / profondeur vert |
| `--hs-danger` | `#922F26` | Erreurs, restrictions, blocages |
| `--hs-warning` | `#925B19` | Avertissements |
| `--hs-success` | `#24603D` | Confirmation et réussite |
| `--hs-info` | `#305E72` | Information neutre quand nécessaire |
| `--hs-border` | `#BDA27B` | Bordures sur parchemin |
| `--hs-border-dark` | `#80552C` | Bordures sur surfaces sombres |
| `--hs-on-dark` | `#FFF3DC` | Texte principal sur bois sombre |

### 4.1 Distribution visuelle

Cible illustrative : **60 % surfaces papier / 25 % bois sombre / 10 % vert forêt / 5 % cuivre-or et états.** Ce n'est pas une règle de peinture rigide : c'est une discipline de sobriété.

- **Vert forêt = action.** Boutons primaires, état sélectionné, étape active.
- **Cuivre/or = identité et mise en valeur.** Contours décoratifs, petites lignes, icônes ponctuelles, jamais tous les boutons.
- **Rouge = véritable attention.** Ne pas utiliser comme décoration viking.
- **Brun foncé = encre.** Texte sur papier et structure.

### 4.2 Contraste

Viser WCAG AA : texte standard au moins 4,5:1 et texte large/éléments graphiques nécessaires au moins 3:1. Ne pas supposer que du cuivre clair sur parchemin est lisible. **Éviter `--hs-copper` et `--hs-gold` pour du texte courant sur papier**; préférer `--hs-copper-dark` ou `--hs-ink`.

Les statuts ne doivent jamais dépendre uniquement de la couleur : ajouter libellé et, au besoin, icône.

---

## 5. Typographie

**Recommandation normative :** deux polices opérationnelles et une troisième seulement pour de rares textes éditoriaux.

| Niveau | Police recommandée | Style |
|---|---|---|
| Marque (wordmark) | Fichier logo original | Ne pas reconstruire en texte |
| Titres H1–H3 | `Cinzel`, fallback Georgia, serif | Majestueux mais sobre, graisses 500–700 |
| Corps / boutons / formulaires / données | `Inter`, fallback system-ui, sans-serif | Moderne, précis, très lisible |
| Citation / intro éditoriale, facultatif | `Alegreya`, fallback Georgia, serif | Chaleureux, à utiliser rarement |

**Ne pas** appliquer une police décorative aux listes d'épicerie, ingrédients, macros, champs de saisie, horaires, libellés de navigation ou texte d'IA.

### 5.1 Échelle recommandée

| Token | Desktop | Mobile | Usage |
|---|---:|---:|---|
| `display` | 40 px | 30 px | Grand accueil seulement |
| `h1` | 32 px | 26 px | Titre de page |
| `h2` | 25 px | 22 px | Sections |
| `h3` | 20 px | 18 px | Titres de cartes |
| `body` | 16 px | 16 px | Texte normal |
| `small` | 14 px | 14 px | Métadonnées |
| `micro` | 12 px | 12 px | Très rares labels secondaires |

Interlignage du corps : 1,5–1,65. Titres : 1,1–1,25. Le texte des actions importantes reste à 15–16 px. Éviter de forcer les H1 en capitales; limiter les majuscules aux petits en-têtes.

---

## 6. Matières, textures et profondeur

### 6.1 Inventaire des textures existantes à vérifier

**Racine disque :** `public/hearthsmith/textures/`  
**Chemin CSS/Vite correspondant :** `/hearthsmith/textures/`

| Fichier | Dimensions initialement prévues | Usage |
|---|---:|---|
| `parchment-bg.webp` | 2048 × 2048 | Fond de cartes/panneaux parchemin |
| `parchment-light.webp` | Selon fichier | Grands panneaux plus clairs, formulaires |
| `parchment-aged.webp` | Selon fichier | Fiches, éléments narratifs, encarts |
| `dark-wood-bg.webp` | 2048 × 2048 | Sidebar, topbar, surfaces foncées |
| `leather-bg.webp` | Selon fichier | Éléments secondaires, bandeaux très ponctuels |
| `green-metal.webp` | 1024 × 1024 | Boutons primaires, onglets actifs, détails interactifs |
| `bronze-metal.webp` | 1024 × 1024 | Bordures, séparateurs, petites décorations |

**Ne pas utiliser `paper-noise.png` :** ce fichier a été explicitement écarté.

### 6.2 Règles de rendu

- Texture **subtile**, jamais au détriment du contraste. Un panneau doit d'abord être lisible comme un panneau clair.
- Préférer les motifs répétés (`background-repeat: repeat`) à un `background-size: cover` qui étire la matière et provoque des changements d'échelle entre écrans.
- Prévoir un **fond couleur de secours** sous chaque image de texture.
- Une texture ne doit pas être appliquée au texte, aux images de repas ou aux portraits.
- Bois sombre principalement sur navigation et couronne extérieure; parchemin sur zones de travail; cuir pour un détail occasionnel; vert métallique pour actions; bronze pour bordures.
- Éviter les doubles effets : texture forte + dégradé fort + ombre forte + cadre or épais sur le même composant.
- Sur écran mobile, réduire les ornements avant de réduire le texte.

### 6.3 Relief, bordures, arrondis

- Cartes standard : rayon **12–16 px**, bordure 1 px brun clair, ombre douce.
- Panneau héro / profil important : rayon **16–20 px**, bordure discrète double ton ou décoration de coin limitée.
- Champs de formulaires : rayon **8–10 px**, surface claire unie pour soutenir la saisie.
- Bouton : rayon **9–12 px**; jamais ultra-pill systématique.
- Ombres : chaudes, peu saturées, avec opacité faible; jamais une grosse ombre noire uniforme sur toutes les cartes.
- Séparateurs : trait cuivre/brun fin ou petit motif central; pas de runes sur chaque ligne.

### 6.4 Cadres, coins et images transparentes

Emplacement envisagé : `public/hearthsmith/frames/`.

| Asset | Statut | Usage |
|---|---|---|
| `corner-gold.png` (256 × 256 PNG transparent) | Prévu; existence à vérifier | Coins décoratifs des panneaux de prestige |
| `corner-bronze.png` | Optionnel; vérifier | Alternative plus discrète |
| `divider-rune.png` | Optionnel; vérifier | Séparateur de chapitre ou section principale |
| `portrait-frame-round.png` | Optionnel; vérifier | Portrait de membre |
| `portrait-frame-small.png` | Optionnel; vérifier | Avatar compact |
| `panel-border.png` | Optionnel; vérifier | Cadres extensibles **si** véritable 9-slice |
| `button-border.png` | Optionnel; vérifier | Ornement adaptable **si** disponible |

Un coin PNG est un overlay avec `pointer-events: none`; utiliser une seule image avec rotation CSS si les quatre coins le permettent. Les ornements ne doivent pas masquer un bouton, une photo, un titre ou la zone de focus. Si le PNG manque, **ne pas produire de référence cassée** : la bordure CSS suffit.

**Règle de fabrication future :** textures seamless, cadres/coins transparents, icônes sans texte, boutons sans texte intégré, badges sans texte intégré, portraits carrés haute résolution. Le texte demeure HTML, jamais dessiné dans une texture.

---

## 7. Iconographie et photographie

### 7.1 Icônes

- Style cohérent : ligne claire, traits 1,75–2 px, géométrie sobre, silhouettes reconnaissables à 20 px.
- Une famille d'icônes standard (ex. Lucide déjà installé, sinon bibliothèque utilisée par le projet) pour l'interface opérationnelle.
- Assets fantasy personnalisés seulement pour identités de modules, grandes cartes ou états vides : maison, chaudron/repas, panier, bouclier, feuille, plume, étincelle IA.
- Les runes et symboles décoratifs n'ont **pas** à remplacer une icône de navigation évidente.
- Ajouter texte ou libellé accessible à chaque icône-action.

### 7.2 Photos de repas

- Photographie crédible, appétissante, naturelle; pas de faux repas illustrés façon RPG par défaut.
- Ratios de référence : **4:3** pour cartes de bibliothèque, **16:9** pour bandeaux éditoriaux, **1:1** pour miniatures carrées.
- `object-fit: cover` pour les repas, avec focalisation pertinente, jamais étirement.
- Prévoir un placeholder HearthSmith discret si photo absente, et garder le titre visible.
- Respecter les images téléversées et leur persistance : changement de style ne doit jamais perdre un média.

### 7.3 Membres du logis

- Les photos/portraits représentent des personnes, pas des avatars interchangeables.
- L'esthétique fantasy est permise (costumes doux, lumière de foyer, arrière-plan de maison longue), **mais la ressemblance et la personnalité restent prioritaires**.
- Portraits source carrés, recadrage réversible dans le composant; ne jamais déformer visage ou proportions.
- Sur fiche principale, photo au moins 112–160 px desktop, 96–128 px mobile selon la place.
- Alt text pertinent; ne pas injecter d'informations de santé dans les alt texts.

---

## 8. Grille, espacements et responsive

### 8.1 Système d'espacements

Échelle recommandée, en px : **4 / 8 / 12 / 16 / 24 / 32 / 48 / 64**. Éviter les marges ad hoc par composant. Les contenus dense utilisent 8–12 px; panneaux 16–24 px; sections 24–40 px.

### 8.2 Architecture des écrans

| Largeur CSS | Comportement |
|---|---|
| `>= 1440px` | Sidebar 248–272 px, zone centrale fluide; panneau latéral contextuel possible si utile |
| `1024–1439px` | Sidebar compacte ou repliable; contenu 2 colonnes pour cartes, pas d'excès de panneaux |
| `768–1023px` | Navigation tablette repliable, grilles 1–2 colonnes selon contenu |
| `480–767px` | Une colonne principale, navigation mobile, actions visibles |
| `< 480px` | Design compact prioritaire; espace latéral 12–16 px; aucun tableau large non adapté |

**Ce sont des breakpoints de comportement, pas des tailles de téléphone à cibler littéralement.** Le contenu doit s'adapter à toute largeur intermédiaire. Utiliser `minmax`, `auto-fit`, `clamp`, conteneurs flexibles et query basées sur la largeur utile.

### 8.3 Navigation

- **Desktop :** topbar sombre avec marque + sidebar sombre où le menu actif est très clair.
- **Tablette :** sidebar rétractable / drawer accessible au clavier.
- **Mobile :** header compact et menu accessible; possibilité de barre inférieure limitée à 3–4 destinations principales + « Plus », pas 9 icônes minuscules.
- Navigation active : fond vert forêt ou reflet vert métallique avec texte contrasté, accent cuivre léger.
- Toujours montrer où l'utilisateur se trouve, même lorsque les décorations ne chargent pas.

### 8.4 Règles impératives

- Pas de débordement horizontal de page à 320–390 px.
- Les tables de données complexes deviennent listes de cartes, accordéons ou défilement **local identifié**, jamais une page entière à faire glisser horizontalement.
- Zone tactile visée : **44 × 44 px minimum** pour les actions principales.
- Le texte ne doit pas passer sous les cadres/corners.
- Les modales remplissent prudemment l'écran mobile, avec scroll interne et actions accessibles.
- Tester zoom navigateur **200 %** sans perte de fonctionnalité.
- Respecter les `safe-area-inset-*` sur mobiles qui en ont.

---

## 9. Bibliothèque de composants UI

Tous les composants doivent partager les mêmes tokens : fond, bordure, rayons, typo, focus, états et espacements. Utiliser un préfixe (`hs-`) et des noms de classes cohérents pour ne pas casser l'existant.

### 9.1 Panneaux et cartes

- **Panel standard :** parchemin, bordure discrète, titre sombre, ombre faible.
- **Panel prestige :** parchemin avec quelques détails cuivre/coin doré, pour l'accueil, le grand portrait, les moments de synthèse.
- **Card repas :** photo prioritaire, titre, informations clés, action évidente; pas de grosses bordures fantasy dans une grille dense.
- **Card membre :** portrait, prénom, rôle éventuel, préférences résumées, nombre de points à surveiller sans divulgation excessive.
- **Card indicateur :** valeur + label + contexte; pas d'immenses tuiles KPI pour des informations triviales.

### 9.2 Boutons

| Variante | Visuel | Usage |
|---|---|---|
| Primaire | Vert forêt, éventuellement texture `green-metal.webp`, texte ivoire | Sauvegarder, générer, confirmer, planifier |
| Secondaire | Parchemin, contour cuivre/brun foncé, texte brun | Modifier, consulter, retour |
| Tertiaire | Texte / icône sans fond lourd | Actions légères dans cartes |
| Danger | Rouge sobre, libellé explicite | Supprimer ou action irréversible |
| Désactivé | Contraste réduit mais lisible, pas de hover trompeur | Action impossible en contexte |

Le bouton primaire doit être unique ou clairement dominant dans chaque zone d'action. Ne pas remplacer les labels par des icônes seules sur les actions importantes.

### 9.3 Champs et formulaires

- Libellé au-dessus du champ; placeholder = exemple, pas seule étiquette.
- Bordure nette et focus visible; erreurs affichées près du champ avec texte correctif.
- Spacing confortable, formulaires segmentés en groupes simples.
- Inputs clairs **sans texture dense derrière le texte saisi**.
- Ne jamais utiliser les cadres ornementaux pour des menus déroulants, cases à cocher ou champs numériques.

### 9.4 Statuts et alertes

- **Succès :** vert, message bref, confirmation de l'action.
- **Information :** neutre, contextualisée.
- **Avertissement :** ambre, action proposée.
- **Erreur :** rouge, conséquence et correction possible.

Les alertes de profils doivent apparaître **à l'endroit où elles changent une décision** (menu, fiche repas, liste d'épicerie, préparation), pas seulement sur la fiche « Membres du logis ». Éviter d'afficher 5 fois la même alerte sur le même écran; préférer un résumé ouvrable avec détail. Les informations personnelles sensibles ne doivent pas être révélées inutilement sur le tableau de bord partagé.

### 9.5 Dialogues, notifications et états vides

- Confirmation requise pour action destructive ou modification massive.
- Toast non bloquant pour succès simple; message persistant en cas d'échec de sauvegarde.
- Placeholder / skeleton discret, compatible `prefers-reduced-motion`.
- État vide concret : « Aucun repas enregistré » + action « Créer un repas ». Une petite illustration est facultative.
- Mode hors ligne / erreur réseau / IA indisponible : expliquer le problème et offrir une issue sans faire croire que l'action a réussi.

---

## 10. Direction par écran

### 10.1 Tableau de bord — « Le foyer »

Le premier écran doit donner une lecture immédiate du quotidien : semaine planifiée, prochains repas, état de l'épicerie, tâches de préparation, actions rapides, alertes pertinentes. Prioriser 1 action du moment, puis les éléments de contexte. Une grande décoration hero ne doit pas repousser le menu sous la ligne de flottaison sur mobile.

### 10.2 Menu hebdomadaire

- Desktop : jours côte à côte si la largeur le permet; sinon grille de jours claire.
- Mobile : jour choisi via onglets horizontaux accessibles, liste verticale ou accordéons; jamais 7 colonnes microscopiques.
- Visuels des repas assez grands pour distinguer les plats, mais jamais au détriment des titres.
- Afficher clairement date/jour, repas, portions, badge d'alerte, actions de déplacement ou d'édition.
- Les rotations doivent être identifiables sans surcharger l'interface.

### 10.3 Bibliothèque des repas et fiche repas

- Bibliothèque : recherche/filtres avant grille, cartes photo 4:3, nom, temps, portions, caractéristiques utiles.
- Fiche détaillée : photo, description, portions, ingrédients, étapes, macros et préférences/contraintes liées au foyer.
- Les macros sont des valeurs structurées et alignées (pas un parchemin illustré difficile à lire).
- Si champ IA suggéré, le distinguer de l'information validée par l'utilisateur.
- Bouton d'ajout au menu facilement identifiable.

### 10.4 Liste d'épicerie

- Fonctionnelle avant tout : catégories, quantités, cases à cocher, statut acheté / à acheter, édition manuelle.
- Éviter le style « manuscrit » pour les ingrédients.
- Le mobile doit permettre de cocher facilement une ligne d'une main.
- Contrastes efficaces en magasin, sous différentes conditions d'éclairage.

### 10.5 Meal prep / Préparation

- Démarrer par « À préparer cette semaine » et estimation / séquence des tâches si disponibles.
- Étapes claires avec progression, durées et actions à cocher.
- Regrouper intelligemment les opérations communes sans perdre le lien avec les repas.
- Option d'impression sobre et lisible, avec peu ou pas de textures pour économiser l'encre.

### 10.6 Membres du logis

- **Carte membre :** portrait, nom, préférences utiles, lien vers « Portrait du membre ».
- **Portrait du membre :** identité humaine en haut, puis sections bien séparées : goûts, besoins, portions, restrictions, routines, notes et paramètres pertinents.
- Les profils sont une **source de référence partagée** qui peut influencer repas, menu, liste d'épicerie, préparation et assistant IA.
- **Assistant du profil :** conversation ou recommandations présentées dans un panneau relié au membre, sans donner l'impression d'un second service IA déconnecté.
- Les avertissements sont contextualisés partout où ils sont utiles, et détaillés dans la fiche du membre.

### 10.7 Assistant IA

- Même direction visuelle que le reste; panneau parchemin, bulles sobres, actions proposées clairement distinctes des simples réponses textuelles.
- Montrer le fournisseur/configuration et l'état de connexion **réel** dans Paramètres (jamais un statut de connexion fictif).
- La configuration IA doit être **commune** aux modules (Assistant IA, fiches repas, menu, profils, meal prep), avec une seule source de configuration dans l'architecture.
- Les sorties IA qui modifieraient des données doivent être prévisualisées et confirmées : « Proposer » ≠ « Enregistrer ».
- Réponses fluides, espaces adaptés aux listes, macros et étapes; messages d'erreur utiles.
- **Sécurité :** ne pas exposer de clé API secrète dans une interface partagée ou du code frontend livré publiquement. Prévoir une gestion sécurisée côté serveur pour une vraie app déployée.

### 10.8 Paramètres, images et exportation

Ces écrans peuvent être moins décorés : le besoin de précision domine. Même tokens, mais fond plus clair et contrôles directs. L'exportation imprimable a sa propre feuille de style presque blanche.

---

## 11. Interactions, microanimations et accessibilité

**Microanimation :** légère, informative, facultative.

| Interaction | Durée conseillée | Effet |
|---|---:|---|
| Hover bouton | 120–180 ms | Changement de lumière/bordure, pas de grand zoom |
| Ouverture panneau | 180–240 ms | Opacité + translation faible |
| Feedback case cochée | 100–160 ms | État immédiat |
| Chargement | Selon requête | Skeleton modéré ou indicateur stable |

- Préférer `opacity` et `transform`, éviter les transitions qui déplacent toute la grille.
- Respect strict de `prefers-reduced-motion: reduce`.
- Contrôles accessibles au clavier, focus visible, labels corrects, hiérarchie HTML H1/H2/H3.
- `aria-live` pour confirmations critiques, pas pour chaque interaction mineure.
- Les icônes purement décoratives sont masquées aux lecteurs d'écran; les boutons icônes ont un nom accessible.
- Ne pas empêcher le zoom ni utiliser une taille de police de champ inférieure à 16 px sur iOS.
- États hover et actifs également compréhensibles au touch, au clavier et sans textures chargées.

---

## 12. Design tokens et gouvernance technique

**Source de vérité recommandée :** `src/styles/hearthsmith-tokens.css` (ou équivalent cohérent avec le dépôt). Une feuille compagnon fournie avec ce guide contient les tokens et quelques classes opt-in, sans remplacement global agressif des composants existants.

**Consignes à Claude Code :**

1. Inspecter les composants, styles, assets et variables déjà en place avant de toucher au code.
2. Identifier les chemins **réels** des logos, textures et cadres. Gérer proprement les fichiers optionnels manquants.
3. Centraliser couleurs, espacements, ombres, rayons, typo et styles d'états dans un système de tokens.
4. Bâtir ou harmoniser les primitives : `AppShell`, `PageHeader`, `Panel`, `Button`, `Badge`, `Field`, `Alert`, `EmptyState`, `Modal`, `Avatar`, `MealCard`, `MemberCard`.
5. Rénover **une vue pilote** (idéalement « Membres du logis » ou dashboard) avant de propager à l'ensemble de l'app.
6. Garder toute la logique de données, les handlers, la sauvegarde, les uploads et les routes existantes; aucun changement métier déguisé en retouche visuelle.
7. Éviter les fichiers CSS énormes dupliqués et les styles inline qui contredisent les tokens.
8. Ne pas injecter des pseudo-éléments décoratifs qui couvrent les zones interactives.
9. Ajouter les variantes responsive **dans chaque composant**, pas comme patch tardif global.
10. Tester toutes les vues avec et sans données, et avec des noms/titres très longs.
11. Documenter les décisions et les fichiers modifiés.
12. Livrer les changements en étapes revérifiables, avec captures desktop/tablette/mobile lorsque l'environnement le permet.

### 12.1 Exemple de couches visuelles

```css
.hs-app {
  color: var(--hs-ink);
  background: var(--hs-canvas);
  font-family: var(--hs-font-ui);
}

.hs-app__sidebar {
  color: var(--hs-on-dark);
  background-color: var(--hs-wood);
  background-image: linear-gradient(180deg, rgba(27,16,8,.33), rgba(27,16,8,.65)),
    url('/hearthsmith/textures/dark-wood-bg.webp');
  background-repeat: no-repeat, repeat;
  background-size: cover, 720px auto;
}

.hs-panel {
  color: var(--hs-ink);
  background-color: var(--hs-parchment);
  background-image: linear-gradient(rgba(255,248,234,.78), rgba(255,248,234,.78)),
    url('/hearthsmith/textures/parchment-bg.webp');
  background-repeat: no-repeat, repeat;
  background-size: cover, 760px auto;
  border: 1px solid var(--hs-border);
  border-radius: var(--hs-radius-panel);
  box-shadow: var(--hs-shadow-panel);
}
```

**Note :** les noms de classes ci-dessus sont des exemples; intégrer à l'architecture réelle, ne pas superposer un deuxième système contradictoire.

---

## 13. Contrôles qualité / critères d'acceptation

### 13.1 Revue visuelle

- [ ] Logo original correct, entier, sans changement de proportions; aucune version coupée.
- [ ] Même palette, même typographie, même hiérarchie sur toutes les vues.
- [ ] Texture bois perceptible mais non envahissante sur navigation.
- [ ] Panneaux lisibles en parchemin; textes sans bruit visuel.
- [ ] Boutons primaires verts; or/cuivre surtout décoratif.
- [ ] Les coins dorés sont rares, non intrusifs et absents si les assets manquent.
- [ ] Vraies photos de repas et portraits mis en valeur sans déformation.
- [ ] Aucun usage de `paper-noise.png`.

### 13.2 Matrice de tests

- [ ] Largeurs testées : **320, 360, 390, 480, 768, 1024, 1280, 1440, 1920 px**.
- [ ] Orientations portrait/paysage testées sur téléphone et tablette.
- [ ] Zoom 200 %, textes longs, navigateur avec barre latérale et petits écrans.
- [ ] Aucun débordement horizontal non voulu, aucun CTA masqué.
- [ ] Menu hebdomadaire facile à utiliser sur mobile; pas de 7 colonnes comprimées.
- [ ] Cartes et formulaires utilisables au tactile; cibles adaptées.
- [ ] Focus clavier, contraste, labels et navigation lecteurs d'écran évalués.
- [ ] `prefers-reduced-motion` respecté.
- [ ] Affichages chargement, état vide, erreur, succès, hors ligne et images absentes vérifiés.
- [ ] Impression liste d'épicerie / meal prep lisible en encre économique.

### 13.3 Tests de non-régression fonctionnelle

- [ ] Créer, modifier, sauvegarder et rouvrir une fiche repas.
- [ ] Ajouter/changer une photo et vérifier qu'elle persiste.
- [ ] Construire un menu, changer de jour et confirmer les rotations.
- [ ] Générer et cocher la liste d'épicerie.
- [ ] Exécuter des étapes meal prep et préserver leur état.
- [ ] Ouvrir/modifier un membre et voir ses informations pertinentes au bon endroit.
- [ ] Configurer l'IA une fois, puis vérifier son comportement dans les autres modules.
- [ ] Export JSON/CSV/impression selon les fonctions réellement existantes.
- [ ] Rafraîchir la page et confirmer que l'état attendu demeure.

---

## 14. Anti-patterns absolus

1. **Ne pas** refaire le logo, changer sa silhouette ni utiliser une version coupée.
2. **Ne pas** transformer toutes les cartes en ornements lourds de jeu vidéo.
3. **Ne pas** étirer une texture WebP comme fond plein écran si elle est destinée à se répéter.
4. **Ne pas** employer 4 à 6 fontes fantasy différentes.
5. **Ne pas** choisir du texte doré pâle sur fond parchemin clair.
6. **Ne pas** imposer trois colonnes en mobile ou huit onglets de navigation en bas d'écran.
7. **Ne pas** se servir de la couleur seule pour signaler une restriction alimentaire, une erreur ou une action importante.
8. **Ne pas** remplacer les données réelles par du contenu de démonstration lors d'une refonte UI.
9. **Ne pas** stocker ou exposer volontairement des clés IA secrètes dans des bundles publics.
10. **Ne pas** introduire d'assets imaginaires, d'URLs brisées ni de dépendances de design sans besoin concret.
11. **Ne pas** adopter le langage ou la structure d'un dashboard SaaS générique qui ferait disparaître l'identité HearthSmith.
12. **Ne pas** appeler une interface « responsive » sans avoir réellement testé les grilles, textes longs, formulaires, images et actions sur petit écran.

---

## 15. Définition de « terminé » pour Claude Code

Le projet est prêt visuellement lorsque **toutes** les sections paraissent provenir du même univers, que la navigation reste immédiate, que les textures enrichissent sans ralentir ou brouiller, que le design conserve sa qualité sur téléphone, tablette et desktop, et que les fonctionnalités déjà présentes continuent de fonctionner.

**Ordre de priorité de livraison :**

1. Audit réel du dépôt et intégrité du logo / assets.
2. Tokens et shell responsive.
3. Primitives partagées accessibles.
4. Vue pilote validée.
5. Déploiement cohérent aux autres sections.
6. Contrôles états / alertes / IA / impression.
7. Tests responsive et non-régression.

### Message direct à copier dans Claude Code

> Utilise `HEARTHSMITH_BRAND_GUIDE.md` comme source de vérité pour la direction artistique de HearthSmith et `hearthsmith-design-tokens.css` comme point de départ des variables. Commence par auditer les fichiers existants, identifier les logos et assets réels et comparer le design actuel au guide. Fournis un plan de modifications par fichier. Implémente progressivement, en gardant les fonctionnalités, les données et les uploads intacts. Ne recrée jamais le logo, n'invente pas d'assets manquants et n'applique pas de design lourd aux vues opérationnelles. Vérifie chaque écran à 390, 768 et 1440 px au minimum, puis effectue les tests complémentaires détaillés dans le guide. Si une décision du guide entre en conflit avec la structure réelle ou le logo original, privilégie l'intégrité existante et signale explicitement le conflit.

---

**Résumé en une phrase :** *HearthSmith doit donner l'impression d'un carnet de foyer nordique façonné avec soin — aussi chaleureux qu'un feu de cheminée, mais aussi simple et fiable qu'une excellente application moderne.*
