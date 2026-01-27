# KamForJob - Guide de Déploiement Production

## Checklist Déploiement Vercel + Domaine Personnalisé

---

## 1. Préparation Vercel

### 1.1 Créer le projet Vercel
```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Login
vercel login

# Déployer (depuis le dossier du projet)
vercel
```

### 1.2 Variables d'environnement Vercel

Va sur https://vercel.com/[ton-username]/[ton-projet]/settings/environment-variables

Ajoute ces variables :

```env
# Database (Neon/Supabase/PlanetScale)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Auth
BETTER_AUTH_SECRET=une-cle-secrete-tres-longue-minimum-32-caracteres

# URLs (IMPORTANT: mettre ton domaine)
NEXT_PUBLIC_APP_URL=https://kamforjob.com
NEXTAUTH_URL=https://kamforjob.com

# Stripe LIVE (pas test!)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# AI APIs
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 2. Configuration Domaine

### 2.1 Ajouter le domaine sur Vercel
1. Va sur https://vercel.com/[ton-username]/[ton-projet]/settings/domains
2. Clique "Add Domain"
3. Entre ton domaine : `kamforjob.com` (ou ton domaine)
4. Vercel te donnera les DNS records à configurer

### 2.2 Configurer les DNS chez ton registrar

**Option A - Nameservers Vercel (recommandé)** :
Change les nameservers vers :
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B - Records DNS manuels** :
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 2.3 SSL/HTTPS
Vercel configure automatiquement le SSL. Attends 5-10 min après la config DNS.

---

## 3. Stripe Production

### 3.1 Passer en mode Live
1. Va sur https://dashboard.stripe.com
2. Active ton compte Stripe (vérification identité)
3. Bascule de "Test" à "Live" en haut à droite

### 3.2 Créer les produits Live
Recrée les produits en mode Live :

**KamForJob Student**
- Prix mensuel : 10,79 €/mois
- Prix annuel : 8,99 €/mois (107,88 €/an)

**KamForJob Pro**
- Prix mensuel : 23,99 €/mois
- Prix annuel : 19,99 €/mois (239,88 €/an)

### 3.3 Mettre à jour les Price IDs

Modifie `src/app/pricing/page.tsx` avec les nouveaux price IDs Live :

```typescript
const plansData: PricingPlan[] = [
  {
    key: "free",
    price: "0",
    yearlyPrice: "0",
    href: "/register",
    isPopular: false,
  },
  {
    key: "student",
    price: "10,79",
    yearlyPrice: "8,99",
    href: "#",
    isPopular: false,
    stripePriceId: "price_LIVE_STUDENT_MONTHLY",      // <-- Remplacer
    stripeYearlyPriceId: "price_LIVE_STUDENT_YEARLY", // <-- Remplacer
  },
  {
    key: "pro",
    price: "23,99",
    yearlyPrice: "19,99",
    href: "#",
    isPopular: true,
    stripePriceId: "price_LIVE_PRO_MONTHLY",          // <-- Remplacer
    stripeYearlyPriceId: "price_LIVE_PRO_YEARLY",     // <-- Remplacer
  },
];
```

### 3.4 Configurer le Webhook Stripe Live

1. Va sur https://dashboard.stripe.com/webhooks (mode Live)
2. Clique "Add endpoint"
3. **URL** : `https://kamforjob.com/api/stripe/webhook`
4. **Événements à sélectionner** :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie le **Signing secret** → `STRIPE_WEBHOOK_SECRET` dans Vercel

### 3.5 Mettre à jour le mapping des prix dans le webhook

Modifie `src/app/api/stripe/webhook/route.ts` :

```typescript
const PRICE_TO_PLAN: Record<string, PlanType> = {
  // Student plans - REMPLACER avec les vrais IDs Live
  "price_LIVE_STUDENT_MONTHLY": "STUDENT",
  "price_LIVE_STUDENT_YEARLY": "STUDENT",
  // Pro plans - REMPLACER avec les vrais IDs Live
  "price_LIVE_PRO_MONTHLY": "PRO",
  "price_LIVE_PRO_YEARLY": "PRO",
};
```

---

## 4. Base de données Production

### Option A : Neon (recommandé, gratuit)
1. Va sur https://neon.tech
2. Crée un projet
3. Copie la connection string
4. Ajoute-la comme `DATABASE_URL` dans Vercel

### Option B : Supabase
1. Va sur https://supabase.com
2. Crée un projet
3. Va dans Settings > Database > Connection string
4. Copie l'URI PostgreSQL

### Option C : PlanetScale (MySQL)
Nécessite de changer le provider dans schema.prisma

### 4.1 Migrer la base
```bash
# Génère le client Prisma
npx prisma generate

# Push le schema vers la nouvelle DB
npx prisma db push
```

---

## 5. Fichiers à modifier pour la production

### 5.1 next.config.ts
Vérifie que c'est OK :
```typescript
const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf"],
  images: {
    domains: ["kamforjob.com"], // Ajoute ton domaine si besoin
  },
};
```

### 5.2 Mettre à jour NEXT_PUBLIC_APP_URL partout

Cherche et remplace `localhost:3000` par ton domaine dans :
- `.env.production` (créer si nécessaire)
- Variables Vercel

---

## 6. Google OAuth (optionnel)

Si tu utilises Google Login :

1. Va sur https://console.cloud.google.com
2. APIs & Services > Credentials
3. Modifie ton OAuth Client
4. Ajoute les URIs autorisées :
   - `https://kamforjob.com`
   - `https://kamforjob.com/api/auth/callback/google`

---

## 7. Checklist Finale

### Avant déploiement :
- [ ] Database production créée et connectée
- [ ] Variables d'environnement configurées sur Vercel
- [ ] `NEXT_PUBLIC_APP_URL` pointe vers le bon domaine
- [ ] Stripe en mode Live avec nouveaux price IDs
- [ ] Webhook Stripe configuré avec l'URL production
- [ ] Price IDs mis à jour dans `pricing/page.tsx`
- [ ] Price IDs mis à jour dans `webhook/route.ts`

### Après déploiement :
- [ ] Domaine configuré et SSL actif
- [ ] Test inscription/connexion
- [ ] Test paiement Stripe (avec vraie carte, petit montant puis rembourser)
- [ ] Vérifier que le plan se met à jour après paiement
- [ ] Test recherche d'offres
- [ ] Test CV Improver
- [ ] Test assistant IA

---

## 8. Commandes utiles

```bash
# Déployer en production
vercel --prod

# Voir les logs
vercel logs

# Voir les variables d'environnement
vercel env ls

# Ajouter une variable d'environnement
vercel env add VARIABLE_NAME

# Redéployer après changement de variables
vercel --prod --force
```

---

## 9. Troubleshooting

### Le paiement fonctionne mais le plan ne se met pas à jour
1. Vérifie que le webhook est bien configuré sur Stripe
2. Vérifie les logs Vercel pour voir si le webhook est appelé
3. Vérifie que `STRIPE_WEBHOOK_SECRET` est correct

### Erreur 500 sur le checkout
1. Vérifie que `STRIPE_SECRET_KEY` est en mode Live
2. Vérifie que les price IDs correspondent au mode Live

### La base de données ne se connecte pas
1. Vérifie que l'IP de Vercel est autorisée (si applicable)
2. Vérifie le `?sslmode=require` dans l'URL

### Google OAuth ne fonctionne pas
1. Vérifie les URIs autorisées dans Google Console
2. Vérifie que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont en production

---

## 10. Résumé des Price IDs à remplacer

| Plan | Type | Test ID (actuel) | Live ID (à remplir) |
|------|------|------------------|---------------------|
| Student | Monthly | price_1Su4dcEZ2umRtYhgsugvViKb | price_... |
| Student | Yearly | price_1Su4eQEZ2umRtYhgP0jQr3p6 | price_... |
| Pro | Monthly | price_1Su4b2EZ2umRtYhgqMjeLJXg | price_... |
| Pro | Yearly | price_1Su4bmEZ2umRtYhgXp1UEBLq | price_... |

---

**Dernière mise à jour** : 2026-01-27
