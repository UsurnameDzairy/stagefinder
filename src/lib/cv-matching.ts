/**
 * Système de matching CV <-> Offres avec proximité géographique
 */

// Coordonnées des villes principales pour calculer la distance
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  // Monaco et environs
  "Monaco": { lat: 43.7384, lng: 7.4246, country: "Monaco" },
  "Nice": { lat: 43.7102, lng: 7.2620, country: "France" },
  "Cannes": { lat: 43.5528, lng: 7.0174, country: "France" },
  "Beausoleil": { lat: 43.7442, lng: 7.4261, country: "France" },
  
  // France
  "Paris": { lat: 48.8566, lng: 2.3522, country: "France" },
  "Lyon": { lat: 45.7640, lng: 4.8357, country: "France" },
  "Marseille": { lat: 43.2965, lng: 5.3698, country: "France" },
  "Bordeaux": { lat: 44.8378, lng: -0.5792, country: "France" },
  "Toulouse": { lat: 43.6047, lng: 1.4442, country: "France" },
  "Lille": { lat: 50.6292, lng: 3.0573, country: "France" },
  "Nantes": { lat: 47.2184, lng: -1.5536, country: "France" },
  "Strasbourg": { lat: 48.5734, lng: 7.7521, country: "France" },
  
  // Suisse
  "Geneva": { lat: 46.2044, lng: 6.1432, country: "Switzerland" },
  "Genève": { lat: 46.2044, lng: 6.1432, country: "Switzerland" },
  "Zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  "Lausanne": { lat: 46.5197, lng: 6.6323, country: "Switzerland" },
  "Basel": { lat: 47.5596, lng: 7.5886, country: "Switzerland" },
  "Bern": { lat: 46.9480, lng: 7.4474, country: "Switzerland" },
  
  // UK
  "London": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "Londres": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "Edinburgh": { lat: 55.9533, lng: -3.1883, country: "UK" },
  "Manchester": { lat: 53.4808, lng: -2.2426, country: "UK" },
  
  // Allemagne
  "Frankfurt": { lat: 50.1109, lng: 8.6821, country: "Germany" },
  "Francfort": { lat: 50.1109, lng: 8.6821, country: "Germany" },
  "Munich": { lat: 48.1351, lng: 11.5820, country: "Germany" },
  "Berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  
  // Benelux
  "Luxembourg": { lat: 49.6116, lng: 6.1319, country: "Luxembourg" },
  "Brussels": { lat: 50.8503, lng: 4.3517, country: "Belgium" },
  "Bruxelles": { lat: 50.8503, lng: 4.3517, country: "Belgium" },
  "Amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  
  // Autres
  "Milan": { lat: 45.4642, lng: 9.1900, country: "Italy" },
  "Madrid": { lat: 40.4168, lng: -3.7038, country: "Spain" },
  "Barcelona": { lat: 41.3851, lng: 2.1734, country: "Spain" },
  "Dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland" },
  "New York": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "Singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
  "Hong Kong": { lat: 22.3193, lng: 114.1694, country: "Hong Kong" },
  "Dubai": { lat: 25.2048, lng: 55.2708, country: "UAE" },
};

// Mapping des domaines vers des mots-clés de recherche
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  "Finance": ["finance", "financial", "financier", "banque", "bank", "investment", "investissement"],
  "Investment Banking": ["investment banking", "M&A", "mergers", "acquisitions", "IBD", "corporate finance"],
  "Private Equity": ["private equity", "PE", "buyout", "LBO", "capital investissement"],
  "Hedge Fund": ["hedge fund", "trading", "quant", "quantitative", "asset management"],
  "Asset Management": ["asset management", "gestion d'actifs", "portfolio", "fund management"],
  "Trading": ["trading", "sales", "markets", "derivatives", "fixed income", "equity"],
  "Risk Management": ["risk", "risque", "compliance", "audit", "control"],
  "Quantitative Finance": ["quant", "quantitative", "data science", "machine learning", "python", "algorithmic"],
  "Consulting": ["consulting", "conseil", "strategy", "stratégie", "management consulting"],
  "Technology": ["tech", "technology", "software", "developer", "engineering", "IT"],
  "Data Science": ["data science", "data analyst", "machine learning", "AI", "analytics"],
  "Marketing": ["marketing", "digital", "communication", "brand", "growth"],
};

// Zones géographiques par ordre de proximité depuis Monaco
const GEOGRAPHIC_ZONES_FROM_MONACO = [
  { name: "Monaco & Côte d'Azur", cities: ["Monaco", "Nice", "Cannes", "Beausoleil"], maxDistance: 50 },
  { name: "Suisse Romande", cities: ["Geneva", "Genève", "Lausanne"], maxDistance: 400 },
  { name: "Paris & Île-de-France", cities: ["Paris"], maxDistance: 1000 },
  { name: "Londres", cities: ["London", "Londres"], maxDistance: 1500 },
  { name: "Allemagne", cities: ["Frankfurt", "Francfort", "Munich"], maxDistance: 1000 },
  { name: "Benelux", cities: ["Luxembourg", "Brussels", "Bruxelles", "Amsterdam"], maxDistance: 1200 },
  { name: "International", cities: ["New York", "Singapore", "Hong Kong", "Dubai"], maxDistance: 10000 },
];

/**
 * Calculer la distance entre deux villes (formule de Haversine)
 */
function calculateDistance(city1: string, city2: string): number {
  const coord1 = CITY_COORDINATES[city1];
  const coord2 = CITY_COORDINATES[city2];
  
  if (!coord1 || !coord2) return Infinity;
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Extraire la ville de base de l'utilisateur depuis son CV
 */
export function extractUserBaseCity(cvText: string, cvCities: string[]): string {
  // Chercher dans l'adresse (généralement au début du CV)
  const addressPatterns = [
    /(?:adresse|address|domicile|résidence)[\s:]*([A-Za-zÀ-ÿ\s,]+)/i,
    /\d{5}\s*,?\s*([A-Za-zÀ-ÿ\-]+)/i, // Code postal suivi de ville
    /([A-Za-zÀ-ÿ\-]+)\s*,?\s*(?:France|Monaco|Suisse|Switzerland)/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = cvText.match(pattern);
    if (match) {
      const potentialCity = match[1].trim();
      // Vérifier si c'est une ville connue
      for (const city of Object.keys(CITY_COORDINATES)) {
        if (potentialCity.toLowerCase().includes(city.toLowerCase())) {
          return city;
        }
      }
    }
  }
  
  // Sinon, prendre la première ville mentionnée dans le CV
  if (cvCities.length > 0) {
    return cvCities[0];
  }
  
  // Par défaut, Paris
  return "Paris";
}

/**
 * Générer les requêtes de recherche basées sur le CV
 */
export interface SearchQuery {
  keywords: string;
  location: string;
  distance: number;
  priority: number; // 1 = plus proche, plus prioritaire
  zone: string;
}

export function generateSearchQueries(
  userDomains: string[],
  userSkills: string[],
  userBaseCity: string,
  contractType: string = "stage"
): SearchQuery[] {
  const queries: SearchQuery[] = [];
  
  // Déterminer les mots-clés de recherche basés sur les domaines
  const searchKeywords: string[] = [];
  
  for (const domain of userDomains) {
    const keywords = DOMAIN_KEYWORDS[domain];
    if (keywords) {
      searchKeywords.push(...keywords.slice(0, 2)); // Prendre les 2 premiers mots-clés
    }
  }
  
  // Ajouter les compétences clés
  const keySkills = userSkills.slice(0, 5);
  
  // Construire la requête principale
  const mainKeyword = searchKeywords.length > 0 
    ? searchKeywords[0] 
    : (keySkills.length > 0 ? keySkills[0] : contractType);
  
  // Générer les requêtes par zone géographique
  const baseCoord = CITY_COORDINATES[userBaseCity];
  
  if (baseCoord) {
    // Trier les villes par distance
    const citiesWithDistance = Object.entries(CITY_COORDINATES)
      .map(([city, coord]) => ({
        city,
        distance: calculateDistance(userBaseCity, city),
        country: coord.country,
      }))
      .sort((a, b) => a.distance - b.distance);
    
    // Grouper par zones de distance
    const zones = [
      { name: "Proximité immédiate", maxDistance: 100, priority: 1 },
      { name: "Région proche", maxDistance: 500, priority: 2 },
      { name: "National", maxDistance: 1000, priority: 3 },
      { name: "Europe", maxDistance: 2000, priority: 4 },
      { name: "International", maxDistance: Infinity, priority: 5 },
    ];
    
    for (const zone of zones) {
      const citiesInZone = citiesWithDistance.filter(
        c => c.distance <= zone.maxDistance && 
        (zone.name === "Proximité immédiate" || c.distance > (zones[zones.indexOf(zone) - 1]?.maxDistance || 0))
      );
      
      for (const { city, distance } of citiesInZone.slice(0, 3)) { // Max 3 villes par zone
        queries.push({
          keywords: `${contractType} ${mainKeyword}`,
          location: city,
          distance: Math.round(distance),
          priority: zone.priority,
          zone: zone.name,
        });
      }
    }
  }
  
  return queries;
}

/**
 * Scorer une offre par rapport au profil utilisateur
 */
export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  skills?: string[];
  contractType?: string;
  salary?: string;
  url?: string;
  source?: string;
}

export interface ScoredOffer extends JobOffer {
  score: number;
  matchDetails: {
    domainMatch: number;
    skillMatch: number;
    locationScore: number;
    totalScore: number;
  };
  distanceFromUser: number;
  zone: string;
}

export function scoreOffer(
  offer: JobOffer,
  userDomains: string[],
  userSkills: string[],
  userBaseCity: string
): ScoredOffer {
  let domainMatch = 0;
  let skillMatch = 0;
  let locationScore = 0;
  
  const offerText = `${offer.title} ${offer.description || ''} ${offer.company}`.toLowerCase();
  
  // Score de domaine (0-40 points)
  for (const domain of userDomains) {
    const keywords = DOMAIN_KEYWORDS[domain] || [domain.toLowerCase()];
    for (const keyword of keywords) {
      if (offerText.includes(keyword.toLowerCase())) {
        domainMatch += 10;
        break;
      }
    }
  }
  domainMatch = Math.min(domainMatch, 40);
  
  // Score de compétences (0-30 points)
  for (const skill of userSkills) {
    if (offerText.includes(skill.toLowerCase())) {
      skillMatch += 5;
    }
  }
  skillMatch = Math.min(skillMatch, 30);
  
  // Score de localisation (0-30 points)
  const distance = calculateDistance(userBaseCity, offer.location);
  let zone = "International";
  
  if (distance <= 100) {
    locationScore = 30;
    zone = "Proximité immédiate";
  } else if (distance <= 500) {
    locationScore = 25;
    zone = "Région proche";
  } else if (distance <= 1000) {
    locationScore = 20;
    zone = "National";
  } else if (distance <= 2000) {
    locationScore = 15;
    zone = "Europe";
  } else {
    locationScore = 10;
    zone = "International";
  }
  
  const totalScore = domainMatch + skillMatch + locationScore;
  
  return {
    ...offer,
    score: totalScore,
    matchDetails: {
      domainMatch,
      skillMatch,
      locationScore,
      totalScore,
    },
    distanceFromUser: Math.round(distance),
    zone,
  };
}

/**
 * Trier et grouper les offres par zone géographique
 */
export function groupOffersByZone(offers: ScoredOffer[]): Record<string, ScoredOffer[]> {
  const grouped: Record<string, ScoredOffer[]> = {
    "Proximité immédiate": [],
    "Région proche": [],
    "National": [],
    "Europe": [],
    "International": [],
  };
  
  for (const offer of offers) {
    if (grouped[offer.zone]) {
      grouped[offer.zone].push(offer);
    }
  }
  
  // Trier chaque groupe par score
  for (const zone of Object.keys(grouped)) {
    grouped[zone].sort((a, b) => b.score - a.score);
  }
  
  return grouped;
}

/**
 * Obtenir les meilleures offres triées par proximité puis par score
 */
export function getBestOffers(offers: ScoredOffer[], limit: number = 20): ScoredOffer[] {
  // Trier d'abord par zone (proximité), puis par score
  const zoneOrder = ["Proximité immédiate", "Région proche", "National", "Europe", "International"];
  
  return offers
    .sort((a, b) => {
      const zoneA = zoneOrder.indexOf(a.zone);
      const zoneB = zoneOrder.indexOf(b.zone);
      
      if (zoneA !== zoneB) {
        return zoneA - zoneB;
      }
      
      return b.score - a.score;
    })
    .slice(0, limit);
}

/**
 * Extraire le domaine principal depuis le CV (objectif, formation, expériences)
 */
export function extractMainDomain(cvText: string): string {
  const lowerText = cvText.toLowerCase();
  
  // Chercher dans la section objectif/profil
  const objectivePatterns = [
    /(?:objectif|profil|profile|summary|résumé)[\s:]*([^.]+)/i,
    /(?:recherche|looking for|seeking)[\s:]*([^.]+)/i,
  ];
  
  let objectiveText = "";
  for (const pattern of objectivePatterns) {
    const match = cvText.match(pattern);
    if (match) {
      objectiveText = match[1].toLowerCase();
      break;
    }
  }
  
  // Détecter le domaine principal
  const domainScores: Record<string, number> = {};
  
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
      }
      if (objectiveText.includes(keyword.toLowerCase())) {
        score += 3; // Bonus si dans l'objectif
      }
    }
    if (score > 0) {
      domainScores[domain] = score;
    }
  }
  
  // Retourner le domaine avec le meilleur score
  const sortedDomains = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  
  return sortedDomains.length > 0 ? sortedDomains[0][0] : "Finance";
}

export { CITY_COORDINATES, DOMAIN_KEYWORDS, calculateDistance };
