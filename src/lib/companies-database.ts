/**
 * Base de données complète d'entreprises par secteur et par ville
 * Pour maximiser les chances de trouver des stages
 * Inclut les compétences requises par domaine et les liens directs
 */

export interface CompanyInfo {
  name: string;
  sector: string;
  city: string;
  country: string;
  website?: string;
  linkedinUrl?: string;
  careersUrl?: string;
}

// ============================================
// COMPÉTENCES REQUISES PAR DOMAINE
// ============================================

export const SKILLS_BY_DOMAIN: Record<string, {
  required: string[];
  preferred: string[];
  languages: string[];
  certifications: string[];
}> = {
  finance: {
    required: [
      "Excel", "Financial Modeling", "Valuation", "Accounting", "Financial Analysis",
      "PowerPoint", "Bloomberg Terminal", "DCF", "LBO Modeling", "M&A",
      "Corporate Finance", "Investment Analysis", "Risk Management"
    ],
    preferred: [
      "Python", "VBA", "SQL", "Power BI", "Tableau", "Reuters Eikon",
      "FactSet", "Capital IQ", "PitchBook", "Dealogic"
    ],
    languages: ["English (Fluent)", "French", "German", "Italian"],
    certifications: ["CFA", "FRM", "CAIA", "Bloomberg Market Concepts"]
  },
  
  privateEquity: {
    required: [
      "Financial Modeling", "LBO Modeling", "Valuation", "Due Diligence",
      "Excel", "PowerPoint", "M&A", "Investment Analysis"
    ],
    preferred: [
      "Python", "SQL", "CapIQ", "PitchBook", "Preqin", "Deal Sourcing"
    ],
    languages: ["English (Fluent)", "French"],
    certifications: ["CFA", "CAIA"]
  },
  
  assetManagement: {
    required: [
      "Portfolio Management", "Financial Analysis", "Excel", "Bloomberg",
      "Risk Management", "Equity Research", "Fixed Income"
    ],
    preferred: [
      "Python", "R", "MATLAB", "VBA", "Morningstar", "FactSet"
    ],
    languages: ["English (Fluent)", "French"],
    certifications: ["CFA", "CAIA", "FRM"]
  },
  
  trading: {
    required: [
      "Market Analysis", "Risk Management", "Excel", "Bloomberg",
      "Derivatives", "Fixed Income", "Equities", "FX"
    ],
    preferred: [
      "Python", "C++", "Java", "SQL", "Algorithmic Trading", "Quantitative Analysis"
    ],
    languages: ["English (Fluent)"],
    certifications: ["CFA", "FRM", "Series 7"]
  },
  
  consulting: {
    required: [
      "PowerPoint", "Excel", "Problem Solving", "Data Analysis",
      "Business Strategy", "Project Management", "Communication"
    ],
    preferred: [
      "Python", "SQL", "Tableau", "Power BI", "Alteryx", "Think-Cell"
    ],
    languages: ["English (Fluent)", "French", "German"],
    certifications: ["PMP", "Six Sigma", "Lean"]
  },
  
  tech: {
    required: [
      "Programming", "Problem Solving", "Git", "Agile/Scrum"
    ],
    preferred: [
      "JavaScript", "TypeScript", "Python", "Java", "React", "Node.js",
      "SQL", "AWS", "Docker", "Kubernetes", "Machine Learning"
    ],
    languages: ["English (Fluent)"],
    certifications: ["AWS Certified", "Google Cloud", "Azure", "Scrum Master"]
  },
  
  dataScience: {
    required: [
      "Python", "SQL", "Machine Learning", "Statistics", "Data Visualization"
    ],
    preferred: [
      "R", "TensorFlow", "PyTorch", "Spark", "Hadoop", "Tableau", "Power BI",
      "Deep Learning", "NLP", "Computer Vision"
    ],
    languages: ["English (Fluent)"],
    certifications: ["Google Data Analytics", "IBM Data Science", "AWS ML"]
  },
  
  marketing: {
    required: [
      "Digital Marketing", "Social Media", "Content Creation", "Analytics",
      "SEO/SEM", "Google Analytics", "Communication"
    ],
    preferred: [
      "Google Ads", "Meta Ads", "HubSpot", "Salesforce", "Adobe Creative Suite",
      "Canva", "Mailchimp", "A/B Testing"
    ],
    languages: ["English (Fluent)", "French"],
    certifications: ["Google Analytics", "Google Ads", "HubSpot", "Meta Blueprint"]
  },
  
  luxury: {
    required: [
      "Customer Service", "Sales", "Brand Knowledge", "Communication",
      "Presentation", "CRM"
    ],
    preferred: [
      "Luxury Brand Experience", "Visual Merchandising", "Event Management",
      "Clienteling", "Salesforce"
    ],
    languages: ["English (Fluent)", "French", "Mandarin", "Arabic", "Russian"],
    certifications: []
  },
  
  yachting: {
    required: [
      "Maritime Knowledge", "Customer Service", "Safety Procedures",
      "Communication", "Teamwork"
    ],
    preferred: [
      "STCW", "Yacht Master", "ENG1", "Food Safety", "Wine Knowledge",
      "Event Planning"
    ],
    languages: ["English (Fluent)", "French", "Italian", "Spanish"],
    certifications: ["STCW", "Yacht Master", "ENG1", "GMDSS"]
  },
  
  sport: {
    required: [
      "Sports Knowledge", "Event Management", "Communication",
      "Project Management", "Marketing"
    ],
    preferred: [
      "Sponsorship", "Media Relations", "Social Media", "Data Analysis",
      "Ticketing Systems", "CRM"
    ],
    languages: ["English (Fluent)", "French", "Spanish"],
    certifications: ["Sports Management", "Event Management"]
  },
  
  communication: {
    required: [
      "Writing", "Public Relations", "Media Relations", "Social Media",
      "Crisis Communication", "Event Management"
    ],
    preferred: [
      "Adobe Creative Suite", "Canva", "Video Editing", "Photography",
      "Influencer Marketing", "Press Release Writing"
    ],
    languages: ["English (Fluent)", "French"],
    certifications: ["PR Certification", "Social Media Marketing"]
  }
};

// ============================================
// LIENS LINKEDIN PAR ENTREPRISE (pour scraping direct)
// ============================================

export const COMPANY_LINKEDIN_URLS: Record<string, string> = {
  // Finance - Monaco
  "CMB Monaco": "https://www.linkedin.com/company/cmb-monaco/jobs/",
  "Julius Baer Monaco": "https://www.linkedin.com/company/julius-baer/jobs/",
  "UBS Monaco": "https://www.linkedin.com/company/ubs/jobs/",
  "Edmond de Rothschild Monaco": "https://www.linkedin.com/company/edmond-de-rothschild/jobs/",
  "Lombard Odier Monaco": "https://www.linkedin.com/company/lombard-odier/jobs/",
  "Pictet Monaco": "https://www.linkedin.com/company/pictet/jobs/",
  
  // Finance - Paris
  "BNP Paribas": "https://www.linkedin.com/company/bnp-paribas/jobs/",
  "Société Générale": "https://www.linkedin.com/company/societe-generale/jobs/",
  "Crédit Agricole CIB": "https://www.linkedin.com/company/credit-agricole-cib/jobs/",
  "Natixis": "https://www.linkedin.com/company/natixis/jobs/",
  "Rothschild & Co": "https://www.linkedin.com/company/rothschild-&-co/jobs/",
  "Lazard Paris": "https://www.linkedin.com/company/lazard/jobs/",
  "Ardian": "https://www.linkedin.com/company/ardian/jobs/",
  "PAI Partners": "https://www.linkedin.com/company/pai-partners/jobs/",
  "Tikehau Capital": "https://www.linkedin.com/company/tikehau-capital/jobs/",
  "Eurazeo": "https://www.linkedin.com/company/eurazeo/jobs/",
  "Amundi": "https://www.linkedin.com/company/amundi/jobs/",
  "Carmignac": "https://www.linkedin.com/company/carmignac/jobs/",
  
  // Finance - London
  "Goldman Sachs": "https://www.linkedin.com/company/goldman-sachs/jobs/",
  "JP Morgan": "https://www.linkedin.com/company/jpmorgan/jobs/",
  "Morgan Stanley": "https://www.linkedin.com/company/morgan-stanley/jobs/",
  "Blackstone": "https://www.linkedin.com/company/the-blackstone-group/jobs/",
  "KKR": "https://www.linkedin.com/company/kkr/jobs/",
  "Carlyle Group": "https://www.linkedin.com/company/the-carlyle-group/jobs/",
  "Barclays": "https://www.linkedin.com/company/barclays/jobs/",
  "HSBC": "https://www.linkedin.com/company/hsbc/jobs/",
  
  // Finance - Switzerland
  "UBS": "https://www.linkedin.com/company/ubs/jobs/",
  "Credit Suisse": "https://www.linkedin.com/company/credit-suisse/jobs/",
  "Pictet": "https://www.linkedin.com/company/pictet/jobs/",
  "Lombard Odier": "https://www.linkedin.com/company/lombard-odier/jobs/",
  "Partners Group": "https://www.linkedin.com/company/partners-group/jobs/",
  
  // Tech
  "Google France": "https://www.linkedin.com/company/google/jobs/",
  "Meta France": "https://www.linkedin.com/company/meta/jobs/",
  "Amazon France": "https://www.linkedin.com/company/amazon/jobs/",
  "Microsoft France": "https://www.linkedin.com/company/microsoft/jobs/",
  "Doctolib": "https://www.linkedin.com/company/doctolib/jobs/",
  "BlaBlaCar": "https://www.linkedin.com/company/blablacar/jobs/",
  "Datadog": "https://www.linkedin.com/company/datadog/jobs/",
  "Contentsquare": "https://www.linkedin.com/company/contentsquare/jobs/",
  "Revolut": "https://www.linkedin.com/company/revolut/jobs/",
  
  // Consulting
  "McKinsey & Company": "https://www.linkedin.com/company/mckinsey/jobs/",
  "Boston Consulting Group": "https://www.linkedin.com/company/boston-consulting-group/jobs/",
  "Bain & Company": "https://www.linkedin.com/company/bain-and-company/jobs/",
  "Deloitte": "https://www.linkedin.com/company/deloitte/jobs/",
  "PwC": "https://www.linkedin.com/company/pwc/jobs/",
  "EY": "https://www.linkedin.com/company/ernstandyoung/jobs/",
  "KPMG": "https://www.linkedin.com/company/kpmg/jobs/",
  "Accenture": "https://www.linkedin.com/company/accenture/jobs/",
  
  // Luxury
  "LVMH": "https://www.linkedin.com/company/lvmh/jobs/",
  "Kering": "https://www.linkedin.com/company/kering/jobs/",
  "Hermès": "https://www.linkedin.com/company/hermes/jobs/",
  "Chanel": "https://www.linkedin.com/company/chanel/jobs/",
  "L'Oréal": "https://www.linkedin.com/company/loreal/jobs/",
  "Dior": "https://www.linkedin.com/company/dior/jobs/",
  "Louis Vuitton": "https://www.linkedin.com/company/louis-vuitton/jobs/",
  "Cartier": "https://www.linkedin.com/company/cartier/jobs/",
  "Rolex": "https://www.linkedin.com/company/rolex/jobs/",
  
  // Marketing
  "Publicis Groupe": "https://www.linkedin.com/company/publicis-groupe/jobs/",
  "Havas": "https://www.linkedin.com/company/havas/jobs/",
  "WPP": "https://www.linkedin.com/company/wpp/jobs/",
  "Dentsu": "https://www.linkedin.com/company/dentsu/jobs/",
  
  // Yachting
  "Camper & Nicholsons": "https://www.linkedin.com/company/camper-&-nicholsons-international/jobs/",
  "Fraser Yachts": "https://www.linkedin.com/company/fraser-yachts/jobs/",
  "Burgess": "https://www.linkedin.com/company/burgess-yachts/jobs/",
  "Feadship": "https://www.linkedin.com/company/feadship/jobs/",
  "Lürssen": "https://www.linkedin.com/company/lurssen/jobs/",
};

// ============================================
// FINANCE - Institutions financières
// ============================================

export const FINANCE_COMPANIES: Record<string, CompanyInfo[]> = {
  // MONACO
  monaco: [
    // Banques privées
    { name: "CMB Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Compagnie Monégasque de Banque", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "CFM Indosuez Wealth Management", sector: "Wealth Management", city: "Monaco", country: "Monaco" },
    { name: "Edmond de Rothschild Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Julius Baer Monaco", sector: "Wealth Management", city: "Monaco", country: "Monaco" },
    { name: "Barclays Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "HSBC Private Bank Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "UBS Monaco", sector: "Wealth Management", city: "Monaco", country: "Monaco" },
    { name: "Credit Suisse Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Société Générale Private Banking Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "BNP Paribas Wealth Management Monaco", sector: "Wealth Management", city: "Monaco", country: "Monaco" },
    { name: "Lombard Odier Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Pictet Monaco", sector: "Wealth Management", city: "Monaco", country: "Monaco" },
    { name: "EFG Bank Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "VP Bank Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    // Asset Management & Family Offices
    { name: "Monaco Asset Management", sector: "Asset Management", city: "Monaco", country: "Monaco" },
    { name: "Notz Stucki Monaco", sector: "Wealth Management", city: "Monaco", country: "Monaco" },
    { name: "Banque Havilland Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Mediobanca Private Banking Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Bordier & Cie Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
  ],

  // SUISSE - Genève, Zurich, Lugano
  switzerland: [
    // Grandes banques
    { name: "UBS", sector: "Investment Banking", city: "Zurich", country: "Switzerland" },
    { name: "Credit Suisse", sector: "Investment Banking", city: "Zurich", country: "Switzerland" },
    { name: "Julius Baer", sector: "Wealth Management", city: "Zurich", country: "Switzerland" },
    { name: "Pictet", sector: "Asset Management", city: "Geneva", country: "Switzerland" },
    { name: "Lombard Odier", sector: "Private Banking", city: "Geneva", country: "Switzerland" },
    { name: "Vontobel", sector: "Asset Management", city: "Zurich", country: "Switzerland" },
    { name: "EFG International", sector: "Private Banking", city: "Zurich", country: "Switzerland" },
    { name: "Banque Cantonale de Genève", sector: "Banking", city: "Geneva", country: "Switzerland" },
    { name: "Zürcher Kantonalbank", sector: "Banking", city: "Zurich", country: "Switzerland" },
    { name: "Raiffeisen Suisse", sector: "Banking", city: "St. Gallen", country: "Switzerland" },
    // Asset Management
    { name: "Partners Group", sector: "Private Equity", city: "Zug", country: "Switzerland" },
    { name: "GAM", sector: "Asset Management", city: "Zurich", country: "Switzerland" },
    { name: "Unigestion", sector: "Asset Management", city: "Geneva", country: "Switzerland" },
    { name: "Mirabaud", sector: "Private Banking", city: "Geneva", country: "Switzerland" },
    { name: "Union Bancaire Privée", sector: "Wealth Management", city: "Geneva", country: "Switzerland" },
    { name: "Banque Syz", sector: "Asset Management", city: "Geneva", country: "Switzerland" },
    { name: "Bordier & Cie", sector: "Private Banking", city: "Geneva", country: "Switzerland" },
    { name: "Banque Bonhôte", sector: "Private Banking", city: "Neuchâtel", country: "Switzerland" },
    { name: "Reyl & Cie", sector: "Private Banking", city: "Geneva", country: "Switzerland" },
    { name: "Banque Heritage", sector: "Private Banking", city: "Geneva", country: "Switzerland" },
    // Insurance
    { name: "Swiss Re", sector: "Insurance", city: "Zurich", country: "Switzerland" },
    { name: "Zurich Insurance", sector: "Insurance", city: "Zurich", country: "Switzerland" },
    { name: "Swiss Life", sector: "Insurance", city: "Zurich", country: "Switzerland" },
    // Trading
    { name: "Glencore", sector: "Commodities Trading", city: "Zug", country: "Switzerland" },
    { name: "Trafigura", sector: "Commodities Trading", city: "Geneva", country: "Switzerland" },
    { name: "Vitol", sector: "Commodities Trading", city: "Geneva", country: "Switzerland" },
    { name: "Mercuria", sector: "Commodities Trading", city: "Geneva", country: "Switzerland" },
    { name: "Gunvor", sector: "Commodities Trading", city: "Geneva", country: "Switzerland" },
  ],

  // LONDRES
  london: [
    // Investment Banks
    { name: "Goldman Sachs", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "JP Morgan", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Morgan Stanley", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Bank of America", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Citigroup", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Barclays", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "HSBC", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Deutsche Bank", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "UBS London", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Credit Suisse London", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "BNP Paribas London", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Société Générale London", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Nomura", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Jefferies", sector: "Investment Banking", city: "London", country: "UK" },
    { name: "Lazard London", sector: "M&A Advisory", city: "London", country: "UK" },
    { name: "Rothschild & Co London", sector: "M&A Advisory", city: "London", country: "UK" },
    { name: "Evercore", sector: "M&A Advisory", city: "London", country: "UK" },
    { name: "Moelis & Company", sector: "M&A Advisory", city: "London", country: "UK" },
    { name: "PJT Partners", sector: "M&A Advisory", city: "London", country: "UK" },
    { name: "Centerview Partners", sector: "M&A Advisory", city: "London", country: "UK" },
    // Private Equity
    { name: "Blackstone", sector: "Private Equity", city: "London", country: "UK" },
    { name: "KKR", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Carlyle Group", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Apollo Global Management", sector: "Private Equity", city: "London", country: "UK" },
    { name: "TPG Capital", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Bain Capital", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Advent International", sector: "Private Equity", city: "London", country: "UK" },
    { name: "CVC Capital Partners", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Permira", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Apax Partners", sector: "Private Equity", city: "London", country: "UK" },
    { name: "BC Partners", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Cinven", sector: "Private Equity", city: "London", country: "UK" },
    { name: "EQT Partners", sector: "Private Equity", city: "London", country: "UK" },
    { name: "Bridgepoint", sector: "Private Equity", city: "London", country: "UK" },
    { name: "3i Group", sector: "Private Equity", city: "London", country: "UK" },
    // Hedge Funds
    { name: "Man Group", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Brevan Howard", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Marshall Wace", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Winton Group", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Capula Investment Management", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "BlueCrest Capital", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Lansdowne Partners", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Odey Asset Management", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "TCI Fund Management", sector: "Hedge Fund", city: "London", country: "UK" },
    { name: "Egerton Capital", sector: "Hedge Fund", city: "London", country: "UK" },
    // Asset Management
    { name: "BlackRock London", sector: "Asset Management", city: "London", country: "UK" },
    { name: "Schroders", sector: "Asset Management", city: "London", country: "UK" },
    { name: "Legal & General", sector: "Asset Management", city: "London", country: "UK" },
    { name: "M&G Investments", sector: "Asset Management", city: "London", country: "UK" },
    { name: "Baillie Gifford", sector: "Asset Management", city: "Edinburgh", country: "UK" },
    { name: "Aberdeen Standard Investments", sector: "Asset Management", city: "Edinburgh", country: "UK" },
    { name: "Fidelity International", sector: "Asset Management", city: "London", country: "UK" },
    { name: "Invesco", sector: "Asset Management", city: "London", country: "UK" },
  ],

  // PARIS
  paris: [
    // Banques françaises
    { name: "BNP Paribas", sector: "Investment Banking", city: "Paris", country: "France" },
    { name: "Société Générale", sector: "Investment Banking", city: "Paris", country: "France" },
    { name: "Crédit Agricole CIB", sector: "Investment Banking", city: "Paris", country: "France" },
    { name: "Natixis", sector: "Investment Banking", city: "Paris", country: "France" },
    { name: "BPCE", sector: "Banking", city: "Paris", country: "France" },
    { name: "Crédit Mutuel", sector: "Banking", city: "Paris", country: "France" },
    { name: "La Banque Postale", sector: "Banking", city: "Paris", country: "France" },
    // M&A Boutiques
    { name: "Rothschild & Co", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Lazard Paris", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Messier Maris", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Bucéphale Finance", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Financière de Courcelles", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Alantra", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "DC Advisory", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Accuracy", sector: "M&A Advisory", city: "Paris", country: "France" },
    { name: "Eight Advisory", sector: "M&A Advisory", city: "Paris", country: "France" },
    // Private Equity
    { name: "Ardian", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "PAI Partners", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Eurazeo", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Tikehau Capital", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Wendel", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Astorg", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Antin Infrastructure Partners", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Apax Partners France", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "LBO France", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Sagard", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Idinvest Partners", sector: "Private Equity", city: "Paris", country: "France" },
    { name: "Partech", sector: "Venture Capital", city: "Paris", country: "France" },
    { name: "Cathay Capital", sector: "Private Equity", city: "Paris", country: "France" },
    // Asset Management
    { name: "Amundi", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "AXA Investment Managers", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "Carmignac", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "La Française", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "Sycomore Asset Management", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "Comgest", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "DNCA Finance", sector: "Asset Management", city: "Paris", country: "France" },
    { name: "Oddo BHF Asset Management", sector: "Asset Management", city: "Paris", country: "France" },
    // Insurance
    { name: "AXA", sector: "Insurance", city: "Paris", country: "France" },
    { name: "Allianz France", sector: "Insurance", city: "Paris", country: "France" },
    { name: "Generali France", sector: "Insurance", city: "Paris", country: "France" },
    { name: "CNP Assurances", sector: "Insurance", city: "Paris", country: "France" },
    { name: "SCOR", sector: "Reinsurance", city: "Paris", country: "France" },
  ],

  // FRANCFORT
  frankfurt: [
    { name: "Deutsche Bank", sector: "Investment Banking", city: "Frankfurt", country: "Germany" },
    { name: "Commerzbank", sector: "Banking", city: "Frankfurt", country: "Germany" },
    { name: "DZ Bank", sector: "Banking", city: "Frankfurt", country: "Germany" },
    { name: "KfW", sector: "Development Bank", city: "Frankfurt", country: "Germany" },
    { name: "Helaba", sector: "Banking", city: "Frankfurt", country: "Germany" },
    { name: "DekaBank", sector: "Asset Management", city: "Frankfurt", country: "Germany" },
    { name: "Union Investment", sector: "Asset Management", city: "Frankfurt", country: "Germany" },
    { name: "DWS", sector: "Asset Management", city: "Frankfurt", country: "Germany" },
    { name: "Allianz Global Investors", sector: "Asset Management", city: "Frankfurt", country: "Germany" },
    { name: "European Central Bank", sector: "Central Bank", city: "Frankfurt", country: "Germany" },
  ],

  // LUXEMBOURG
  luxembourg: [
    { name: "European Investment Bank", sector: "Development Bank", city: "Luxembourg", country: "Luxembourg" },
    { name: "Clearstream", sector: "Financial Infrastructure", city: "Luxembourg", country: "Luxembourg" },
    { name: "Banque Internationale à Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Banque de Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Société Générale Luxembourg", sector: "Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "BNP Paribas Luxembourg", sector: "Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "CACEIS", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "State Street Luxembourg", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "Brown Brothers Harriman", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
  ],
};

// ============================================
// TECH / IT - Entreprises technologiques
// ============================================

export const TECH_COMPANIES: Record<string, CompanyInfo[]> = {
  // PARIS
  paris: [
    // Licornes françaises
    { name: "Doctolib", sector: "HealthTech", city: "Paris", country: "France" },
    { name: "BlaBlaCar", sector: "Mobility", city: "Paris", country: "France" },
    { name: "Datadog", sector: "Cloud/DevOps", city: "Paris", country: "France" },
    { name: "Contentsquare", sector: "Analytics", city: "Paris", country: "France" },
    { name: "Mirakl", sector: "E-commerce", city: "Paris", country: "France" },
    { name: "Algolia", sector: "Search", city: "Paris", country: "France" },
    { name: "Sorare", sector: "Blockchain/Gaming", city: "Paris", country: "France" },
    { name: "Ledger", sector: "Blockchain", city: "Paris", country: "France" },
    { name: "Alan", sector: "InsurTech", city: "Paris", country: "France" },
    { name: "Qonto", sector: "FinTech", city: "Paris", country: "France" },
    { name: "Payfit", sector: "HR Tech", city: "Paris", country: "France" },
    { name: "Swile", sector: "HR Tech", city: "Paris", country: "France" },
    { name: "Back Market", sector: "E-commerce", city: "Paris", country: "France" },
    { name: "Vestiaire Collective", sector: "E-commerce", city: "Paris", country: "France" },
    { name: "ManoMano", sector: "E-commerce", city: "Paris", country: "France" },
    { name: "Voodoo", sector: "Gaming", city: "Paris", country: "France" },
    { name: "Believe", sector: "Music Tech", city: "Paris", country: "France" },
    { name: "Deezer", sector: "Music Tech", city: "Paris", country: "France" },
    { name: "Dailymotion", sector: "Video", city: "Paris", country: "France" },
    { name: "Criteo", sector: "AdTech", city: "Paris", country: "France" },
    // Grandes entreprises tech
    { name: "Dassault Systèmes", sector: "Software", city: "Paris", country: "France" },
    { name: "Capgemini", sector: "IT Services", city: "Paris", country: "France" },
    { name: "Sopra Steria", sector: "IT Services", city: "Paris", country: "France" },
    { name: "Atos", sector: "IT Services", city: "Paris", country: "France" },
    { name: "Thales", sector: "Defense Tech", city: "Paris", country: "France" },
    { name: "Orange", sector: "Telecom", city: "Paris", country: "France" },
    { name: "OVHcloud", sector: "Cloud", city: "Paris", country: "France" },
    { name: "Scaleway", sector: "Cloud", city: "Paris", country: "France" },
    // GAFAM Paris
    { name: "Google France", sector: "Big Tech", city: "Paris", country: "France" },
    { name: "Meta France", sector: "Big Tech", city: "Paris", country: "France" },
    { name: "Amazon France", sector: "Big Tech", city: "Paris", country: "France" },
    { name: "Microsoft France", sector: "Big Tech", city: "Paris", country: "France" },
    { name: "Apple France", sector: "Big Tech", city: "Paris", country: "France" },
    { name: "Salesforce France", sector: "SaaS", city: "Paris", country: "France" },
    { name: "SAP France", sector: "Enterprise Software", city: "Paris", country: "France" },
  ],

  // LONDRES
  london: [
    { name: "Revolut", sector: "FinTech", city: "London", country: "UK" },
    { name: "Monzo", sector: "FinTech", city: "London", country: "UK" },
    { name: "Wise", sector: "FinTech", city: "London", country: "UK" },
    { name: "Checkout.com", sector: "FinTech", city: "London", country: "UK" },
    { name: "Deliveroo", sector: "FoodTech", city: "London", country: "UK" },
    { name: "Improbable", sector: "Gaming/Metaverse", city: "London", country: "UK" },
    { name: "Graphcore", sector: "AI Hardware", city: "Bristol", country: "UK" },
    { name: "DeepMind", sector: "AI", city: "London", country: "UK" },
    { name: "Arm", sector: "Semiconductors", city: "Cambridge", country: "UK" },
    { name: "Darktrace", sector: "Cybersecurity", city: "Cambridge", country: "UK" },
    { name: "Ocado Technology", sector: "Robotics", city: "London", country: "UK" },
    { name: "Babylon Health", sector: "HealthTech", city: "London", country: "UK" },
    { name: "GoCardless", sector: "FinTech", city: "London", country: "UK" },
    { name: "Starling Bank", sector: "FinTech", city: "London", country: "UK" },
    { name: "OakNorth", sector: "FinTech", city: "London", country: "UK" },
    // Big Tech London
    { name: "Google London", sector: "Big Tech", city: "London", country: "UK" },
    { name: "Meta London", sector: "Big Tech", city: "London", country: "UK" },
    { name: "Amazon UK", sector: "Big Tech", city: "London", country: "UK" },
    { name: "Microsoft UK", sector: "Big Tech", city: "London", country: "UK" },
    { name: "Apple UK", sector: "Big Tech", city: "London", country: "UK" },
  ],

  // SUISSE
  switzerland: [
    { name: "Google Zurich", sector: "Big Tech", city: "Zurich", country: "Switzerland" },
    { name: "Microsoft Switzerland", sector: "Big Tech", city: "Zurich", country: "Switzerland" },
    { name: "IBM Research Zurich", sector: "Research", city: "Zurich", country: "Switzerland" },
    { name: "Oracle Switzerland", sector: "Enterprise Software", city: "Zurich", country: "Switzerland" },
    { name: "Temenos", sector: "FinTech", city: "Geneva", country: "Switzerland" },
    { name: "Avaloq", sector: "FinTech", city: "Zurich", country: "Switzerland" },
    { name: "SIX Group", sector: "Financial Infrastructure", city: "Zurich", country: "Switzerland" },
    { name: "Acronis", sector: "Cybersecurity", city: "Schaffhausen", country: "Switzerland" },
    { name: "Proton", sector: "Privacy Tech", city: "Geneva", country: "Switzerland" },
    { name: "Numbrs", sector: "FinTech", city: "Zurich", country: "Switzerland" },
  ],

  // MONACO
  monaco: [
    { name: "Monaco Digital", sector: "Digital Services", city: "Monaco", country: "Monaco" },
    { name: "Monaco Telecom", sector: "Telecom", city: "Monaco", country: "Monaco" },
    { name: "Extended Monaco", sector: "Digital Transformation", city: "Monaco", country: "Monaco" },
  ],
};

// ============================================
// CONSULTING - Cabinets de conseil
// ============================================

export const CONSULTING_COMPANIES: Record<string, CompanyInfo[]> = {
  global: [
    // Strategy
    { name: "McKinsey & Company", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Boston Consulting Group", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Bain & Company", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Oliver Wyman", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Roland Berger", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Kearney", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Strategy&", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "L.E.K. Consulting", sector: "Strategy Consulting", city: "Global", country: "Global" },
    { name: "Simon-Kucher & Partners", sector: "Pricing Consulting", city: "Global", country: "Global" },
    { name: "Arthur D. Little", sector: "Strategy Consulting", city: "Global", country: "Global" },
    // Big 4
    { name: "Deloitte", sector: "Audit & Consulting", city: "Global", country: "Global" },
    { name: "PwC", sector: "Audit & Consulting", city: "Global", country: "Global" },
    { name: "EY", sector: "Audit & Consulting", city: "Global", country: "Global" },
    { name: "KPMG", sector: "Audit & Consulting", city: "Global", country: "Global" },
    // IT Consulting
    { name: "Accenture", sector: "IT Consulting", city: "Global", country: "Global" },
    { name: "IBM Consulting", sector: "IT Consulting", city: "Global", country: "Global" },
    { name: "Capgemini Invent", sector: "IT Consulting", city: "Global", country: "Global" },
    { name: "Cognizant", sector: "IT Consulting", city: "Global", country: "Global" },
    { name: "Infosys", sector: "IT Consulting", city: "Global", country: "Global" },
    { name: "Wipro", sector: "IT Consulting", city: "Global", country: "Global" },
    { name: "TCS", sector: "IT Consulting", city: "Global", country: "Global" },
  ],

  paris: [
    { name: "Wavestone", sector: "Consulting", city: "Paris", country: "France" },
    { name: "Sia Partners", sector: "Consulting", city: "Paris", country: "France" },
    { name: "Kea & Partners", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Advancy", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Eleven Strategy", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Bartle", sector: "Consulting", city: "Paris", country: "France" },
    { name: "Weave", sector: "Consulting", city: "Paris", country: "France" },
    { name: "Mazars", sector: "Audit & Consulting", city: "Paris", country: "France" },
    { name: "Grant Thornton France", sector: "Audit & Consulting", city: "Paris", country: "France" },
    { name: "BDO France", sector: "Audit & Consulting", city: "Paris", country: "France" },
  ],
};

// ============================================
// LUXURY / RETAIL - Luxe et distribution
// ============================================

export const LUXURY_COMPANIES: Record<string, CompanyInfo[]> = {
  paris: [
    { name: "LVMH", sector: "Luxury Conglomerate", city: "Paris", country: "France" },
    { name: "Kering", sector: "Luxury Conglomerate", city: "Paris", country: "France" },
    { name: "Hermès", sector: "Luxury", city: "Paris", country: "France" },
    { name: "Chanel", sector: "Luxury", city: "Paris", country: "France" },
    { name: "L'Oréal", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Dior", sector: "Luxury", city: "Paris", country: "France" },
    { name: "Louis Vuitton", sector: "Luxury", city: "Paris", country: "France" },
    { name: "Cartier", sector: "Luxury Jewelry", city: "Paris", country: "France" },
    { name: "Richemont", sector: "Luxury Conglomerate", city: "Paris", country: "France" },
    { name: "Sephora", sector: "Beauty Retail", city: "Paris", country: "France" },
  ],

  monaco: [
    { name: "Société des Bains de Mer", sector: "Hospitality/Gaming", city: "Monaco", country: "Monaco" },
    { name: "Monte-Carlo Casino", sector: "Gaming", city: "Monaco", country: "Monaco" },
    { name: "Yacht Club de Monaco", sector: "Luxury Services", city: "Monaco", country: "Monaco" },
  ],
};

// ============================================
// ENERGY - Énergie
// ============================================

export const ENERGY_COMPANIES: Record<string, CompanyInfo[]> = {
  paris: [
    { name: "TotalEnergies", sector: "Oil & Gas", city: "Paris", country: "France" },
    { name: "Engie", sector: "Utilities", city: "Paris", country: "France" },
    { name: "EDF", sector: "Utilities", city: "Paris", country: "France" },
    { name: "Veolia", sector: "Utilities", city: "Paris", country: "France" },
    { name: "Suez", sector: "Utilities", city: "Paris", country: "France" },
    { name: "Air Liquide", sector: "Industrial Gases", city: "Paris", country: "France" },
  ],

  london: [
    { name: "BP", sector: "Oil & Gas", city: "London", country: "UK" },
    { name: "Shell", sector: "Oil & Gas", city: "London", country: "UK" },
    { name: "National Grid", sector: "Utilities", city: "London", country: "UK" },
    { name: "SSE", sector: "Utilities", city: "Perth", country: "UK" },
    { name: "Centrica", sector: "Utilities", city: "London", country: "UK" },
  ],
};

// ============================================
// AEROSPACE & DEFENSE
// ============================================

export const AEROSPACE_COMPANIES: Record<string, CompanyInfo[]> = {
  paris: [
    { name: "Airbus", sector: "Aerospace", city: "Toulouse", country: "France" },
    { name: "Safran", sector: "Aerospace", city: "Paris", country: "France" },
    { name: "Thales", sector: "Defense", city: "Paris", country: "France" },
    { name: "Dassault Aviation", sector: "Aerospace", city: "Paris", country: "France" },
    { name: "Naval Group", sector: "Defense", city: "Paris", country: "France" },
    { name: "MBDA", sector: "Defense", city: "Paris", country: "France" },
  ],

  london: [
    { name: "BAE Systems", sector: "Defense", city: "London", country: "UK" },
    { name: "Rolls-Royce", sector: "Aerospace", city: "London", country: "UK" },
    { name: "Leonardo UK", sector: "Defense", city: "London", country: "UK" },
  ],
};

// ============================================
// MARKETING & COMMUNICATION
// ============================================

export const MARKETING_COMPANIES: Record<string, CompanyInfo[]> = {
  paris: [
    // Agences de publicité
    { name: "Publicis Groupe", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Havas", sector: "Advertising", city: "Paris", country: "France" },
    { name: "BETC", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Marcel", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Fred & Farid", sector: "Advertising", city: "Paris", country: "France" },
    { name: "TBWA Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "DDB Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Ogilvy Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "BBDO Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "McCann Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Leo Burnett Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Saatchi & Saatchi Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Grey Paris", sector: "Advertising", city: "Paris", country: "France" },
    { name: "Wunderman Thompson", sector: "Digital Marketing", city: "Paris", country: "France" },
    // Digital Marketing
    { name: "Artefact", sector: "Digital Marketing", city: "Paris", country: "France" },
    { name: "fifty-five", sector: "Data Marketing", city: "Paris", country: "France" },
    { name: "Ekino", sector: "Digital Agency", city: "Paris", country: "France" },
    { name: "Valtech", sector: "Digital Agency", city: "Paris", country: "France" },
    { name: "Digitas", sector: "Digital Marketing", city: "Paris", country: "France" },
    { name: "iProspect", sector: "Performance Marketing", city: "Paris", country: "France" },
    { name: "Jellyfish", sector: "Digital Marketing", city: "Paris", country: "France" },
    { name: "Labelium", sector: "Digital Marketing", city: "Paris", country: "France" },
    // PR & Communication
    { name: "Edelman", sector: "PR", city: "Paris", country: "France" },
    { name: "Weber Shandwick", sector: "PR", city: "Paris", country: "France" },
    { name: "BCW", sector: "PR", city: "Paris", country: "France" },
    { name: "FleishmanHillard", sector: "PR", city: "Paris", country: "France" },
    { name: "Ketchum", sector: "PR", city: "Paris", country: "France" },
    { name: "Hill+Knowlton", sector: "PR", city: "Paris", country: "France" },
    { name: "MSL Group", sector: "PR", city: "Paris", country: "France" },
    { name: "Hopscotch", sector: "PR", city: "Paris", country: "France" },
    { name: "Rumeur Publique", sector: "PR", city: "Paris", country: "France" },
    { name: "Agence Babel", sector: "Communication", city: "Paris", country: "France" },
    // Media
    { name: "GroupM", sector: "Media", city: "Paris", country: "France" },
    { name: "Dentsu", sector: "Media", city: "Paris", country: "France" },
    { name: "Omnicom Media Group", sector: "Media", city: "Paris", country: "France" },
    { name: "IPG Mediabrands", sector: "Media", city: "Paris", country: "France" },
    { name: "Zenith", sector: "Media", city: "Paris", country: "France" },
    { name: "Starcom", sector: "Media", city: "Paris", country: "France" },
    { name: "Carat", sector: "Media", city: "Paris", country: "France" },
    { name: "Mindshare", sector: "Media", city: "Paris", country: "France" },
    { name: "MediaCom", sector: "Media", city: "Paris", country: "France" },
    // Event & Activation
    { name: "Auditoire", sector: "Event", city: "Paris", country: "France" },
    { name: "Ubi Bene", sector: "Event", city: "Paris", country: "France" },
    { name: "Havas Events", sector: "Event", city: "Paris", country: "France" },
    { name: "GL Events", sector: "Event", city: "Paris", country: "France" },
  ],

  london: [
    { name: "WPP", sector: "Advertising Holding", city: "London", country: "UK" },
    { name: "Omnicom", sector: "Advertising Holding", city: "London", country: "UK" },
    { name: "Adam & Eve DDB", sector: "Advertising", city: "London", country: "UK" },
    { name: "Mother London", sector: "Advertising", city: "London", country: "UK" },
    { name: "Wieden+Kennedy London", sector: "Advertising", city: "London", country: "UK" },
    { name: "AMV BBDO", sector: "Advertising", city: "London", country: "UK" },
    { name: "Bartle Bogle Hegarty", sector: "Advertising", city: "London", country: "UK" },
    { name: "Droga5 London", sector: "Advertising", city: "London", country: "UK" },
    { name: "VCCP", sector: "Advertising", city: "London", country: "UK" },
    { name: "The&Partnership", sector: "Advertising", city: "London", country: "UK" },
    { name: "Lucky Generals", sector: "Advertising", city: "London", country: "UK" },
    { name: "Uncommon Creative Studio", sector: "Advertising", city: "London", country: "UK" },
    // Digital
    { name: "R/GA London", sector: "Digital Agency", city: "London", country: "UK" },
    { name: "AKQA", sector: "Digital Agency", city: "London", country: "UK" },
    { name: "Huge", sector: "Digital Agency", city: "London", country: "UK" },
    { name: "MediaMonks", sector: "Digital Agency", city: "London", country: "UK" },
    // PR
    { name: "Brunswick Group", sector: "PR", city: "London", country: "UK" },
    { name: "Finsbury Glover Hering", sector: "PR", city: "London", country: "UK" },
    { name: "Teneo", sector: "PR", city: "London", country: "UK" },
    { name: "Freuds", sector: "PR", city: "London", country: "UK" },
  ],

  switzerland: [
    { name: "Jung von Matt Switzerland", sector: "Advertising", city: "Zurich", country: "Switzerland" },
    { name: "Wirz Communications", sector: "Advertising", city: "Zurich", country: "Switzerland" },
    { name: "Farner Consulting", sector: "PR", city: "Zurich", country: "Switzerland" },
    { name: "Burson Switzerland", sector: "PR", city: "Zurich", country: "Switzerland" },
    { name: "Publicis Zurich", sector: "Advertising", city: "Zurich", country: "Switzerland" },
    { name: "Havas Switzerland", sector: "Advertising", city: "Zurich", country: "Switzerland" },
  ],

  luxembourg: [
    { name: "Mikado Publicis", sector: "Advertising", city: "Luxembourg", country: "Luxembourg" },
    { name: "Vanksen", sector: "Digital Agency", city: "Luxembourg", country: "Luxembourg" },
    { name: "Vous", sector: "Advertising", city: "Luxembourg", country: "Luxembourg" },
  ],
};

// ============================================
// YACHTING & MARITIME
// ============================================

export const YACHTING_COMPANIES: Record<string, CompanyInfo[]> = {
  monaco: [
    // Yacht Brokers & Management
    { name: "Camper & Nicholsons", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Fraser Yachts", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Burgess", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Edmiston", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Y.CO", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Northrop & Johnson", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "IYC", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Moran Yacht & Ship", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Ocean Independence", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Yachtzoo", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "SuperYacht Company", sector: "Yacht Brokerage", city: "Monaco", country: "Monaco" },
    { name: "Hill Robinson", sector: "Yacht Management", city: "Monaco", country: "Monaco" },
    { name: "Moravia Yachting", sector: "Yacht Management", city: "Monaco", country: "Monaco" },
    // Yacht Clubs
    { name: "Yacht Club de Monaco", sector: "Yacht Club", city: "Monaco", country: "Monaco" },
    { name: "Monaco Marine", sector: "Yacht Services", city: "Monaco", country: "Monaco" },
    // Events
    { name: "Monaco Yacht Show", sector: "Yacht Events", city: "Monaco", country: "Monaco" },
    // Crew Agencies
    { name: "Crew4Yachts", sector: "Crew Agency", city: "Monaco", country: "Monaco" },
    { name: "Dockwalk", sector: "Crew Agency", city: "Monaco", country: "Monaco" },
    { name: "YachtCrewLink", sector: "Crew Agency", city: "Monaco", country: "Monaco" },
  ],

  cotedazur: [
    // Antibes
    { name: "Bluewater Yachting", sector: "Yacht Brokerage", city: "Antibes", country: "France" },
    { name: "Worth Avenue Yachts", sector: "Yacht Brokerage", city: "Antibes", country: "France" },
    { name: "Yachting Partners International", sector: "Yacht Brokerage", city: "Antibes", country: "France" },
    { name: "Crew Unlimited", sector: "Crew Agency", city: "Antibes", country: "France" },
    { name: "Luxury Yacht Group", sector: "Yacht Brokerage", city: "Antibes", country: "France" },
    { name: "Vilanova Grand Marina", sector: "Marina", city: "Antibes", country: "France" },
    { name: "Port Vauban", sector: "Marina", city: "Antibes", country: "France" },
    // Nice
    { name: "Nice Yacht Services", sector: "Yacht Services", city: "Nice", country: "France" },
    // Cannes
    { name: "Cannes Yachting Festival", sector: "Yacht Events", city: "Cannes", country: "France" },
    { name: "Port Pierre Canto", sector: "Marina", city: "Cannes", country: "France" },
    // Saint-Tropez
    { name: "Port de Saint-Tropez", sector: "Marina", city: "Saint-Tropez", country: "France" },
    // La Ciotat
    { name: "MB92 La Ciotat", sector: "Yacht Refit", city: "La Ciotat", country: "France" },
  ],

  uk: [
    { name: "Sunseeker", sector: "Yacht Builder", city: "Poole", country: "UK" },
    { name: "Princess Yachts", sector: "Yacht Builder", city: "Plymouth", country: "UK" },
    { name: "Oyster Yachts", sector: "Yacht Builder", city: "Southampton", country: "UK" },
    { name: "Pendennis Shipyard", sector: "Yacht Refit", city: "Falmouth", country: "UK" },
  ],

  italy: [
    { name: "Ferretti Group", sector: "Yacht Builder", city: "Forlì", country: "Italy" },
    { name: "Azimut Benetti", sector: "Yacht Builder", city: "Viareggio", country: "Italy" },
    { name: "Sanlorenzo", sector: "Yacht Builder", city: "La Spezia", country: "Italy" },
    { name: "Fincantieri Yachts", sector: "Yacht Builder", city: "Trieste", country: "Italy" },
    { name: "Baglietto", sector: "Yacht Builder", city: "La Spezia", country: "Italy" },
    { name: "Tankoa Yachts", sector: "Yacht Builder", city: "Genoa", country: "Italy" },
    { name: "Rossinavi", sector: "Yacht Builder", city: "Viareggio", country: "Italy" },
  ],

  netherlands: [
    { name: "Feadship", sector: "Yacht Builder", city: "Aalsmeer", country: "Netherlands" },
    { name: "Heesen Yachts", sector: "Yacht Builder", city: "Oss", country: "Netherlands" },
    { name: "Amels", sector: "Yacht Builder", city: "Vlissingen", country: "Netherlands" },
    { name: "Oceanco", sector: "Yacht Builder", city: "Alblasserdam", country: "Netherlands" },
    { name: "Royal Huisman", sector: "Yacht Builder", city: "Vollenhove", country: "Netherlands" },
    { name: "Vitters Shipyard", sector: "Yacht Builder", city: "Zwartsluis", country: "Netherlands" },
  ],

  germany: [
    { name: "Lürssen", sector: "Yacht Builder", city: "Bremen", country: "Germany" },
    { name: "Blohm+Voss", sector: "Yacht Builder", city: "Hamburg", country: "Germany" },
    { name: "Nobiskrug", sector: "Yacht Builder", city: "Rendsburg", country: "Germany" },
  ],
};

// ============================================
// LUXE & MODE (Extended)
// ============================================

export const LUXURY_EXTENDED: Record<string, CompanyInfo[]> = {
  paris: [
    // Conglomérats
    { name: "LVMH", sector: "Luxury Conglomerate", city: "Paris", country: "France" },
    { name: "Kering", sector: "Luxury Conglomerate", city: "Paris", country: "France" },
    { name: "Richemont", sector: "Luxury Conglomerate", city: "Paris", country: "France" },
    // Maisons de couture
    { name: "Chanel", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Dior", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Louis Vuitton", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Hermès", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Givenchy", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Celine", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Saint Laurent", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Balenciaga", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Balmain", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Lanvin", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Loewe", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Valentino", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Jean Paul Gaultier", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Maison Margiela", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Jacquemus", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Isabel Marant", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Zadig & Voltaire", sector: "Fashion", city: "Paris", country: "France" },
    { name: "The Kooples", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Sandro", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Maje", sector: "Fashion", city: "Paris", country: "France" },
    { name: "Claudie Pierlot", sector: "Fashion", city: "Paris", country: "France" },
    { name: "AMI Paris", sector: "Fashion", city: "Paris", country: "France" },
    // Joaillerie & Horlogerie
    { name: "Cartier", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Van Cleef & Arpels", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Boucheron", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Chaumet", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Piaget", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Bulgari", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Chopard", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Fred", sector: "Jewelry", city: "Paris", country: "France" },
    { name: "Messika", sector: "Jewelry", city: "Paris", country: "France" },
    // Beauté
    { name: "L'Oréal", sector: "Beauty", city: "Paris", country: "France" },
    { name: "L'Oréal Luxe", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Lancôme", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Yves Saint Laurent Beauté", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Guerlain", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Parfums Christian Dior", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Chanel Parfums Beauté", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Givenchy Parfums", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Kenzo Parfums", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Clarins", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Sisley", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Caudalie", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Nuxe", sector: "Beauty", city: "Paris", country: "France" },
    { name: "Sephora", sector: "Beauty Retail", city: "Paris", country: "France" },
    { name: "Nocibé", sector: "Beauty Retail", city: "Paris", country: "France" },
    { name: "Marionnaud", sector: "Beauty Retail", city: "Paris", country: "France" },
    // Retail Luxe
    { name: "Galeries Lafayette", sector: "Luxury Retail", city: "Paris", country: "France" },
    { name: "Le Bon Marché", sector: "Luxury Retail", city: "Paris", country: "France" },
    { name: "Printemps", sector: "Luxury Retail", city: "Paris", country: "France" },
    { name: "La Samaritaine", sector: "Luxury Retail", city: "Paris", country: "France" },
    // Hôtellerie de luxe
    { name: "Accor Luxe", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Hôtel Plaza Athénée", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Le Bristol Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Four Seasons Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Ritz Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Le Meurice", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Shangri-La Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Mandarin Oriental Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "Park Hyatt Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
    { name: "The Peninsula Paris", sector: "Luxury Hospitality", city: "Paris", country: "France" },
  ],

  london: [
    { name: "Burberry", sector: "Fashion", city: "London", country: "UK" },
    { name: "Alexander McQueen", sector: "Fashion", city: "London", country: "UK" },
    { name: "Stella McCartney", sector: "Fashion", city: "London", country: "UK" },
    { name: "Victoria Beckham", sector: "Fashion", city: "London", country: "UK" },
    { name: "Mulberry", sector: "Fashion", city: "London", country: "UK" },
    { name: "Jimmy Choo", sector: "Fashion", city: "London", country: "UK" },
    { name: "Dunhill", sector: "Fashion", city: "London", country: "UK" },
    { name: "Paul Smith", sector: "Fashion", city: "London", country: "UK" },
    { name: "Vivienne Westwood", sector: "Fashion", city: "London", country: "UK" },
    { name: "JW Anderson", sector: "Fashion", city: "London", country: "UK" },
    { name: "Harrods", sector: "Luxury Retail", city: "London", country: "UK" },
    { name: "Selfridges", sector: "Luxury Retail", city: "London", country: "UK" },
    { name: "Harvey Nichols", sector: "Luxury Retail", city: "London", country: "UK" },
    { name: "Liberty London", sector: "Luxury Retail", city: "London", country: "UK" },
    { name: "Net-a-Porter", sector: "Luxury E-commerce", city: "London", country: "UK" },
    { name: "Farfetch", sector: "Luxury E-commerce", city: "London", country: "UK" },
    { name: "Matchesfashion", sector: "Luxury E-commerce", city: "London", country: "UK" },
    // Hotels
    { name: "The Dorchester", sector: "Luxury Hospitality", city: "London", country: "UK" },
    { name: "Claridge's", sector: "Luxury Hospitality", city: "London", country: "UK" },
    { name: "The Savoy", sector: "Luxury Hospitality", city: "London", country: "UK" },
    { name: "The Ritz London", sector: "Luxury Hospitality", city: "London", country: "UK" },
  ],

  italy: [
    { name: "Gucci", sector: "Fashion", city: "Florence", country: "Italy" },
    { name: "Prada", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Armani", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Versace", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Dolce & Gabbana", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Fendi", sector: "Fashion", city: "Rome", country: "Italy" },
    { name: "Bottega Veneta", sector: "Fashion", city: "Vicenza", country: "Italy" },
    { name: "Moncler", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Salvatore Ferragamo", sector: "Fashion", city: "Florence", country: "Italy" },
    { name: "Tod's", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Ermenegildo Zegna", sector: "Fashion", city: "Milan", country: "Italy" },
    { name: "Brunello Cucinelli", sector: "Fashion", city: "Perugia", country: "Italy" },
    { name: "Max Mara", sector: "Fashion", city: "Reggio Emilia", country: "Italy" },
  ],

  switzerland: [
    // Horlogerie
    { name: "Rolex", sector: "Watches", city: "Geneva", country: "Switzerland" },
    { name: "Patek Philippe", sector: "Watches", city: "Geneva", country: "Switzerland" },
    { name: "Audemars Piguet", sector: "Watches", city: "Le Brassus", country: "Switzerland" },
    { name: "Vacheron Constantin", sector: "Watches", city: "Geneva", country: "Switzerland" },
    { name: "Omega", sector: "Watches", city: "Biel", country: "Switzerland" },
    { name: "TAG Heuer", sector: "Watches", city: "La Chaux-de-Fonds", country: "Switzerland" },
    { name: "IWC Schaffhausen", sector: "Watches", city: "Schaffhausen", country: "Switzerland" },
    { name: "Jaeger-LeCoultre", sector: "Watches", city: "Le Sentier", country: "Switzerland" },
    { name: "Breguet", sector: "Watches", city: "Vallée de Joux", country: "Switzerland" },
    { name: "Blancpain", sector: "Watches", city: "Le Brassus", country: "Switzerland" },
    { name: "Hublot", sector: "Watches", city: "Nyon", country: "Switzerland" },
    { name: "Zenith", sector: "Watches", city: "Le Locle", country: "Switzerland" },
    { name: "Longines", sector: "Watches", city: "Saint-Imier", country: "Switzerland" },
    { name: "Tissot", sector: "Watches", city: "Le Locle", country: "Switzerland" },
    { name: "Swatch Group", sector: "Watches Holding", city: "Biel", country: "Switzerland" },
    { name: "Richemont", sector: "Luxury Holding", city: "Geneva", country: "Switzerland" },
  ],

  monaco: [
    { name: "Société des Bains de Mer", sector: "Luxury Hospitality", city: "Monaco", country: "Monaco" },
    { name: "Hôtel de Paris", sector: "Luxury Hospitality", city: "Monaco", country: "Monaco" },
    { name: "Hôtel Hermitage", sector: "Luxury Hospitality", city: "Monaco", country: "Monaco" },
    { name: "Monte-Carlo Beach", sector: "Luxury Hospitality", city: "Monaco", country: "Monaco" },
    { name: "Fairmont Monte Carlo", sector: "Luxury Hospitality", city: "Monaco", country: "Monaco" },
    { name: "Metropole Monte-Carlo", sector: "Luxury Hospitality", city: "Monaco", country: "Monaco" },
    { name: "Casino de Monte-Carlo", sector: "Gaming", city: "Monaco", country: "Monaco" },
    { name: "Opéra de Monte-Carlo", sector: "Culture", city: "Monaco", country: "Monaco" },
    { name: "Grimaldi Forum", sector: "Events", city: "Monaco", country: "Monaco" },
    { name: "Monaco Top Cars Collection", sector: "Luxury Cars", city: "Monaco", country: "Monaco" },
  ],
};

// ============================================
// MANAGEMENT & CONSEIL EN STRATÉGIE (Extended)
// ============================================

export const MANAGEMENT_COMPANIES: Record<string, CompanyInfo[]> = {
  paris: [
    // Executive Search
    { name: "Egon Zehnder", sector: "Executive Search", city: "Paris", country: "France" },
    { name: "Spencer Stuart", sector: "Executive Search", city: "Paris", country: "France" },
    { name: "Heidrick & Struggles", sector: "Executive Search", city: "Paris", country: "France" },
    { name: "Russell Reynolds", sector: "Executive Search", city: "Paris", country: "France" },
    { name: "Korn Ferry", sector: "Executive Search", city: "Paris", country: "France" },
    { name: "Boyden", sector: "Executive Search", city: "Paris", country: "France" },
    { name: "Eric Salmon & Partners", sector: "Executive Search", city: "Paris", country: "France" },
    // HR Consulting
    { name: "Mercer", sector: "HR Consulting", city: "Paris", country: "France" },
    { name: "Willis Towers Watson", sector: "HR Consulting", city: "Paris", country: "France" },
    { name: "Aon", sector: "HR Consulting", city: "Paris", country: "France" },
    { name: "Hay Group", sector: "HR Consulting", city: "Paris", country: "France" },
    // Management Consulting
    { name: "McKinsey & Company", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Boston Consulting Group", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Bain & Company", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Oliver Wyman", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Roland Berger", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Kearney", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Strategy&", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "L.E.K. Consulting", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Simon-Kucher", sector: "Pricing Consulting", city: "Paris", country: "France" },
    { name: "Advancy", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Kea & Partners", sector: "Strategy Consulting", city: "Paris", country: "France" },
    { name: "Eleven Strategy", sector: "Strategy Consulting", city: "Paris", country: "France" },
    // Operations
    { name: "AlixPartners", sector: "Restructuring", city: "Paris", country: "France" },
    { name: "FTI Consulting", sector: "Restructuring", city: "Paris", country: "France" },
    { name: "Alvarez & Marsal", sector: "Restructuring", city: "Paris", country: "France" },
  ],

  london: [
    { name: "McKinsey London", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "BCG London", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "Bain London", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "Oliver Wyman London", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "LEK London", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "OC&C Strategy", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "Parthenon-EY", sector: "Strategy Consulting", city: "London", country: "UK" },
    { name: "Monitor Deloitte", sector: "Strategy Consulting", city: "London", country: "UK" },
  ],

  switzerland: [
    { name: "McKinsey Zurich", sector: "Strategy Consulting", city: "Zurich", country: "Switzerland" },
    { name: "BCG Zurich", sector: "Strategy Consulting", city: "Zurich", country: "Switzerland" },
    { name: "Bain Zurich", sector: "Strategy Consulting", city: "Zurich", country: "Switzerland" },
    { name: "Roland Berger Zurich", sector: "Strategy Consulting", city: "Zurich", country: "Switzerland" },
  ],

  luxembourg: [
    { name: "McKinsey Luxembourg", sector: "Strategy Consulting", city: "Luxembourg", country: "Luxembourg" },
    { name: "Deloitte Luxembourg", sector: "Consulting", city: "Luxembourg", country: "Luxembourg" },
    { name: "PwC Luxembourg", sector: "Consulting", city: "Luxembourg", country: "Luxembourg" },
    { name: "EY Luxembourg", sector: "Consulting", city: "Luxembourg", country: "Luxembourg" },
    { name: "KPMG Luxembourg", sector: "Consulting", city: "Luxembourg", country: "Luxembourg" },
  ],
};

// ============================================
// SPORT - Organisations sportives
// ============================================

export const SPORT_COMPANIES: Record<string, CompanyInfo[]> = {
  monaco: [
    // Football
    { name: "AS Monaco FC", sector: "Football", city: "Monaco", country: "Monaco" },
    // Automobile
    { name: "Automobile Club de Monaco", sector: "Motorsport", city: "Monaco", country: "Monaco" },
    { name: "Monaco Grand Prix", sector: "Motorsport", city: "Monaco", country: "Monaco" },
    { name: "Formula 1 Monaco", sector: "Motorsport", city: "Monaco", country: "Monaco" },
    // Yachting & Sailing
    { name: "Yacht Club de Monaco", sector: "Sailing", city: "Monaco", country: "Monaco" },
    { name: "Monaco Yacht Show", sector: "Events", city: "Monaco", country: "Monaco" },
    // Tennis
    { name: "Monte-Carlo Country Club", sector: "Tennis", city: "Monaco", country: "Monaco" },
    { name: "Monte-Carlo Rolex Masters", sector: "Tennis", city: "Monaco", country: "Monaco" },
    // Other Sports
    { name: "AS Monaco Basket", sector: "Basketball", city: "Monaco", country: "Monaco" },
    { name: "Monaco Marathon", sector: "Athletics", city: "Monaco", country: "Monaco" },
    { name: "Herculis EBS", sector: "Athletics", city: "Monaco", country: "Monaco" },
    { name: "World Athletics Monaco", sector: "Athletics", city: "Monaco", country: "Monaco" },
    // Sports Organizations
    { name: "Peace and Sport", sector: "Sports NGO", city: "Monaco", country: "Monaco" },
    { name: "International Association of Athletics Federations", sector: "Sports Federation", city: "Monaco", country: "Monaco" },
  ],

  france: [
    // Football - Ligue 1
    { name: "Paris Saint-Germain", sector: "Football", city: "Paris", country: "France" },
    { name: "Olympique de Marseille", sector: "Football", city: "Marseille", country: "France" },
    { name: "Olympique Lyonnais", sector: "Football", city: "Lyon", country: "France" },
    { name: "OGC Nice", sector: "Football", city: "Nice", country: "France" },
    { name: "LOSC Lille", sector: "Football", city: "Lille", country: "France" },
    { name: "Stade Rennais", sector: "Football", city: "Rennes", country: "France" },
    { name: "RC Lens", sector: "Football", city: "Lens", country: "France" },
    { name: "FC Nantes", sector: "Football", city: "Nantes", country: "France" },
    { name: "Montpellier HSC", sector: "Football", city: "Montpellier", country: "France" },
    { name: "Girondins de Bordeaux", sector: "Football", city: "Bordeaux", country: "France" },
    // Federations
    { name: "Fédération Française de Football", sector: "Sports Federation", city: "Paris", country: "France" },
    { name: "Fédération Française de Tennis", sector: "Sports Federation", city: "Paris", country: "France" },
    { name: "Fédération Française de Rugby", sector: "Sports Federation", city: "Paris", country: "France" },
    { name: "Fédération Française de Basketball", sector: "Sports Federation", city: "Paris", country: "France" },
    { name: "Fédération Française de Ski", sector: "Sports Federation", city: "Annecy", country: "France" },
    // Events
    { name: "Roland-Garros", sector: "Tennis", city: "Paris", country: "France" },
    { name: "Tour de France", sector: "Cycling", city: "Paris", country: "France" },
    { name: "ASO (Amaury Sport Organisation)", sector: "Sports Events", city: "Paris", country: "France" },
    { name: "Paris 2024 Olympics", sector: "Olympics", city: "Paris", country: "France" },
    // Rugby
    { name: "Stade Français Paris", sector: "Rugby", city: "Paris", country: "France" },
    { name: "Racing 92", sector: "Rugby", city: "Paris", country: "France" },
    { name: "Stade Toulousain", sector: "Rugby", city: "Toulouse", country: "France" },
    { name: "RC Toulon", sector: "Rugby", city: "Toulon", country: "France" },
    // Basketball
    { name: "ASVEL Lyon-Villeurbanne", sector: "Basketball", city: "Lyon", country: "France" },
    { name: "Paris Basketball", sector: "Basketball", city: "Paris", country: "France" },
    // Sports Marketing
    { name: "Lagardère Sports", sector: "Sports Marketing", city: "Paris", country: "France" },
    { name: "Havas Sports & Entertainment", sector: "Sports Marketing", city: "Paris", country: "France" },
    { name: "beIN Sports France", sector: "Sports Media", city: "Paris", country: "France" },
    { name: "Canal+ Sport", sector: "Sports Media", city: "Paris", country: "France" },
    { name: "L'Équipe", sector: "Sports Media", city: "Paris", country: "France" },
    // Sports Brands
    { name: "Decathlon", sector: "Sports Retail", city: "Lille", country: "France" },
    { name: "Lacoste", sector: "Sports Fashion", city: "Paris", country: "France" },
    { name: "Rossignol", sector: "Sports Equipment", city: "Grenoble", country: "France" },
    { name: "Salomon", sector: "Sports Equipment", city: "Annecy", country: "France" },
  ],

  uk: [
    // Football - Premier League
    { name: "Manchester United", sector: "Football", city: "Manchester", country: "UK" },
    { name: "Manchester City", sector: "Football", city: "Manchester", country: "UK" },
    { name: "Liverpool FC", sector: "Football", city: "Liverpool", country: "UK" },
    { name: "Chelsea FC", sector: "Football", city: "London", country: "UK" },
    { name: "Arsenal FC", sector: "Football", city: "London", country: "UK" },
    { name: "Tottenham Hotspur", sector: "Football", city: "London", country: "UK" },
    { name: "West Ham United", sector: "Football", city: "London", country: "UK" },
    { name: "Newcastle United", sector: "Football", city: "Newcastle", country: "UK" },
    { name: "Aston Villa", sector: "Football", city: "Birmingham", country: "UK" },
    // Premier League
    { name: "Premier League", sector: "Sports League", city: "London", country: "UK" },
    { name: "English Football Association", sector: "Sports Federation", city: "London", country: "UK" },
    // Tennis
    { name: "Wimbledon (AELTC)", sector: "Tennis", city: "London", country: "UK" },
    { name: "Lawn Tennis Association", sector: "Sports Federation", city: "London", country: "UK" },
    // Rugby
    { name: "England Rugby (RFU)", sector: "Rugby", city: "London", country: "UK" },
    { name: "Premiership Rugby", sector: "Rugby", city: "London", country: "UK" },
    // Cricket
    { name: "England and Wales Cricket Board", sector: "Cricket", city: "London", country: "UK" },
    // Motorsport
    { name: "Formula 1 (Liberty Media)", sector: "Motorsport", city: "London", country: "UK" },
    { name: "Silverstone Circuit", sector: "Motorsport", city: "Silverstone", country: "UK" },
    { name: "McLaren Racing", sector: "Motorsport", city: "Woking", country: "UK" },
    { name: "Mercedes-AMG Petronas F1", sector: "Motorsport", city: "Brackley", country: "UK" },
    { name: "Red Bull Racing", sector: "Motorsport", city: "Milton Keynes", country: "UK" },
    { name: "Aston Martin F1", sector: "Motorsport", city: "Silverstone", country: "UK" },
    { name: "Williams Racing", sector: "Motorsport", city: "Grove", country: "UK" },
    // Sports Media
    { name: "Sky Sports", sector: "Sports Media", city: "London", country: "UK" },
    { name: "BT Sport", sector: "Sports Media", city: "London", country: "UK" },
    { name: "DAZN", sector: "Sports Media", city: "London", country: "UK" },
    // Sports Marketing
    { name: "IMG", sector: "Sports Marketing", city: "London", country: "UK" },
    { name: "Octagon", sector: "Sports Marketing", city: "London", country: "UK" },
    { name: "Two Circles", sector: "Sports Data", city: "London", country: "UK" },
  ],

  switzerland: [
    // International Sports Organizations
    { name: "FIFA", sector: "Sports Federation", city: "Zurich", country: "Switzerland" },
    { name: "UEFA", sector: "Sports Federation", city: "Nyon", country: "Switzerland" },
    { name: "IOC (International Olympic Committee)", sector: "Olympics", city: "Lausanne", country: "Switzerland" },
    { name: "CAS (Court of Arbitration for Sport)", sector: "Sports Law", city: "Lausanne", country: "Switzerland" },
    { name: "WADA (World Anti-Doping Agency)", sector: "Sports Regulation", city: "Lausanne", country: "Switzerland" },
    { name: "World Athletics", sector: "Sports Federation", city: "Monaco", country: "Monaco" },
    { name: "FIS (International Ski Federation)", sector: "Sports Federation", city: "Oberhofen", country: "Switzerland" },
    { name: "FIBA", sector: "Sports Federation", city: "Mies", country: "Switzerland" },
    { name: "World Rugby", sector: "Sports Federation", city: "Dublin", country: "Ireland" },
    { name: "ITF (International Tennis Federation)", sector: "Sports Federation", city: "London", country: "UK" },
    // Swiss Football
    { name: "FC Basel", sector: "Football", city: "Basel", country: "Switzerland" },
    { name: "BSC Young Boys", sector: "Football", city: "Bern", country: "Switzerland" },
    { name: "FC Zurich", sector: "Football", city: "Zurich", country: "Switzerland" },
    { name: "Servette FC", sector: "Football", city: "Geneva", country: "Switzerland" },
    // Ice Hockey
    { name: "ZSC Lions", sector: "Ice Hockey", city: "Zurich", country: "Switzerland" },
    { name: "SC Bern", sector: "Ice Hockey", city: "Bern", country: "Switzerland" },
    // Sports Marketing
    { name: "Infront Sports & Media", sector: "Sports Marketing", city: "Zug", country: "Switzerland" },
    { name: "Sportradar", sector: "Sports Data", city: "St. Gallen", country: "Switzerland" },
  ],

  spain: [
    // Football - La Liga
    { name: "Real Madrid CF", sector: "Football", city: "Madrid", country: "Spain" },
    { name: "FC Barcelona", sector: "Football", city: "Barcelona", country: "Spain" },
    { name: "Atlético Madrid", sector: "Football", city: "Madrid", country: "Spain" },
    { name: "Sevilla FC", sector: "Football", city: "Sevilla", country: "Spain" },
    { name: "Real Betis", sector: "Football", city: "Sevilla", country: "Spain" },
    { name: "Valencia CF", sector: "Football", city: "Valencia", country: "Spain" },
    { name: "Villarreal CF", sector: "Football", city: "Villarreal", country: "Spain" },
    { name: "Real Sociedad", sector: "Football", city: "San Sebastián", country: "Spain" },
    { name: "Athletic Bilbao", sector: "Football", city: "Bilbao", country: "Spain" },
    // La Liga
    { name: "La Liga", sector: "Sports League", city: "Madrid", country: "Spain" },
    { name: "Real Federación Española de Fútbol", sector: "Sports Federation", city: "Madrid", country: "Spain" },
    // Basketball
    { name: "Real Madrid Baloncesto", sector: "Basketball", city: "Madrid", country: "Spain" },
    { name: "FC Barcelona Bàsquet", sector: "Basketball", city: "Barcelona", country: "Spain" },
    // Tennis
    { name: "Mutua Madrid Open", sector: "Tennis", city: "Madrid", country: "Spain" },
    { name: "Barcelona Open Banc Sabadell", sector: "Tennis", city: "Barcelona", country: "Spain" },
    // Motorsport
    { name: "Circuit de Barcelona-Catalunya", sector: "Motorsport", city: "Barcelona", country: "Spain" },
    // Sports Media
    { name: "Mediapro", sector: "Sports Media", city: "Barcelona", country: "Spain" },
    { name: "Movistar+", sector: "Sports Media", city: "Madrid", country: "Spain" },
  ],

  luxembourg: [
    { name: "F91 Dudelange", sector: "Football", city: "Dudelange", country: "Luxembourg" },
    { name: "Fédération Luxembourgeoise de Football", sector: "Sports Federation", city: "Luxembourg", country: "Luxembourg" },
    { name: "Luxembourg Olympic Committee", sector: "Olympics", city: "Luxembourg", country: "Luxembourg" },
  ],

  italy: [
    // Football - Serie A
    { name: "Juventus FC", sector: "Football", city: "Turin", country: "Italy" },
    { name: "AC Milan", sector: "Football", city: "Milan", country: "Italy" },
    { name: "Inter Milan", sector: "Football", city: "Milan", country: "Italy" },
    { name: "AS Roma", sector: "Football", city: "Rome", country: "Italy" },
    { name: "SSC Napoli", sector: "Football", city: "Naples", country: "Italy" },
    { name: "SS Lazio", sector: "Football", city: "Rome", country: "Italy" },
    { name: "Atalanta BC", sector: "Football", city: "Bergamo", country: "Italy" },
    { name: "ACF Fiorentina", sector: "Football", city: "Florence", country: "Italy" },
    // Motorsport
    { name: "Ferrari", sector: "Motorsport", city: "Maranello", country: "Italy" },
    { name: "Autodromo di Monza", sector: "Motorsport", city: "Monza", country: "Italy" },
    { name: "Ducati Corse", sector: "Motorsport", city: "Bologna", country: "Italy" },
    // Sports Brands
    { name: "Technogym", sector: "Sports Equipment", city: "Cesena", country: "Italy" },
    { name: "Diadora", sector: "Sports Fashion", city: "Treviso", country: "Italy" },
  ],

  germany: [
    // Football - Bundesliga
    { name: "Bayern Munich", sector: "Football", city: "Munich", country: "Germany" },
    { name: "Borussia Dortmund", sector: "Football", city: "Dortmund", country: "Germany" },
    { name: "RB Leipzig", sector: "Football", city: "Leipzig", country: "Germany" },
    { name: "Bayer Leverkusen", sector: "Football", city: "Leverkusen", country: "Germany" },
    { name: "Eintracht Frankfurt", sector: "Football", city: "Frankfurt", country: "Germany" },
    { name: "VfB Stuttgart", sector: "Football", city: "Stuttgart", country: "Germany" },
    // Bundesliga
    { name: "Bundesliga (DFL)", sector: "Sports League", city: "Frankfurt", country: "Germany" },
    { name: "DFB (German Football Association)", sector: "Sports Federation", city: "Frankfurt", country: "Germany" },
    // Sports Brands
    { name: "Adidas", sector: "Sports Brand", city: "Herzogenaurach", country: "Germany" },
    { name: "Puma", sector: "Sports Brand", city: "Herzogenaurach", country: "Germany" },
  ],

  usa: [
    // Sports Brands
    { name: "Nike", sector: "Sports Brand", city: "Beaverton", country: "USA" },
    { name: "Under Armour", sector: "Sports Brand", city: "Baltimore", country: "USA" },
    { name: "New Balance", sector: "Sports Brand", city: "Boston", country: "USA" },
    // Sports Media
    { name: "ESPN", sector: "Sports Media", city: "Bristol", country: "USA" },
    { name: "NBC Sports", sector: "Sports Media", city: "Stamford", country: "USA" },
    // Sports Marketing
    { name: "CAA Sports", sector: "Sports Marketing", city: "Los Angeles", country: "USA" },
    { name: "WME Sports", sector: "Sports Marketing", city: "Beverly Hills", country: "USA" },
  ],
};

// ============================================
// FINANCE EXTENDED - Plus d'entreprises
// ============================================

export const FINANCE_EXTENDED: Record<string, CompanyInfo[]> = {
  monaco: [
    // Ajouts Monaco
    { name: "Banque J. Safra Sarasin Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Banque Havilland Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Banque Transatlantique Monaco", sector: "Private Banking", city: "Monaco", country: "Monaco" },
    { name: "Monaco Private Label", sector: "Family Office", city: "Monaco", country: "Monaco" },
    { name: "Compagnie Monégasque de Gestion", sector: "Asset Management", city: "Monaco", country: "Monaco" },
    { name: "Société Monégasque de Banque Privée", sector: "Private Banking", city: "Monaco", country: "Monaco" },
  ],

  luxembourg: [
    { name: "European Investment Bank", sector: "Development Bank", city: "Luxembourg", country: "Luxembourg" },
    { name: "European Investment Fund", sector: "Investment Fund", city: "Luxembourg", country: "Luxembourg" },
    { name: "Clearstream", sector: "Financial Infrastructure", city: "Luxembourg", country: "Luxembourg" },
    { name: "Euroclear", sector: "Financial Infrastructure", city: "Luxembourg", country: "Luxembourg" },
    { name: "Banque Internationale à Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Banque de Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Société Générale Luxembourg", sector: "Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "BNP Paribas Luxembourg", sector: "Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "CACEIS Luxembourg", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "State Street Luxembourg", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "J.P. Morgan Luxembourg", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "Northern Trust Luxembourg", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "Brown Brothers Harriman Luxembourg", sector: "Asset Servicing", city: "Luxembourg", country: "Luxembourg" },
    { name: "Pictet Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Lombard Odier Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "UBS Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Credit Suisse Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Deutsche Bank Luxembourg", sector: "Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "HSBC Luxembourg", sector: "Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Quintet Private Bank", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    { name: "Edmond de Rothschild Luxembourg", sector: "Private Banking", city: "Luxembourg", country: "Luxembourg" },
    // Fund Administration
    { name: "Alter Domus", sector: "Fund Administration", city: "Luxembourg", country: "Luxembourg" },
    { name: "Apex Group", sector: "Fund Administration", city: "Luxembourg", country: "Luxembourg" },
    { name: "Citco", sector: "Fund Administration", city: "Luxembourg", country: "Luxembourg" },
    { name: "Intertrust", sector: "Fund Administration", city: "Luxembourg", country: "Luxembourg" },
    { name: "TMF Group", sector: "Fund Administration", city: "Luxembourg", country: "Luxembourg" },
    { name: "Vistra", sector: "Fund Administration", city: "Luxembourg", country: "Luxembourg" },
  ],
};

// Mettre à jour les fonctions pour inclure les nouveaux secteurs
export function getCompaniesBySector(sector: string): CompanyInfo[] {
  const allCompanies: CompanyInfo[] = [];
  
  const sectorMap: Record<string, Record<string, CompanyInfo[]>> = {
    finance: { ...FINANCE_COMPANIES, ...FINANCE_EXTENDED },
    tech: TECH_COMPANIES,
    consulting: CONSULTING_COMPANIES,
    luxury: { ...LUXURY_COMPANIES, ...LUXURY_EXTENDED },
    energy: ENERGY_COMPANIES,
    aerospace: AEROSPACE_COMPANIES,
    marketing: MARKETING_COMPANIES,
    communication: MARKETING_COMPANIES,
    yachting: YACHTING_COMPANIES,
    maritime: YACHTING_COMPANIES,
    management: MANAGEMENT_COMPANIES,
    sport: SPORT_COMPANIES,
    sports: SPORT_COMPANIES,
    football: SPORT_COMPANIES,
    motorsport: SPORT_COMPANIES,
  };
  
  const companies = sectorMap[sector.toLowerCase()];
  if (companies) {
    Object.values(companies).forEach(cityCompanies => {
      allCompanies.push(...cityCompanies);
    });
  }
  
  return allCompanies;
}

export function getCompaniesByCity(city: string): CompanyInfo[] {
  const allCompanies: CompanyInfo[] = [];
  const cityLower = city.toLowerCase();
  
  const allSectors = [
    FINANCE_COMPANIES, FINANCE_EXTENDED, TECH_COMPANIES, CONSULTING_COMPANIES, 
    LUXURY_COMPANIES, LUXURY_EXTENDED, ENERGY_COMPANIES, AEROSPACE_COMPANIES,
    MARKETING_COMPANIES, YACHTING_COMPANIES, MANAGEMENT_COMPANIES, SPORT_COMPANIES
  ];
  
  allSectors.forEach(sectorCompanies => {
    Object.entries(sectorCompanies).forEach(([location, companies]) => {
      if (location.toLowerCase().includes(cityLower)) {
        allCompanies.push(...companies);
      } else {
        companies.forEach(company => {
          if (company.city.toLowerCase().includes(cityLower)) {
            allCompanies.push(company);
          }
        });
      }
    });
  });
  
  return allCompanies;
}

export function getAllCompanies(): CompanyInfo[] {
  const allCompanies: CompanyInfo[] = [];
  
  const allSectors = [
    FINANCE_COMPANIES, FINANCE_EXTENDED, TECH_COMPANIES, CONSULTING_COMPANIES, 
    LUXURY_COMPANIES, LUXURY_EXTENDED, ENERGY_COMPANIES, AEROSPACE_COMPANIES,
    MARKETING_COMPANIES, YACHTING_COMPANIES, MANAGEMENT_COMPANIES, SPORT_COMPANIES
  ];
  
  allSectors.forEach(sectorCompanies => {
    Object.values(sectorCompanies).forEach(companies => {
      allCompanies.push(...companies);
    });
  });
  
  return allCompanies;
}

// Générer des requêtes de recherche basées sur les entreprises
export function generateCompanySearchQueries(sector: string, city: string): string[] {
  const companies = getCompaniesBySector(sector).filter(c => 
    c.city.toLowerCase().includes(city.toLowerCase()) || 
    c.country.toLowerCase().includes(city.toLowerCase())
  );
  
  return companies.slice(0, 20).map(c => `${c.name} stage`);
}
