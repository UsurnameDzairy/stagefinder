// Liste des grandes entreprises à scraper avec leurs URLs carrières
export const FINANCE_COMPANIES = [
  {
    name: "Goldman Sachs",
    domain: "goldmansachs.com",
    careerUrl: "https://www.goldmansachs.com/careers/students/programs",
    programs: ["Summer Analyst", "Graduate Program", "Internship"],
    locations: ["Paris", "London", "New York", "Hong Kong"],
  },
  {
    name: "JP Morgan",
    domain: "jpmorgan.com",
    careerUrl: "https://careers.jpmorgan.com/global/en/students",
    programs: ["Summer Analyst", "Graduate Program", "Spring Week"],
    locations: ["Paris", "London", "New York", "Singapore"],
  },
  {
    name: "Morgan Stanley",
    domain: "morganstanley.com",
    careerUrl: "https://www.morganstanley.com/careers/career-opportunities-search",
    programs: ["Summer Analyst", "Graduate Program", "Internship"],
    locations: ["Paris", "London", "New York", "Tokyo"],
  },
  {
    name: "BNP Paribas",
    domain: "bnpparibas.com",
    careerUrl: "https://careers.bnpparibas.com/fr/etudiants-jeunes-diplomes",
    programs: ["Stage", "VIE", "Graduate Program"],
    locations: ["Paris", "London", "Brussels", "Milan"],
  },
  {
    name: "Société Générale",
    domain: "societegenerale.com",
    careerUrl: "https://careers.societegenerale.com/fr/etudiants",
    programs: ["Stage", "Alternance", "Graduate Program"],
    locations: ["Paris", "London", "Frankfurt", "New York"],
  },
  {
    name: "Crédit Agricole",
    domain: "credit-agricole.com",
    careerUrl: "https://www.ca-cib.fr/carrieres/etudiants-jeunes-diplomes",
    programs: ["Stage", "VIE", "Graduate Program"],
    locations: ["Paris", "London", "Milan", "Hong Kong"],
  },
  {
    name: "Rothschild & Co",
    domain: "rothschildandco.com",
    careerUrl: "https://www.rothschildandco.com/en/careers/students-and-graduates",
    programs: ["Summer Internship", "Graduate Program"],
    locations: ["Paris", "London", "New York", "Zurich"],
  },
  {
    name: "Lazard",
    domain: "lazard.com",
    careerUrl: "https://www.lazard.com/careers/students",
    programs: ["Summer Analyst", "Graduate Program"],
    locations: ["Paris", "London", "New York"],
  },
  {
    name: "Barclays",
    domain: "barclays.com",
    careerUrl: "https://search.jobs.barclays/students",
    programs: ["Summer Internship", "Graduate Programme", "Spring Week"],
    locations: ["Paris", "London", "New York", "Singapore"],
  },
  {
    name: "HSBC",
    domain: "hsbc.com",
    careerUrl: "https://www.hsbc.com/careers/students-and-graduates",
    programs: ["Summer Internship", "Graduate Programme"],
    locations: ["Paris", "London", "Hong Kong", "Singapore"],
  },
  {
    name: "Citi",
    domain: "citi.com",
    careerUrl: "https://jobs.citi.com/students",
    programs: ["Summer Analyst", "Graduate Program"],
    locations: ["Paris", "London", "New York", "Hong Kong"],
  },
  {
    name: "Deutsche Bank",
    domain: "db.com",
    careerUrl: "https://careers.db.com/students",
    programs: ["Summer Analyst", "Graduate Programme"],
    locations: ["Paris", "London", "Frankfurt", "New York"],
  },
  {
    name: "UBS",
    domain: "ubs.com",
    careerUrl: "https://www.ubs.com/careers/students",
    programs: ["Summer Internship", "Graduate Programme"],
    locations: ["Paris", "London", "Zurich", "New York"],
  },
  {
    name: "Credit Suisse",
    domain: "credit-suisse.com",
    careerUrl: "https://www.credit-suisse.com/careers/students",
    programs: ["Summer Analyst", "Graduate Programme"],
    locations: ["Paris", "London", "Zurich", "Singapore"],
  },
  {
    name: "Natixis",
    domain: "natixis.com",
    careerUrl: "https://www.natixis.com/carrieres/etudiants",
    programs: ["Stage", "VIE", "Graduate Program"],
    locations: ["Paris", "London", "New York"],
  },
];

export const TECH_COMPANIES = [
  {
    name: "Google",
    domain: "google.com",
    careerUrl: "https://careers.google.com/students",
    programs: ["STEP Internship", "Software Engineering Internship"],
    locations: ["Paris", "London", "Zurich", "Dublin"],
  },
  {
    name: "Meta",
    domain: "meta.com",
    careerUrl: "https://www.metacareers.com/students",
    programs: ["Software Engineering Internship", "Product Design Internship"],
    locations: ["Paris", "London", "Dublin"],
  },
  {
    name: "Microsoft",
    domain: "microsoft.com",
    careerUrl: "https://careers.microsoft.com/students",
    programs: ["Software Engineering Internship", "Explore Program"],
    locations: ["Paris", "London", "Dublin", "Amsterdam"],
  },
  {
    name: "Amazon",
    domain: "amazon.com",
    careerUrl: "https://www.amazon.jobs/en/teams/internships-for-students",
    programs: ["Software Development Internship", "Graduate Program"],
    locations: ["Paris", "London", "Luxembourg", "Dublin"],
  },
  {
    name: "Apple",
    domain: "apple.com",
    careerUrl: "https://www.apple.com/careers/students",
    programs: ["Software Engineering Internship", "Hardware Engineering Internship"],
    locations: ["Paris", "London", "Munich"],
  },
];

export const CONSULTING_COMPANIES = [
  {
    name: "McKinsey & Company",
    domain: "mckinsey.com",
    careerUrl: "https://www.mckinsey.com/careers/students",
    programs: ["Summer Internship", "Graduate Program"],
    locations: ["Paris", "London", "Brussels", "Amsterdam"],
  },
  {
    name: "Boston Consulting Group",
    domain: "bcg.com",
    careerUrl: "https://careers.bcg.com/students",
    programs: ["Summer Internship", "Associate Program"],
    locations: ["Paris", "London", "Brussels", "Munich"],
  },
  {
    name: "Bain & Company",
    domain: "bain.com",
    careerUrl: "https://www.bain.com/careers/students",
    programs: ["Summer Associate", "Associate Consultant"],
    locations: ["Paris", "London", "Amsterdam", "Munich"],
  },
  {
    name: "Deloitte",
    domain: "deloitte.com",
    careerUrl: "https://www2.deloitte.com/careers/students",
    programs: ["Summer Internship", "Graduate Programme"],
    locations: ["Paris", "London", "Brussels", "Luxembourg"],
  },
  {
    name: "PwC",
    domain: "pwc.com",
    careerUrl: "https://www.pwc.com/careers/students",
    programs: ["Summer Internship", "Graduate Programme"],
    locations: ["Paris", "London", "Luxembourg", "Brussels"],
  },
];

export const ALL_COMPANIES = [
  ...FINANCE_COMPANIES,
  ...TECH_COMPANIES,
  ...CONSULTING_COMPANIES,
];

export type Company = typeof ALL_COMPANIES[0];
