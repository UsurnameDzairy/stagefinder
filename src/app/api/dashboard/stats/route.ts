import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Liste des compétences valides (techniques et professionnelles)
const VALID_SKILLS = new Set([
  // Programming Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "c", "php", "ruby", "go", "rust",
  "swift", "kotlin", "scala", "r", "matlab", "sql", "html", "css", "sass", "less",
  // Frameworks
  "react", "react native", "angular", "vue.js", "vue", "next.js", "nuxt.js", "svelte",
  "node.js", "express.js", "express", "nestjs", "django", "flask", "fastapi",
  "spring", "spring boot", "laravel", "symfony", "ruby on rails", "rails",
  "asp.net", ".net core", ".net", "jquery", "bootstrap", "tailwind css", "tailwind",
  "redux", "graphql", "prisma", "flutter", "ionic",
  // Databases
  "mongodb", "postgresql", "mysql", "mariadb", "sqlite", "redis", "elasticsearch",
  "oracle", "sql server", "cassandra", "dynamodb", "firebase", "supabase",
  // Cloud & DevOps
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins",
  "terraform", "ansible", "nginx", "apache", "heroku", "vercel", "netlify",
  "linux", "ubuntu", "ci/cd", "devops", "microservices", "serverless",
  // Data & AI
  "machine learning", "ml", "deep learning", "artificial intelligence", "ai",
  "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
  "data analysis", "data science", "big data", "hadoop", "spark", "kafka",
  "nlp", "computer vision", "tableau", "power bi",
  // Finance
  "excel", "vba", "bloomberg", "financial modeling", "valuation", "m&a",
  "dcf", "lbo", "trading", "risk management", "portfolio management",
  "private equity", "investment banking", "hedge fund", "quantitative finance",
  "accounting", "audit", "ifrs", "budgeting", "forecasting",
  // Business
  "project management", "agile", "scrum", "kanban", "product management",
  "business analysis", "strategy", "consulting", "marketing", "digital marketing",
  "seo", "sales", "crm", "salesforce", "hubspot", "sap", "erp",
  // Soft Skills
  "leadership", "communication", "teamwork", "problem solving", "creativity",
  "adaptability", "time management", "negotiation", "presentation",
  // Languages
  "english", "anglais", "french", "français", "spanish", "espagnol",
  "german", "allemand", "italian", "italien", "chinese", "chinois", "japanese", "japonais",
  // Tools
  "git", "github", "gitlab", "jira", "confluence", "trello", "figma", "sketch",
  "photoshop", "illustrator", "vs code", "postman", "jupyter",
  // Design
  "ui/ux", "ux design", "ui design", "graphic design", "web design",
  // More Finance
  "finance", "corporate finance", "asset management", "equity research",
  "credit analysis", "derivatives", "fixed income", "venture capital",
]);

// Vérifie si un skill est valide (pas une date, un lieu, etc.)
function isValidSkill(skillName: string): boolean {
  if (!skillName || skillName.length < 2) return false;

  const normalized = skillName.toLowerCase().trim();

  // Rejeter les dates
  if (/^\d{4}$/.test(normalized)) return false;
  if (/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i.test(normalized)) return false;
  if (/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(normalized)) return false;
  if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(normalized)) return false;

  // Rejeter les mots trop courts sauf exceptions
  if (normalized.length <= 2 && !["ai", "ml", "r", "c"].includes(normalized)) return false;

  // Vérifier si c'est dans la liste des skills valides
  return VALID_SKILLS.has(normalized);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get basic counts from database
    const savedOffers = await prisma.savedOffer.count({ where: { userId: session.id } });
    const savedCompanies = await prisma.savedCompany.count({ where: { userId: session.id } });
    const applications = await prisma.application.count({ where: { userId: session.id, status: { not: "NOT_APPLIED" } } });
    const interviews = await prisma.application.count({ where: { userId: session.id, status: "INTERVIEW" } });

    // Calculate real application status percentages
    const pending = await prisma.application.count({ where: { userId: session.id, status: { in: ["APPLIED", "IN_PROGRESS"] } } });
    const rejected = await prisma.application.count({ where: { userId: session.id, status: "REJECTED" } });

    const applicationStatus = applications > 0 ? {
      pending: Math.round((pending / applications) * 100),
      interview: Math.round((interviews / applications) * 100),
      rejected: Math.round((rejected / applications) * 100),
      responseRate: Math.round(((interviews + rejected) / applications) * 100)
    } : null;

    // Get user skills from profile if they exist
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { skills: true }
    });

    // Filtrer pour ne garder que les vrais skills et limiter à 6
    const validSkills = user?.skills && Array.isArray(user.skills)
      ? user.skills.filter((skill: any) => isValidSkill(skill.name || skill)).slice(0, 6)
      : [];

    const skillsCoverage = validSkills.length > 0
      ? validSkills.map((skill: any, index: number) => ({
        label: skill.name || skill,
        value: skill.level || (85 - index * 10), // Niveaux décroissants: 85, 75, 65, 55...
        color: (skill.level || (85 - index * 10)) >= 80 ? "bg-white" : (skill.level || (85 - index * 10)) >= 60 ? "bg-zinc-400" : "bg-zinc-700"
      }))
      : null;

    return NextResponse.json({
      stats: {
        savedOffers,
        savedCompanies,
        applications,
        interviews,
        matchTrend: null, // No real data yet
        skillsCoverage,
        searchActivity: null, // No real data yet
        applicationStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
