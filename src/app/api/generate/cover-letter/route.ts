import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Harvard-style Cover Letter Generator
 * Uses sophisticated vocabulary and professional structure
 */

interface GeneratorOptions {
  userName: string;
  companyName: string;
  jobTitle: string;
  skills: string[];
  education: string;
  domains: string[];
  tone: "formal" | "dynamic" | "creative" | "harvard";
  language: "fr" | "en";
}

// Harvard-style vocabulary and phrases
const HARVARD_VOCABULARY = {
  en: {
    greetings: "Dear Hiring Manager,",
    introduction: [
      "I am writing to express my strong interest in the {jobTitle} position at {companyName}.",
      "I am eager to contribute my expertise and passion to {companyName} as a {jobTitle}.",
      "With great enthusiasm, I submit my application for the {jobTitle} role at {companyName}.",
    ],
    skills: [
      "Throughout my academic and professional journey, I have cultivated a robust skill set encompassing {skills}, which I am confident will prove invaluable to your esteemed organization.",
      "My proficiency in {skills} has been honed through rigorous academic training and hands-on experience, positioning me to deliver immediate and lasting impact.",
      "I bring a comprehensive command of {skills}, complemented by a proven track record of excellence and continuous improvement.",
    ],
    education: [
      "Currently pursuing {education}, I have demonstrated consistent academic excellence while actively engaging in extracurricular leadership opportunities.",
      "My academic background in {education} has equipped me with both theoretical foundations and practical competencies essential for success in this role.",
      "As a dedicated student at {education}, I have consistently sought opportunities to apply classroom knowledge to real-world challenges.",
    ],
    motivation: [
      "{companyName}'s commitment to innovation and excellence resonates deeply with my professional aspirations. I am particularly drawn to your organization's reputation for fostering talent and driving industry-leading initiatives.",
      "The opportunity to contribute to {companyName}'s continued success while advancing my own professional development represents an ideal alignment of mutual interests.",
      "I am inspired by {companyName}'s distinguished position in the industry and would be honored to contribute my skills and dedication to your team's objectives.",
    ],
    closing: [
      "I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to {companyName}'s continued success. Thank you for considering my application.",
      "I am eager to elaborate on my qualifications in an interview setting. Thank you for your time and consideration.",
      "I look forward to the possibility of contributing to your team and would appreciate the opportunity to discuss my candidacy further.",
    ],
    signature: "Respectfully yours,",
  },
  fr: {
    greetings: "Madame, Monsieur,",
    introduction: [
      "C'est avec un vif intérêt que je vous soumets ma candidature pour le poste de {jobTitle} au sein de {companyName}.",
      "Animé(e) par une profonde motivation, je me permets de vous adresser ma candidature pour le poste de {jobTitle} chez {companyName}.",
      "Fort(e) d'un parcours académique d'excellence, je souhaite mettre mes compétences au service de {companyName} en tant que {jobTitle}.",
    ],
    skills: [
      "Mon parcours m'a permis de développer une maîtrise approfondie de {skills}, compétences que je suis impatient(e) de mettre au service de votre organisation.",
      "J'ai acquis une expertise solide en {skills}, fruit d'une formation rigoureuse et d'expériences professionnelles enrichissantes.",
      "Ma maîtrise de {skills} s'appuie sur une formation d'excellence et une pratique constante, me permettant d'apporter une contribution immédiate et durable.",
    ],
    education: [
      "Actuellement {education}, je cultive l'excellence académique tout en développant des compétences de leadership à travers diverses responsabilités.",
      "Ma formation en {education} m'a doté(e) des fondements théoriques et des aptitudes pratiques indispensables à ce poste.",
      "En tant qu'étudiant(e) à {education}, je m'efforce constamment d'appliquer mes connaissances académiques à des défis concrets.",
    ],
    motivation: [
      "L'engagement de {companyName} envers l'excellence et l'innovation correspond parfaitement à mes aspirations professionnelles. Votre réputation d'excellence et votre position de leader sectoriel m'inspirent particulièrement.",
      "Contribuer au succès de {companyName} tout en poursuivant mon développement professionnel représente une opportunité exceptionnelle d'alignement de nos intérêts mutuels.",
      "Je suis profondément inspiré(e) par le rayonnement de {companyName} et serais honoré(e) de mettre mes compétences et mon dévouement au service de vos objectifs.",
    ],
    closing: [
      "Je serais ravi(e) d'approfondir lors d'un entretien la manière dont mon profil pourrait contribuer au succès continu de {companyName}. Je vous remercie de l'attention portée à ma candidature.",
      "Je me tiens à votre entière disposition pour un entretien au cours duquel je pourrais vous exposer plus en détail mes motivations. Avec mes respectueux remerciements.",
      "Dans l'attente de pouvoir échanger avec vous, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    ],
    signature: "Respectueusement,",
  },
};

const STANDARD_VOCABULARY = {
  en: {
    formal: {
      greetings: "Dear Sir or Madam,",
      closing: "Yours faithfully,",
    },
    dynamic: {
      greetings: "Hello,",
      closing: "Best regards,",
    },
    creative: {
      greetings: "Dear Hiring Team,",
      closing: "Looking forward to connecting!",
    },
  },
  fr: {
    formal: {
      greetings: "Madame, Monsieur,",
      closing: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    },
    dynamic: {
      greetings: "Bonjour,",
      closing: "Dans l'attente de votre retour, je vous adresse mes meilleures salutations.",
    },
    creative: {
      greetings: "Cher recruteur, Chère recruteuse,",
      closing: "Au plaisir d'échanger avec vous très prochainement !",
    },
  },
};

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });
  return result;
}

function generateCoverLetter(options: GeneratorOptions): string {
  const { userName, companyName, jobTitle, skills, education, domains, tone, language } = options;
  
  const date = new Date().toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const variables = {
    jobTitle,
    companyName,
    skills: skills.slice(0, 4).join(", ") || (language === "fr" ? "diverses compétences" : "various skills"),
    education: education || (language === "fr" ? "étudiant(e)" : "student"),
    domain: domains[0] || (language === "fr" ? "mon domaine" : "my field"),
  };

  // Harvard-style letter
  if (tone === "harvard") {
    const vocab = HARVARD_VOCABULARY[language];
    const randomPick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const letter = `
${userName}
${date}

${language === "fr" ? "Objet" : "Re"}: ${language === "fr" ? "Candidature au poste de" : "Application for"} ${jobTitle}

${vocab.greetings}

${replaceVariables(randomPick(vocab.introduction), variables)}

${replaceVariables(randomPick(vocab.education), variables)}

${replaceVariables(randomPick(vocab.skills), variables)}

${replaceVariables(randomPick(vocab.motivation), variables)}

${replaceVariables(randomPick(vocab.closing), variables)}

${vocab.signature}

${userName}
`.trim();

    return letter;
  }

  // Standard tones
  const stdTone = tone as "formal" | "dynamic" | "creative";
  const stdVocab = STANDARD_VOCABULARY[language][stdTone];
  
  const introductions = {
    en: {
      formal: `I am writing to apply for the position of ${jobTitle} at ${companyName}.`,
      dynamic: `I'm excited to apply for the ${jobTitle} role at ${companyName}!`,
      creative: `${companyName} has always inspired me, and I'm thrilled to apply for the ${jobTitle} position.`,
    },
    fr: {
      formal: `Je me permets de vous adresser ma candidature pour le poste de ${jobTitle} au sein de ${companyName}.`,
      dynamic: `C'est avec enthousiasme que je postule au poste de ${jobTitle} chez ${companyName} !`,
      creative: `${companyName} m'inspire depuis longtemps, et c'est avec passion que je postule au poste de ${jobTitle}.`,
    },
  };

  const skillsText = skills.length > 0
    ? language === "fr"
      ? `Mes compétences en ${skills.slice(0, 3).join(", ")} me permettent d'apporter une réelle valeur ajoutée.`
      : `My skills in ${skills.slice(0, 3).join(", ")} will enable me to add significant value.`
    : language === "fr"
      ? "Mon parcours m'a permis de développer des compétences variées."
      : "My background has equipped me with diverse competencies.";

  const educationText = education
    ? language === "fr"
      ? `Actuellement ${education}, je recherche une opportunité enrichissante.`
      : `Currently ${education}, I am seeking a rewarding opportunity.`
    : "";

  const letter = `
${userName}
${date}

${language === "fr" ? "Objet" : "Re"}: ${language === "fr" ? "Candidature au poste de" : "Application for"} ${jobTitle}

${stdVocab.greetings}

${introductions[language][stdTone]}

${educationText}

${skillsText}

${stdVocab.closing}

${userName}
`.trim();

  return letter;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, jobTitle, tone = "harvard", language = "fr", save = false } = body;

    if (!companyName || !jobTitle) {
      return NextResponse.json(
        { error: "Company name and job title are required" },
        { status: 400 }
      );
    }

    // Récupérer le profil utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        skills: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Candidat";
    const userSkills = user.skills.map(s => s.name);
    const userDomains = user.profile?.domains?.split(",").map(d => d.trim()).filter(Boolean) || [];
    const education = user.profile?.educationLevel
      ? `${user.profile.educationLevel}${user.profile.schoolName ? ` à ${user.profile.schoolName}` : ""}`
      : "";

    // Générer la lettre avec style Harvard par défaut
    const content = generateCoverLetter({
      userName,
      companyName,
      jobTitle,
      skills: userSkills,
      education,
      domains: userDomains,
      tone: tone as "formal" | "dynamic" | "creative" | "harvard",
      language: language as "fr" | "en",
    });

    // Sauvegarder si demandé
    let coverLetter = null;
    if (save) {
      coverLetter = await prisma.coverLetter.create({
        data: {
          userId: session.id,
          companyName,
          jobTitle,
          content,
          tone,
          language: "fr",
        },
      });
    }

    return NextResponse.json({
      success: true,
      coverLetter: {
        content,
        companyName,
        jobTitle,
        tone,
        id: coverLetter?.id,
      },
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coverLetters });
  } catch (error) {
    console.error("Cover letters fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cover letters" },
      { status: 500 }
    );
  }
}
