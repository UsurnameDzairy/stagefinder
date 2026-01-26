# StageFinder - Notes de développement

## Changements récents (2026-01-26)

### Terminé
- [x] Menu utilisateur style Claude avec:
  - Email en header
  - Paramètres
  - Langue (sous-menu FR/EN)
  - Obtenir de l'aide
  - Voir tous les forfaits
  - En savoir plus
  - Se déconnecter
  - Info plan (avatar + nom + plan actuel)
- [x] Sélecteur de langue retiré de la navbar (déplacé dans le menu utilisateur)
- [x] Checkbox "Remember me" supprimée de la page login
- [x] Traductions ajoutées pour le menu (account, language, help, pricing, learnMore)
- [x] Extraction PDF configurée avec pdf-parse (require() pour éviter les erreurs ESM)
- [x] Sidebar avec historique des conversations sur /assistant
  - Liste des sessions avec date
  - Suppression des conversations
  - Bouton "Nouvelle session"
  - Toggle pour cacher/afficher la sidebar
- [x] Navbar: "Entreprises" remplacé par "Candidatures"
- [x] "Mes Candidatures" retiré du sous-menu Outils (doublon)
- [x] API DELETE pour supprimer les conversations

---

## Structure de la navbar

```
KAM | Dashboard | Offres | Candidatures | Outils ▼
                                          ├── CV Improver
                                          └── Lettres de motivation
```

---

## Structure des fichiers clés

### Navigation
- `src/components/ui/navbar.tsx` - Navbar avec menu utilisateur style Claude

### Authentification
- `src/app/(auth)/login/page.tsx` - Page de connexion (sans remember me)
- `src/app/(auth)/register/page.tsx` - Page d'inscription

### Assistant IA
- `src/app/(app)/assistant/page.tsx` - Page assistant avec sidebar conversations

### API
- `src/app/api/extract-text/route.ts` - Extraction de texte (PDF, DOCX, TXT)
- `src/app/api/cv/parse/route.ts` - Parsing CV spécifique
- `src/app/api/assistant/conversation/route.ts` - CRUD conversations (GET, POST, DELETE)

### Traductions
- `src/lib/i18n/translations.ts` - Toutes les traductions FR/EN
- `src/lib/i18n/LanguageContext.tsx` - Context React pour la langue

---

## Notes techniques

### Extraction PDF
Le projet utilise `pdf-parse` avec `require()` au lieu de `import` pour éviter les erreurs ESM:
```typescript
const pdfParse = require("pdf-parse");
```

### Menu utilisateur (style Claude)
Le menu utilisateur contient maintenant:
1. Email de l'utilisateur
2. Paramètres
3. Langue (sous-menu avec FR/EN)
4. Obtenir de l'aide
5. Voir tous les forfaits
6. En savoir plus
7. Se déconnecter
8. Info plan (avatar + nom + plan actuel)

### Sidebar conversations
- Les conversations sont sauvegardées via `/api/assistant/conversation`
- DELETE endpoint pour supprimer les conversations
- La sidebar affiche les 20 dernières conversations
- Format de date relatif (5m, 2h, 3j, ou date)

---

## Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base de données
npx prisma db push
```

---

## À faire

- [ ] Ajouter page /aide (help page)
- [ ] Ajouter page /about (learn more)
- [ ] Vérifier que les pages utilisent bien les traductions
- [ ] Tester l'extraction PDF end-to-end

---

**Dernière mise à jour**: 2026-01-26
