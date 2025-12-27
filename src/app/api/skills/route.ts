import { NextRequest, NextResponse } from "next/server";
import { 
  DOMAIN_SKILLS, 
  getSkillsByDomain, 
  getSkillsByCategoryForDomain,
  getAllDomains,
  searchSkills 
} from "@/lib/skills-database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domainId = searchParams.get("domain");
  const search = searchParams.get("search");
  const grouped = searchParams.get("grouped") === "true";

  // Recherche de skills
  if (search) {
    const results = searchSkills(search);
    return NextResponse.json({ skills: results });
  }

  // Skills par domaine
  if (domainId) {
    if (grouped) {
      const categories = getSkillsByCategoryForDomain(domainId);
      return NextResponse.json({ categories });
    }
    const skills = getSkillsByDomain(domainId);
    return NextResponse.json({ skills });
  }

  // Tous les domaines
  const domains = getAllDomains();
  return NextResponse.json({ domains, allSkills: DOMAIN_SKILLS });
}
