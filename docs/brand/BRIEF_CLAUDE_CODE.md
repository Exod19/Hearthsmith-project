# Brief pour Claude Code — refonte look & feel HearthSmith

Le document de référence est `HEARTHSMITH_BRAND_GUIDE.md`. Un fichier de tokens CSS de départ est fourni : `hearthsmith-design-tokens.css`.

**Mission :** unifier l'application React/Vite HearthSmith autour d'une esthétique cozy fantasy / nordique / viking chaleureuse. Respecter strictement le logo d'origine, les images utilisateur et les fonctionnalités existantes. L'expérience finale doit être soignée sur desktop, tablette et mobile.

## Méthode attendue

1. **Audit préalable :** inspecte l'arborescence, les logos dans `public/brand/`, les textures dans `public/hearthsmith/textures/`, les cadres éventuels, les composants, les CSS et les fonctionnalités. Ne suppose pas qu'un asset optionnel est présent.
2. **Diagnostic :** dresse un tableau par écran/composant de ce qui respecte ou viole le guide. Liste les écarts de responsive.
3. **Plan :** propose un ordre de travaux par fichiers et explique clairement les impacts et risques. N'entame pas une réécriture massive avant d'avoir consolidé les bases partagées.
4. **Implémentation incrémentale :** tokens, app shell, composants partagés, une page pilote, puis les autres vues. Conserve toute la logique métier, les images et la persistance.
5. **Qualité :** valider les largeurs 390, 768 et 1440 px au minimum; faire ensuite toute la matrice du guide, plus focus clavier, états vides, erreurs, longueurs de texte et impression.
6. **Compte rendu :** fournis la liste exacte des fichiers modifiés, la raison de chaque changement, les tests réalisés et les éventuelles étapes restantes.

## Contraintes impératives

- Aucune réinterprétation ou coupe du logo officiel.
- Aucun usage de `paper-noise.png`.
- Bois sombre pour structure/navigation; parchemin pour travail; vert forêt pour actions; cuivre/bronze pour décoration modérée.
- Ne pas introduire d'assets imaginaires ou de liens brisés.
- Mobile réellement repensé, non desktop réduit.
- Pas de régressions sur menus, repas, photos, membres, épicerie, meal prep, export et IA.
- Préserver les données existantes; ne jamais remplacer des données de production par des fixtures de démonstration.
- Toute action IA sur les données doit être confirmée explicitement avant enregistrement.

**Première réponse souhaitée :** montre-moi l'audit et le plan par fichiers, avec les points à risque, avant les changements à grande échelle.
