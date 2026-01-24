# OpenRouter AI Integration - Documentation

## 🎯 Vue d'ensemble

L'application StageFinder intègre maintenant **OpenRouter** pour fournir des fonctionnalités d'IA avancées alimentées par GPT-4, Claude, et d'autres modèles de pointe.

## 🔑 Configuration

### Clé API
Votre clé OpenRouter a été ajoutée au fichier `.env`:
```
OPENROUTER_API_KEY=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
```

### Modèles disponibles
- **GPT-4 Turbo** (par défaut) - Meilleur pour l'analyse complexe
- **GPT-3.5 Turbo** - Rapide et économique pour les tâches simples
- **Claude 3 Opus/Sonnet/Haiku** - Excellents pour le raisonnement
- **Gemini Pro** - Alternative Google
- **Mistral Large** - Modèle français optimisé

## ✨ Fonctionnalités intégrées

### 1. **Assistant Carrière IA** (`/assistant`)
- **Fichier**: `src/lib/ai/assistant.ts`
- **Fonctionnalité**: Chat intelligent avec contexte utilisateur
- **Modèle**: GPT-4 Turbo
- **Caractéristiques**:
  - Analyse du profil utilisateur
  - Recommandations d'entreprises personnalisées
  - Conseils stratégiques de recherche d'emploi
  - Préparation aux entretiens
  - Fallback sur réponses pré-programmées si l'API échoue

**Exemple d'utilisation**:
```typescript
import { chatWithAssistant } from '@/lib/openrouter';

const response = await chatWithAssistant(
  "Comment améliorer mon CV pour la finance ?",
  conversationHistory,
  { skills: ['Python', 'Excel'], targetRole: 'Finance' }
);
```

### 2. **Analyseur de CV** (`/cv-improver`)
- **Fichier**: `src/app/api/generate/cv-improve/route.ts`
- **Fonctionnalité**: Analyse et amélioration de CV avec IA
- **Modèle**: GPT-4 Turbo
- **Caractéristiques**:
  - Score de qualité du CV (0-100)
  - Identification des points forts
  - Suggestions d'amélioration concrètes
  - Génération de CV amélioré avec vocabulaire Harvard
  - Fallback sur analyse basée sur règles si l'API échoue

**Exemple de réponse**:
```json
{
  "score": 75,
  "strengths": [
    "Utilisation de données chiffrées",
    "Verbes d'action percutants"
  ],
  "improvements": [
    "Ajouter plus de résultats quantifiés",
    "Structurer avec méthode STAR"
  ],
  "suggestions": [
    "Remplacer 'responsable de' par 'Piloté'",
    "Quantifier l'impact: '+25% de performance'"
  ]
}
```

### 3. **Générateur de lettres de motivation** (`/lettres`)
- **Fichier**: `src/lib/openrouter.ts` → `generateCoverLetter()`
- **Fonctionnalité**: Création de lettres personnalisées
- **Modèle**: GPT-4 Turbo
- **Tons disponibles**:
  - **Formal**: Style corporate classique
  - **Dynamic**: Moderne et énergique
  - **Creative**: Original mais professionnel
  - **Harvard**: Style HBS (concis, orienté résultats)

**Exemple d'utilisation**:
```typescript
import { generateCoverLetter } from '@/lib/openrouter';

const letter = await generateCoverLetter(
  {
    name: "Jean Dupont",
    skills: ["Python", "Finance", "Excel"],
    experience: "Stage M&A chez Rothschild"
  },
  {
    title: "Analyste Investment Banking",
    company: "Goldman Sachs",
    description: "Stage M&A 6 mois"
  },
  'harvard'
);
```

### 4. **Générateur d'emails professionnels**
- **Fichier**: `src/lib/openrouter.ts` → `generateEmail()`
- **Fonctionnalité**: Emails de candidature, relance, remerciement
- **Modèle**: GPT-3.5 Turbo (plus rapide)
- **Types**:
  - `application`: Email de candidature spontanée
  - `followUp`: Relance après candidature
  - `thankYou`: Remerciement post-entretien

### 5. **Analyse de documents**
- **Fichier**: `src/lib/openrouter.ts` → `analyzeDocument()`
- **Fonctionnalité**: Extraction et analyse de contenu
- **Modèle**: GPT-4 Turbo
- **Types d'analyse**:
  - CV: Extraction compétences, expérience, formation
  - Lettre de motivation: Évaluation qualité et structure
  - Général: Résumé et points clés

## 🔧 Architecture technique

### Client OpenRouter (`src/lib/openrouter.ts`)
```typescript
// Appel de base
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string = MODELS.GPT4_TURBO,
  options?: { temperature?, max_tokens?, top_p? }
): Promise<string>

// Fonctions spécialisées
- analyzeCVWithAI(cvText: string)
- generateImprovedCV(cvText: string, improvements: string[])
- generateCoverLetter(userProfile, jobOffer, tone)
- generateEmail(context)
- chatWithAssistant(message, history, context)
- analyzeDocument(text, type)
```

### Gestion des erreurs
Toutes les fonctions incluent un **fallback automatique**:
1. Tentative avec OpenRouter API
2. Si échec → Utilisation de méthodes basées sur règles
3. Logging des erreurs pour débogage
4. Expérience utilisateur maintenue

**Exemple**:
```typescript
try {
  const aiAnalysis = await analyzeCVWithAI(cvText);
  return { analysis: aiAnalysis, method: 'ai' };
} catch (error) {
  console.log('AI failed, using rules:', error);
  const analysis = analyzeCV(cvText, language);
  return { analysis, method: 'rules' };
}
```

## 📊 Coûts et limites

### Tarification OpenRouter
- **GPT-4 Turbo**: ~$0.01 / 1K tokens input, ~$0.03 / 1K tokens output
- **GPT-3.5 Turbo**: ~$0.0005 / 1K tokens input, ~$0.0015 / 1K tokens output
- **Claude 3 Sonnet**: ~$0.003 / 1K tokens input, ~$0.015 / 1K tokens output

### Optimisations implémentées
1. **Sélection intelligente du modèle**:
   - GPT-4 pour analyses complexes (CV, assistant)
   - GPT-3.5 pour tâches simples (emails courts)

2. **Limitation des tokens**:
   - `max_tokens` configuré par fonction
   - Historique de conversation limité (5 derniers messages)

3. **Cache et fallback**:
   - Réponses pré-programmées pour questions simples
   - Fallback sur règles si API indisponible

## 🚀 Utilisation

### Dans une API route
```typescript
import { callOpenRouter, MODELS } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  
  const response = await callOpenRouter(
    [
      { role: 'system', content: 'Tu es un expert en carrière.' },
      { role: 'user', content: message }
    ],
    MODELS.GPT4_TURBO,
    { temperature: 0.7, max_tokens: 1000 }
  );
  
  return NextResponse.json({ response });
}
```

### Dans un composant (via API)
```typescript
const analyzeCV = async (cvText: string) => {
  const response = await fetch('/api/generate/cv-improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'analyze', cvText })
  });
  
  const data = await response.json();
  console.log('Analysis method:', data.method); // 'ai' ou 'rules'
  return data.analysis;
};
```

## 🔒 Sécurité

1. **Clé API**: Stockée dans `.env`, jamais exposée au client
2. **Headers**: Referer et X-Title configurés pour OpenRouter
3. **Validation**: Tous les inputs sont validés avant envoi à l'API
4. **Rate limiting**: Géré par OpenRouter (inclus dans la clé)

## 📝 Logs et débogage

Les logs incluent:
- ✅ Succès des appels API
- ❌ Échecs avec fallback automatique
- 📊 Méthode utilisée ('ai' ou 'rules')
- ⏱️ Temps de réponse

**Exemple de logs**:
```
✅ OpenRouter AI: CV analysis successful (method: ai)
❌ OpenRouter AI failed, using fallback (method: rules)
📊 Assistant response generated in 2.3s
```

## 🎓 Bonnes pratiques

1. **Toujours prévoir un fallback** pour garantir la disponibilité
2. **Utiliser le bon modèle** selon la complexité de la tâche
3. **Limiter les tokens** pour optimiser les coûts
4. **Contextualiser les prompts** avec les données utilisateur
5. **Logger les méthodes** pour monitoring (ai vs rules)

## 🔄 Prochaines améliorations possibles

- [ ] Cache Redis pour réponses fréquentes
- [ ] Fine-tuning de modèles sur données StageFinder
- [ ] Streaming de réponses pour meilleure UX
- [ ] Analytics sur utilisation des modèles
- [ ] A/B testing entre modèles
- [ ] Support multi-langues (FR/EN) automatique

## 📞 Support

En cas de problème:
1. Vérifier que `OPENROUTER_API_KEY` est dans `.env`
2. Consulter les logs serveur pour erreurs API
3. Tester avec `method: 'rules'` pour vérifier le fallback
4. Vérifier le crédit OpenRouter sur https://openrouter.ai/

---

**Date d'intégration**: 24 janvier 2026
**Version**: 1.0.0
**Statut**: ✅ Production Ready
