import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, FINANCE_COMPANIES, TECH_COMPANIES, CONSULTING_COMPANIES } from "@/lib/scrapers/companies";
import { scrapeMultipleCompanies, filterJobs } from "@/lib/scrapers/scraper";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sector, companies: selectedCompanies } = body;

    let companiesToScrape = ALL_COMPANIES;
    
    if (sector === "finance") {
      companiesToScrape = FINANCE_COMPANIES;
    } else if (sector === "tech") {
      companiesToScrape = TECH_COMPANIES;
    } else if (sector === "consulting") {
      companiesToScrape = CONSULTING_COMPANIES;
    } else if (selectedCompanies && Array.isArray(selectedCompanies)) {
      companiesToScrape = ALL_COMPANIES.filter((c) =>
        selectedCompanies.includes(c.name)
      );
    }

    console.log(`Starting scrape for ${companiesToScrape.length} companies...`);
    
    const results = await scrapeMultipleCompanies(companiesToScrape, 3);
    
    // Sauvegarder les offres en base de données
    let savedCount = 0;
    for (const result of results) {
      if (result.success) {
        for (const job of result.jobs) {
          try {
            // Vérifier si l'offre existe déjà
            const existing = await prisma.jobOffer.findFirst({
              where: {
                title: job.title,
                companyName: job.company,
                location: job.location,
              },
            });

            if (!existing) {
              await prisma.jobOffer.create({
                data: {
                  sourceProvider: "scraper",
                  sourceUrl: job.url,
                  title: job.title,
                  companyName: job.company,
                  location: job.location,
                  contractType: job.type,
                  description: job.description,
                  requirements: job.requirements?.join("\n"),
                  publishedAt: job.postedDate || new Date(),
                  expiresAt: job.deadline,
                },
              });
              savedCount++;
            }
          } catch (error) {
            console.error(`Error saving job ${job.title}:`, error);
          }
        }
      }
    }

    const totalJobs = results.reduce((sum, r) => sum + r.jobs.length, 0);
    const successfulScrapes = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Scraped ${successfulScrapes}/${results.length} companies`,
      stats: {
        companiesScraped: successfulScrapes,
        totalJobsFound: totalJobs,
        jobsSaved: savedCount,
        jobsSkipped: totalJobs - savedCount,
      },
      results: results.map((r) => ({
        company: r.company,
        success: r.success,
        jobCount: r.jobs.length,
        error: r.error,
      })),
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape companies" },
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const company = searchParams.get("company");
    const search = searchParams.get("search");

    const where: any = {};

    if (type) where.contractType = type;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (company) where.companyName = { contains: company, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.jobOffer.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
