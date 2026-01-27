/**
 * OpenRouter API Client
 * Provides access to various AI models (GPT-4, Claude, etc.) through OpenRouter
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Available models on OpenRouter
 */
export const MODELS = {
  GPT4_TURBO: 'openai/gpt-4-turbo',
  GPT4: 'openai/gpt-4',
  GPT35_TURBO: 'openai/gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
  CLAUDE_3_SONNET: 'anthropic/claude-3-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  GEMINI_PRO: 'google/gemini-pro',
  MISTRAL_LARGE: 'mistralai/mistral-large',
} as const;

// Groq model mapping
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

/**
 * Call Groq API (free fallback)
 */
async function callGroq(
  messages: OpenRouterMessage[],
  model: string = 'llama-3.3-70b-versatile',
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  // Use the model if it's a Groq model, otherwise default
  const groqModel = GROQ_MODELS.includes(model) ? model : 'llama-3.3-70b-versatile';

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: groqModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call OpenRouter API with the specified model and messages
 * Falls back to Groq if OpenRouter fails
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string = MODELS.GPT4_TURBO,
  options: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  } = {}
): Promise<string> {
  // Try Groq first if available (free and fast)
  if (GROQ_API_KEY) {
    try {
      console.log('Using Groq API with model:', model);
      return await callGroq(messages, model, options);
    } catch (groqError) {
      console.error('Groq API failed, trying OpenRouter:', groqError);
    }
  }

  // Fallback to OpenRouter
  if (!API_KEY) {
    throw new Error('No AI API key configured (GROQ_API_KEY or OPENROUTER_API_KEY)');
  }

  const requestBody: OpenRouterRequest = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
    top_p: options.top_p ?? 1,
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'KamForJob',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    throw error;
  }
}

/**
 * Analyze CV and provide improvement suggestions
 */
export async function analyzeCVWithAI(cvText: string): Promise<{
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are an expert career coach and CV analyst. Analyze CVs and provide actionable feedback in French. Be specific, constructive, and professional.',
    },
    {
      role: 'user',
      content: `Analyse ce CV et fournis une évaluation détaillée en JSON avec les champs suivants:
- score (sur 100)
- strengths (liste de 3-5 points forts)
- improvements (liste de 3-5 points à améliorer)
- suggestions (liste de 3-5 suggestions concrètes)

CV:
${cvText}

Réponds uniquement avec un objet JSON valide, sans texte additionnel.`,
    },
  ];

  try {
    const response = await callOpenRouter(messages, MODELS.GPT4_TURBO, { temperature: 0.3 });
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('CV analysis failed:', error);
    throw new Error('Failed to analyze CV with AI');
  }
}

/**
 * Generate improved CV content
 */
export async function generateImprovedCV(
  cvText: string,
  improvements: string[]
): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are an expert CV writer. Improve CVs while maintaining authenticity and professionalism. Write in French.',
    },
    {
      role: 'user',
      content: `Améliore ce CV en tenant compte des points suivants:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

CV actuel:
${cvText}

Fournis une version améliorée du CV, bien structurée et professionnelle.`,
    },
  ];

  return await callOpenRouter(messages, MODELS.GPT4_TURBO, { temperature: 0.5, max_tokens: 3000 });
}

/**
 * Generate cover letter
 */
export async function generateCoverLetter(
  userProfile: {
    name: string;
    skills: string[];
    experience?: string;
  },
  jobOffer: {
    title: string;
    company: string;
    description?: string;
  },
  tone: 'formal' | 'dynamic' | 'creative' | 'harvard' = 'formal'
): Promise<string> {
  const toneInstructions = {
    formal: 'Style corporate classique, très professionnel et structuré',
    dynamic: 'Style moderne et énergique, montrant de l\'enthousiasme',
    creative: 'Style créatif et original, tout en restant professionnel',
    harvard: 'Style Harvard Business School: concis, impactant, orienté résultats avec des verbes d\'action forts',
  };

  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: `You are an expert at writing compelling cover letters. Write in French. ${toneInstructions[tone]}.`,
    },
    {
      role: 'user',
      content: `Rédige une lettre de motivation pour:

Candidat: ${userProfile.name}
Compétences: ${userProfile.skills.join(', ')}
${userProfile.experience ? `Expérience: ${userProfile.experience}` : ''}

Poste: ${jobOffer.title}
Entreprise: ${jobOffer.company}
${jobOffer.description ? `Description: ${jobOffer.description}` : ''}

Ton: ${tone}

La lettre doit être convaincante, personnalisée et mettre en valeur l'adéquation entre le profil et le poste.`,
    },
  ];

  return await callOpenRouter(messages, MODELS.GPT4_TURBO, { temperature: 0.7, max_tokens: 2000 });
}

/**
 * Generate professional email
 */
export async function generateEmail(
  context: {
    type: 'application' | 'followUp' | 'thankYou';
    recipientName?: string;
    companyName: string;
    jobTitle: string;
    userName: string;
  }
): Promise<string> {
  const emailTypes = {
    application: 'email de candidature spontanée',
    followUp: 'email de relance suite à une candidature',
    thankYou: 'email de remerciement après un entretien',
  };

  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are an expert at writing professional emails in French. Be concise, polite, and effective.',
    },
    {
      role: 'user',
      content: `Rédige un ${emailTypes[context.type]} pour:

De: ${context.userName}
À: ${context.recipientName || 'Responsable recrutement'}
Entreprise: ${context.companyName}
Poste: ${context.jobTitle}

L'email doit être professionnel, concis (150-200 mots) et percutant.`,
    },
  ];

  return await callOpenRouter(messages, MODELS.GPT35_TURBO, { temperature: 0.6, max_tokens: 500 });
}

/**
 * Chat assistant for career advice
 */
export async function chatWithAssistant(
  userMessage: string,
  conversationHistory: OpenRouterMessage[] = [],
  userContext?: {
    skills?: string[];
    targetRole?: string;
    experience?: string;
  },
  model?: string
): Promise<string> {
  // Check if a system message already exists in conversation history
  const hasSystemMessage = conversationHistory.some(msg => msg.role === 'system');

  const messages: OpenRouterMessage[] = [];

  // Only add default system message if none provided (language is handled by the system prompt from assistant.ts)
  if (!hasSystemMessage) {
    messages.push({
      role: 'system',
      content: `You are an expert career advisor and job search assistant. Help users with:
- Job search strategies
- CV and cover letter advice
- Interview preparation
- Career development
- Application tracking

Be helpful, encouraging, and provide actionable advice.
${userContext ? `\n\nUser context:\n- Skills: ${userContext.skills?.join(', ') || 'N/A'}\n- Target role: ${userContext.targetRole || 'N/A'}\n- Experience: ${userContext.experience || 'N/A'}` : ''}`,
    });
  }

  // Add conversation history (which may include the system message with language directive)
  messages.push(...conversationHistory.filter(msg => msg.role !== 'system' || !hasSystemMessage));

  // If there's a system message in history, add it first
  const systemFromHistory = conversationHistory.find(msg => msg.role === 'system');
  if (systemFromHistory && hasSystemMessage) {
    // Replace default with the provided system message
    messages.length = 0;
    messages.push(systemFromHistory);
    messages.push(...conversationHistory.filter(msg => msg.role !== 'system'));
  }

  messages.push({ role: 'user', content: userMessage });

  return await callOpenRouter(messages, model || MODELS.GPT4_TURBO, { temperature: 0.7, max_tokens: 1500 });
}

/**
 * Extract text and analyze document
 */
export async function analyzeDocument(
  documentText: string,
  analysisType: 'cv' | 'coverLetter' | 'general' = 'general'
): Promise<{
  summary: string;
  keyPoints: string[];
  suggestions?: string[];
}> {
  const analysisPrompts = {
    cv: 'Analyse ce CV et extrais les informations clés: compétences, expérience, formation, points forts.',
    coverLetter: 'Analyse cette lettre de motivation et évalue sa qualité, sa structure et son impact.',
    general: 'Analyse ce document et fournis un résumé avec les points clés.',
  };

  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are a document analysis expert. Provide clear, structured analysis in French.',
    },
    {
      role: 'user',
      content: `${analysisPrompts[analysisType]}

Document:
${documentText}

Réponds en JSON avec: summary (string), keyPoints (array), suggestions (array optionnel).`,
    },
  ];

  try {
    const response = await callOpenRouter(messages, MODELS.GPT4_TURBO, { temperature: 0.3 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Document analysis failed:', error);
    throw new Error('Failed to analyze document');
  }
}
