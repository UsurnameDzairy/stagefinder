/**
 * Base de données complète des compétences par domaine
 * Skills database by domain - used for auto-fill when selecting a domain
 */

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface DomainSkills {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  categories: SkillCategory[];
}

export const DOMAIN_SKILLS: DomainSkills[] = [
  {
    id: "finance",
    name: { fr: "Finance", en: "Finance" },
    categories: [
      {
        name: "Technical Skills",
        skills: [
          "Financial Modeling",
          "Valuation (DCF, LBO, Comps)",
          "Excel Advanced",
          "VBA Macros",
          "Bloomberg Terminal",
          "Reuters Eikon",
          "FactSet",
          "Capital IQ",
          "SQL",
          "Python for Finance",
          "R Programming",
          "Tableau",
          "Power BI",
          "Financial Statement Analysis",
          "M&A Modeling",
          "Leveraged Buyout Analysis",
          "Monte Carlo Simulation",
          "Risk Management",
          "Portfolio Management",
          "Derivatives Pricing",
        ],
      },
      {
        name: "Certifications & Knowledge",
        skills: [
          "CFA Level I/II/III",
          "FRM",
          "CAIA",
          "Series 7",
          "Series 63",
          "AMF Certification",
          "IFRS",
          "US GAAP",
          "Basel III",
          "Solvency II",
        ],
      },
      {
        name: "Soft Skills",
        skills: [
          "Attention to Detail",
          "Analytical Thinking",
          "Time Management",
          "Client Relationship",
          "Presentation Skills",
          "Negotiation",
          "Stress Management",
        ],
      },
    ],
  },
  {
    id: "tech",
    name: { fr: "Tech / IT", en: "Tech / IT" },
    categories: [
      {
        name: "Programming Languages",
        skills: [
          "JavaScript",
          "TypeScript",
          "Python",
          "Java",
          "C++",
          "C#",
          "Go",
          "Rust",
          "Ruby",
          "PHP",
          "Swift",
          "Kotlin",
          "Scala",
        ],
      },
      {
        name: "Frontend",
        skills: [
          "React",
          "Vue.js",
          "Angular",
          "Next.js",
          "Nuxt.js",
          "Svelte",
          "HTML5",
          "CSS3",
          "Tailwind CSS",
          "SASS/SCSS",
          "Webpack",
          "Vite",
        ],
      },
      {
        name: "Backend",
        skills: [
          "Node.js",
          "Express.js",
          "NestJS",
          "Django",
          "Flask",
          "FastAPI",
          "Spring Boot",
          "Ruby on Rails",
          "GraphQL",
          "REST API",
          "Microservices",
        ],
      },
      {
        name: "Database",
        skills: [
          "PostgreSQL",
          "MySQL",
          "MongoDB",
          "Redis",
          "Elasticsearch",
          "Prisma",
          "Sequelize",
          "TypeORM",
        ],
      },
      {
        name: "DevOps & Cloud",
        skills: [
          "AWS",
          "Google Cloud",
          "Azure",
          "Docker",
          "Kubernetes",
          "Terraform",
          "CI/CD",
          "GitHub Actions",
          "Jenkins",
          "Linux",
          "Nginx",
        ],
      },
      {
        name: "Data & AI",
        skills: [
          "Machine Learning",
          "Deep Learning",
          "TensorFlow",
          "PyTorch",
          "Pandas",
          "NumPy",
          "Scikit-learn",
          "NLP",
          "Computer Vision",
          "LLMs",
        ],
      },
    ],
  },
  {
    id: "consulting",
    name: { fr: "Conseil / Strategy", en: "Consulting / Strategy" },
    categories: [
      {
        name: "Strategy & Analysis",
        skills: [
          "Strategic Planning",
          "Market Analysis",
          "Competitive Intelligence",
          "Business Case Development",
          "Due Diligence",
          "Benchmarking",
          "SWOT Analysis",
          "Porter's Five Forces",
          "Value Chain Analysis",
          "Growth Strategy",
        ],
      },
      {
        name: "Tools",
        skills: [
          "Microsoft PowerPoint",
          "Microsoft Excel",
          "Tableau",
          "Power BI",
          "Alteryx",
          "SPSS",
          "SAS",
          "Miro",
          "Notion",
        ],
      },
      {
        name: "Frameworks",
        skills: [
          "McKinsey 7S",
          "BCG Matrix",
          "Balanced Scorecard",
          "OKRs",
          "Agile Methodology",
          "Design Thinking",
          "Lean Six Sigma",
          "Change Management",
        ],
      },
      {
        name: "Soft Skills",
        skills: [
          "Executive Communication",
          "Stakeholder Management",
          "Problem Solving",
          "Critical Thinking",
          "Team Leadership",
          "Client Engagement",
          "Facilitation",
          "Synthesis & Structuring",
        ],
      },
    ],
  },
  {
    id: "marketing",
    name: { fr: "Marketing / Communication", en: "Marketing / Communications" },
    categories: [
      {
        name: "Digital Marketing",
        skills: [
          "SEO/SEM",
          "Google Analytics",
          "Google Ads",
          "Meta Ads",
          "LinkedIn Ads",
          "Content Marketing",
          "Email Marketing",
          "Marketing Automation",
          "HubSpot",
          "Salesforce Marketing Cloud",
        ],
      },
      {
        name: "Social Media",
        skills: [
          "Social Media Strategy",
          "Community Management",
          "Influencer Marketing",
          "TikTok Marketing",
          "Instagram Marketing",
          "LinkedIn Marketing",
          "Hootsuite",
          "Sprout Social",
        ],
      },
      {
        name: "Creative",
        skills: [
          "Adobe Creative Suite",
          "Photoshop",
          "Illustrator",
          "InDesign",
          "Figma",
          "Canva",
          "Video Editing",
          "Premiere Pro",
          "After Effects",
          "Copywriting",
          "Brand Strategy",
        ],
      },
      {
        name: "Analytics",
        skills: [
          "Data Analysis",
          "A/B Testing",
          "Conversion Rate Optimization",
          "Customer Journey Mapping",
          "Market Research",
          "Consumer Insights",
        ],
      },
    ],
  },
  {
    id: "engineering",
    name: { fr: "Ingénierie", en: "Engineering" },
    categories: [
      {
        name: "Mechanical",
        skills: [
          "CAD (AutoCAD, SolidWorks, CATIA)",
          "FEA Analysis",
          "CFD Simulation",
          "3D Printing",
          "Product Design",
          "Manufacturing Processes",
          "GD&T",
          "Lean Manufacturing",
        ],
      },
      {
        name: "Electrical",
        skills: [
          "Circuit Design",
          "PCB Design",
          "MATLAB/Simulink",
          "PLC Programming",
          "SCADA Systems",
          "Power Systems",
          "Embedded Systems",
          "VHDL/Verilog",
        ],
      },
      {
        name: "Civil",
        skills: [
          "Structural Analysis",
          "AutoCAD Civil 3D",
          "Revit",
          "BIM",
          "Project Management",
          "Cost Estimation",
          "Environmental Impact Assessment",
        ],
      },
    ],
  },
  {
    id: "healthcare",
    name: { fr: "Santé / Pharma", en: "Healthcare / Pharma" },
    categories: [
      {
        name: "Clinical",
        skills: [
          "Clinical Research",
          "GCP/GLP",
          "Clinical Trial Management",
          "Regulatory Affairs",
          "Pharmacovigilance",
          "Medical Writing",
          "Biostatistics",
          "SAS",
          "R",
        ],
      },
      {
        name: "Healthcare IT",
        skills: [
          "Electronic Health Records (EHR)",
          "HL7/FHIR",
          "HIPAA Compliance",
          "Medical Imaging",
          "Telemedicine",
          "Healthcare Analytics",
        ],
      },
    ],
  },
  {
    id: "legal",
    name: { fr: "Droit / Juridique", en: "Legal" },
    categories: [
      {
        name: "Legal Skills",
        skills: [
          "Contract Drafting",
          "Legal Research",
          "M&A Transactions",
          "Corporate Law",
          "Intellectual Property",
          "Litigation",
          "Compliance",
          "GDPR",
          "Due Diligence",
          "Negotiation",
        ],
      },
      {
        name: "Tools",
        skills: [
          "Westlaw",
          "LexisNexis",
          "Contract Management Systems",
          "Legal Project Management",
        ],
      },
    ],
  },
  {
    id: "hr",
    name: { fr: "Ressources Humaines", en: "Human Resources" },
    categories: [
      {
        name: "HR Skills",
        skills: [
          "Talent Acquisition",
          "Recruitment",
          "Employer Branding",
          "Performance Management",
          "Compensation & Benefits",
          "HRIS (Workday, SAP HR)",
          "Learning & Development",
          "Employee Engagement",
          "Labor Law",
          "Diversity & Inclusion",
        ],
      },
    ],
  },
  {
    id: "data",
    name: { fr: "Data / Analytics", en: "Data / Analytics" },
    categories: [
      {
        name: "Data Engineering",
        skills: [
          "ETL/ELT",
          "Apache Spark",
          "Apache Kafka",
          "Airflow",
          "dbt",
          "Snowflake",
          "Databricks",
          "BigQuery",
          "Redshift",
          "Data Warehousing",
        ],
      },
      {
        name: "Data Science",
        skills: [
          "Statistical Analysis",
          "Machine Learning",
          "Python",
          "R",
          "SQL",
          "Pandas",
          "Scikit-learn",
          "TensorFlow",
          "PyTorch",
          "Feature Engineering",
          "Model Deployment",
        ],
      },
      {
        name: "Business Intelligence",
        skills: [
          "Tableau",
          "Power BI",
          "Looker",
          "Metabase",
          "Data Visualization",
          "Dashboard Design",
          "KPI Development",
          "Reporting",
        ],
      },
    ],
  },
];

/**
 * Get all skills for a specific domain
 */
export function getSkillsByDomain(domainId: string): string[] {
  const domain = DOMAIN_SKILLS.find((d) => d.id === domainId);
  if (!domain) return [];

  return domain.categories.flatMap((cat) => cat.skills);
}

/**
 * Get skills grouped by category for a domain
 */
export function getSkillsByCategoryForDomain(
  domainId: string
): SkillCategory[] {
  const domain = DOMAIN_SKILLS.find((d) => d.id === domainId);
  return domain?.categories || [];
}

/**
 * Get all domains
 */
export function getAllDomains(): { id: string; name: { fr: string; en: string } }[] {
  return DOMAIN_SKILLS.map((d) => ({ id: d.id, name: d.name }));
}

/**
 * Search skills across all domains
 */
export function searchSkills(query: string): string[] {
  const results: string[] = [];
  const queryLower = query.toLowerCase();

  DOMAIN_SKILLS.forEach((domain) => {
    domain.categories.forEach((category) => {
      category.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(queryLower)) {
          results.push(skill);
        }
      });
    });
  });

  return [...new Set(results)];
}
