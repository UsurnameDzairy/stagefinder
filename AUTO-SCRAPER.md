# 🤖 Système de Scraping Automatique par Profil

## Vue d'ensemble

Le système de scraping automatique analyse le profil de chaque utilisateur et scrape automatiquement les offres d'emploi correspondantes en temps réel. Les utilisateurs reçoivent des notifications instantanées pour les nouvelles offres matchant leur profil.

## Fonctionnalités

### 1. Scraping Basé sur le Profil

Le système analyse automatiquement:
- **Domaines d'intérêt** (Finance, Tech, Consulting, etc.)
- **Types de contrat** (CDI, CDD, Stage, Alternance)
- **Villes préférées** (Paris, Lyon, etc.)
- **Compétences** (Top 3 skills de l'utilisateur)

### 2. Notifications en Temps Réel

Chaque nouvelle offre génère une notification contenant:
- Titre du poste
- Entreprise
- Localisation
- Type de contrat
- Domaine correspondant
- Lien direct vers l'offre

### 3. Exemple pour un Profil Finance

**Profil utilisateur:**
```json
{
  "domains": "Finance, Banking",
  "contractTypes": "CDI, Stage, Alternance",
  "preferredCities": "Paris, Lyon",
  "skills": ["Excel", "Python", "Financial Modeling"]
}
```

**Requêtes générées automatiquement:**
- "Finance CDI" à Paris
- "Finance Stage" à Paris
- "Finance Alternance" à Paris
- "Banking CDI" à Lyon
- "Excel" à Paris
- "Python" à Paris
- etc.

**Résultat:** L'utilisateur reçoit des notifications pour toutes les nouvelles offres correspondantes.

## Configuration

### 1. Variables d'environnement

Ajoutez dans `.env`:
```bash
# Secret pour sécuriser l'endpoint CRON
CRON_SECRET=votre-secret-securise-ici
```

### 2. Vercel Cron Jobs

Le fichier `vercel.json` configure l'exécution automatique:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-scrape",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

**Fréquence:** Toutes les 2 heures (modifiable)

### 3. Déploiement

Sur Vercel:
1. Le cron job s'active automatiquement après le déploiement
2. Vérifiez dans Vercel Dashboard > Cron Jobs
3. Les logs sont disponibles dans Vercel Logs

## API Endpoints

### GET /api/cron/auto-scrape

**Endpoint CRON automatique**

Headers requis:
```bash
Authorization: Bearer YOUR_CRON_SECRET
```

Exemple d'appel manuel:
```bash
curl -X GET https://votre-app.vercel.app/api/cron/auto-scrape \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### POST /api/cron/auto-scrape

**Déclenchement manuel pour un utilisateur**

Body:
```json
{
  "userId": "user-id-here"
}
```

Exemple:
```bash
curl -X POST https://votre-app.vercel.app/api/cron/auto-scrape \
  -H "Content-Type: application/json" \
  -d '{"userId": "clx123abc"}'
```

## Fonctionnement Technique

### 1. Flux de Scraping

```
CRON (toutes les 2h)
    ↓
Récupérer tous les utilisateurs avec profil
    ↓
Pour chaque utilisateur:
    ↓
Construire requêtes basées sur profil
    ↓
Scraper LinkedIn, Indeed, HelloWork, WTTJ
    ↓
Filtrer nouvelles offres (non existantes en DB)
    ↓
Sauvegarder en base
    ↓
Créer notifications utilisateur
    ↓
Nettoyer anciennes offres (> 30 jours)
```

### 2. Algorithme de Matching

Le système génère jusqu'à **10 requêtes** par utilisateur:
- Combinaisons domaine × ville × type de contrat
- Top 3 compétences × villes
- Limite pour éviter la surcharge

### 3. Dédoublonnage

Les offres sont dédoublonnées par `sourceUrl`:
- Si l'URL existe déjà → skip
- Si nouvelle URL → sauvegarde + notification

## Monitoring

### Logs

Les logs incluent:
```
🤖 [AUTO-SCRAPER] Démarrage du scraping automatique...
📊 [AUTO-SCRAPER] 45 utilisateurs à traiter
🔍 [AUTO-SCRAPER] Traitement utilisateur clx123abc
📋 [AUTO-SCRAPER] 8 requêtes à exécuter
   🔎 Recherche: "Finance CDI" à Paris
   ✅ 12 offres trouvées
   📬 Notification envoyée: Analyste Financier @ BNP Paribas
✅ [AUTO-SCRAPER] 5 nouvelles offres pour clx123abc
🧹 [AUTO-SCRAPER] Nettoyage des anciennes offres...
✅ [AUTO-SCRAPER] 234 anciennes offres supprimées
✅ [AUTO-SCRAPER] Scraping automatique terminé
```

### Métriques

- Nombre d'utilisateurs traités
- Nombre de requêtes exécutées
- Nouvelles offres trouvées
- Notifications envoyées
- Durée d'exécution

## Optimisations

### Performance

- **Scraping parallèle** des sources (LinkedIn, Indeed, etc.)
- **Limite de 10 requêtes** par utilisateur
- **Dédoublonnage** pour éviter les doublons
- **Nettoyage automatique** des anciennes offres

### Anti-détection

- User-Agent réaliste
- Headers HTTP authentiques
- Suppression des traces Puppeteer
- Délais entre requêtes

## Utilisation

### Pour les Utilisateurs

1. **Compléter son profil** dans Paramètres:
   - Domaines d'intérêt
   - Types de contrat souhaités
   - Villes préférées
   - Compétences

2. **Activer les notifications** dans le navigateur

3. **Recevoir automatiquement** les nouvelles offres correspondantes

### Pour les Admins

**Déclencher manuellement pour un utilisateur:**
```javascript
// Dans la console du serveur
const { runAutoScrapeForUser } = require('./src/lib/auto-scraper');
await runAutoScrapeForUser('user-id');
```

**Tester localement:**
```bash
# Ajouter CRON_SECRET dans .env
CRON_SECRET=dev-secret

# Appeler l'endpoint
curl -X GET http://localhost:3000/api/cron/auto-scrape \
  -H "Authorization: Bearer dev-secret"
```

## Maintenance

### Nettoyage Manuel

```javascript
const { cleanOldJobs } = require('./src/lib/auto-scraper');
await cleanOldJobs(); // Supprime offres > 30 jours
```

### Ajuster la Fréquence

Modifier `vercel.json`:
```json
"schedule": "0 */1 * * *"  // Toutes les heures
"schedule": "0 */6 * * *"  // Toutes les 6 heures
"schedule": "0 9,17 * * *" // 9h et 17h chaque jour
```

## Sécurité

- ✅ Endpoint CRON protégé par secret
- ✅ Authentification utilisateur requise
- ✅ Validation des données
- ✅ Logs détaillés pour audit
- ✅ Rate limiting sur le scraping

## Roadmap

- [ ] Ajout de plus de sources (Glassdoor, Monster, etc.)
- [ ] ML pour améliorer le matching
- [ ] Notifications par email
- [ ] Dashboard analytics pour les admins
- [ ] A/B testing des requêtes de recherche
