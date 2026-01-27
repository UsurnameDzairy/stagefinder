# StageFinder - Development Guide

## Quick Start

```bash
# Start development server
npm run dev

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Clear Next.js cache if issues
rm -rf .next && npm run dev
```

---

## PRIORITY TASKS TO FIX

### 1. Authentication Issue - Login Not Working
**Status**: CRITICAL
**File**: `src/app/(auth)/login/page.tsx`

The login page shows "INVALID CREDENTIALS" even with correct credentials. Debug steps:
1. Check if `BETTER_AUTH_SECRET` is set in `.env`
2. Verify database connection string
3. Check the auth API at `/api/auth/[...all]/route.ts`

```bash
# Required env vars
BETTER_AUTH_SECRET=your_secret_here
DATABASE_URL=your_database_url
```

---

### 2. Test PDF Extraction End-to-End
**Status**: TO VERIFY
**Files**:
- `src/app/api/extract-text/route.ts` - Uses `unpdf` library
- `src/app/api/cv/parse/route.ts` - Uses `unpdf` library

The PDF extraction now uses `unpdf` instead of `pdf-parse` (which had DOMMatrix errors).

**Test procedure**:
1. Go to `/assistant`
2. Click the "+" button to upload a PDF
3. Check server logs for `[PDF Extract]` messages
4. Verify the extracted text appears in the chat

---

### 3. Remaining French Text to Translate
**Status**: TO DO
**Search pattern**: Look for hardcoded French strings

Files that may still have French text:
- `src/app/(auth)/login/page.tsx` - Check form labels
- `src/app/(auth)/register/page.tsx` - Check form labels
- `src/app/(auth)/complete-profile/page.tsx` - Check all text
- `src/app/(app)/parametres/page.tsx` - Settings page labels
- `src/app/(app)/lettres/page.tsx` - Cover letter page
- `src/app/(app)/models/page.tsx` - AI models page

**Command to find French text**:
```bash
grep -r "Connexion\|Inscription\|Paramètres\|Candidature\|Entreprise" src/
```

---

### 4. Create Missing Pages
**Status**: TO DO

#### Help Page (`/aide` or `/help`)
- Create `src/app/(app)/help/page.tsx`
- Add FAQ section
- Add contact information
- Link from navbar menu

#### About Page (`/about`)
- Create `src/app/(app)/about/page.tsx`
- Company info
- Mission statement
- Link from navbar menu

---

### 5. Fix Navbar Links
**Status**: TO VERIFY
**File**: `src/components/ui/navbar.tsx`

The navigation should be:
```
KAM | Dashboard | Jobs | Applications | Tools ▼
                                        ├── CV Improver
                                        └── Cover Letters
```

Current labels (should be in English):
- "KAM" ✓
- "Dashboard" ✓
- "Jobs" ✓ (was "Offres")
- "Applications" ✓ (was "Candidatures")
- "Tools" ✓ (was "Outils")
- "CV Improver" ✓
- "Cover Letters" ✓ (was "Lettres de motivation")

---

### 6. User Menu Translation
**Status**: TO VERIFY
**File**: `src/components/ui/navbar.tsx`

Menu items should be in English:
- "Settings" (was "Paramètres")
- "Language" (with submenu EN/FR)
- "Get help" (was "Obtenir de l'aide")
- "See all plans" (was "Voir tous les forfaits")
- "Learn more" (was "En savoir plus")
- "Log out" (was "Se déconnecter")

---

### 7. Pricing Page Verification
**Status**: DONE - VERIFY RENDERING
**File**: `src/app/(app)/pricing/page.tsx`

The pricing page was redesigned to match landing page style:
- White text on cards
- Prices: $0 (Free), $8.99 (Student), $19.99 (Pro)
- Labels: "Monthly" / "Annual (-20%)"
- Badge: "Popular" on Pro plan

If page still shows French, clear browser cache (Cmd+Shift+R).

---

### 8. Dashboard Card Titles
**Status**: DONE
**File**: `src/app/(app)/dashboard/page.tsx`

Icons were removed from card titles:
- "Application Status" (no icon)
- "Skills Coverage" (no icon)
- "Pro Tip" (no icon)
- "Recent Activity" (no icon)

---

### 9. AI Assistant CV Analysis
**Status**: DONE
**File**: `src/lib/ai/assistant.ts`

The assistant now provides comprehensive CV analysis:
1. Extracts candidate profile (name, education, experience, skills, languages)
2. Provides professional assessment (score /10, 3 strengths, 3 improvements)
3. Gives actionable recommendations (CV improvements, skills to develop, companies to target)

---

## FILE STRUCTURE

### API Routes
```
src/app/api/
├── assistant/
│   ├── route.ts              # Main assistant API
│   └── conversation/
│       └── route.ts          # Conversation CRUD
├── cv/
│   ├── parse/route.ts        # CV parsing with unpdf
│   └── improve/route.ts      # CV improvement API
├── extract-text/route.ts     # Text extraction (PDF, DOCX, TXT)
├── dashboard/
│   └── activity/route.ts     # Dashboard activity feed
├── stripe/
│   └── checkout/route.ts     # Stripe payment
└── models/route.ts           # AI models list
```

### Components
```
src/components/
├── ui/
│   └── navbar.tsx            # Main navigation + user menu
├── assistant/
│   ├── floating-assistant.tsx # Floating chat widget
│   └── chat-input.tsx        # Chat input component
├── applications/
│   └── progress-tracker.tsx  # Application progress display
├── notifications/
│   └── notification-bell.tsx # Notifications dropdown
└── scraper/
    └── scraper-preview.tsx   # Job scraper UI
```

### Translations
```
src/lib/i18n/
├── translations.ts           # All FR/EN translations
└── LanguageContext.tsx       # Language context provider
```

---

## TECHNICAL NOTES

### PDF Extraction
Uses `unpdf` library (not pdf-parse) for Node.js compatibility:
```typescript
import { extractText } from "unpdf";

const uint8Array = new Uint8Array(buffer);
const { text, totalPages } = await extractText(uint8Array, { mergePages: true });
```

### Language System
- Default language: English (`en`)
- Language stored in localStorage: `stagefinder-language`
- Use `useTranslation()` hook for translations
- Translations file: `src/lib/i18n/translations.ts`

### Next.js Config
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf"],
  turbopack: {},
};
```

---

## ENV VARIABLES REQUIRED

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your_secret_here

# AI APIs
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## COMPLETED TASKS (2026-01-26)

- [x] Translate site from French to English
- [x] Fix PDF extraction (unpdf instead of pdf-parse)
- [x] Redesign pricing page to match landing page
- [x] Improve AI assistant CV analysis prompts
- [x] Set default language to English
- [x] Remove icons from dashboard titles
- [x] Translate navbar links
- [x] Translate floating assistant
- [x] Translate progress tracker
- [x] Translate notification bell
- [x] Translate date formatting (en-US)
- [x] Translate error messages in APIs

---

## TODO CHECKLIST

- [ ] Fix login authentication issue
- [ ] Test PDF extraction with real CV
- [ ] Create /help page
- [ ] Create /about page
- [ ] Translate any remaining French text
- [ ] Test Stripe checkout flow
- [ ] Add loading states to buttons
- [ ] Mobile responsive testing
- [ ] Error boundary for API failures

---

**Last Updated**: 2026-01-26
**Branch**: quizzical-fermat
**Last Commit**: Translate site to English, fix PDF extraction, improve CV analysis
