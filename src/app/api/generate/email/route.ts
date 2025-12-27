import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL_TEMPLATES = {
  application: {
    subject: "Candidature - {jobTitle} - {userName}",
    body: `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de {jobTitle} au sein de votre entreprise {companyName}.

{motivation}

Actuellement {education}, je suis à la recherche d'une opportunité qui me permettrait de mettre en pratique mes compétences en {skills}.

{experience}

Je serais ravi(e) de pouvoir échanger avec vous lors d'un entretien afin de vous présenter plus en détail mon parcours et ma motivation.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{userName}
{userEmail}
{userPhone}`,
  },
  followUp: {
    subject: "Relance - Candidature {jobTitle} - {userName}",
    body: `Madame, Monsieur,

Je me permets de revenir vers vous concernant ma candidature pour le poste de {jobTitle}, envoyée le {appliedDate}.

Je reste très intéressé(e) par cette opportunité et souhaiterais savoir si vous avez eu l'occasion d'examiner mon dossier.

Je reste à votre disposition pour tout complément d'information ou pour convenir d'un entretien.

Cordialement,

{userName}
{userEmail}
{userPhone}`,
  },
  thankYou: {
    subject: "Remerciements suite à notre entretien - {jobTitle}",
    body: `Madame, Monsieur,

Je tenais à vous remercier pour l'entretien que vous m'avez accordé le {interviewDate} concernant le poste de {jobTitle}.

Notre échange a renforcé mon intérêt pour cette opportunité et pour {companyName}. Les missions décrites correspondent parfaitement à mes aspirations professionnelles.

Je reste à votre disposition pour tout complément d'information.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{userName}`,
  },
};

function generateMotivation(companyName: string, jobTitle: string, domains: string[]): string {
  const domainText = domains.length > 0 
    ? `Mon intérêt pour ${domains.slice(0, 2).join(" et ")} m'a naturellement orienté(e) vers votre entreprise.`
    : `Votre entreprise représente pour moi une opportunité unique de développement professionnel.`;
  
  return `${domainText} La réputation de ${companyName} dans son secteur d'activité et les défis que propose ce poste de ${jobTitle} correspondent parfaitement à mes ambitions.`;
}

function generateExperience(skills: string[]): string {
  if (skills.length === 0) {
    return "Mon parcours académique et mes projets personnels m'ont permis de développer une solide base de compétences.";
  }
  
  const skillsList = skills.slice(0, 4).join(", ");
  return `Au cours de mon parcours, j'ai eu l'opportunité de développer mes compétences en ${skillsList}. Ces expériences m'ont permis d'acquérir une approche rigoureuse et pragmatique.`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, companyName, jobTitle, contactName, appliedDate, interviewDate } = body;

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

    const template = EMAIL_TEMPLATES[type as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Candidat";
    const userSkills = user.skills.map(s => s.name);
    const userDomains = user.profile?.domains?.split(",").map(d => d.trim()) || [];
    const education = user.profile?.educationLevel 
      ? `${user.profile.educationLevel}${user.profile.schoolName ? ` à ${user.profile.schoolName}` : ""}`
      : "étudiant(e)";

    // Générer le contenu personnalisé
    const motivation = generateMotivation(companyName, jobTitle, userDomains);
    const experience = generateExperience(userSkills);

    // Remplacer les variables
    let subject = template.subject;
    let emailBody = template.body;

    const replacements: Record<string, string> = {
      "{companyName}": companyName,
      "{jobTitle}": jobTitle,
      "{userName}": userName,
      "{userEmail}": user.email,
      "{userPhone}": user.profile?.phone || "",
      "{contactName}": contactName || "Responsable RH",
      "{motivation}": motivation,
      "{experience}": experience,
      "{skills}": userSkills.slice(0, 3).join(", ") || "diverses compétences",
      "{education}": education,
      "{appliedDate}": appliedDate || new Date().toLocaleDateString("fr-FR"),
      "{interviewDate}": interviewDate || "",
    };

    Object.entries(replacements).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key, "g"), value);
      emailBody = emailBody.replace(new RegExp(key, "g"), value);
    });

    // Nettoyer les lignes vides en trop
    emailBody = emailBody.replace(/\n{3,}/g, "\n\n");

    return NextResponse.json({
      success: true,
      email: {
        subject,
        body: emailBody,
        to: contactName ? `${contactName}` : companyName,
      },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 });
  }
}
