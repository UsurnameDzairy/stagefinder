/**
 * Validates if an email has a .edu domain
 * Supports formats like:
 * - user@university.edu
 * - user@edu.university.fr
 * - user@subdomain.edu.university.com
 */
export function isEduEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailLower = email.toLowerCase().trim();
  
  // Check if email contains @edu. or ends with .edu
  const eduPatterns = [
    /@[^@]+\.edu$/,           // ends with .edu (e.g., user@university.edu)
    /@edu\.[^@]+$/,           // has @edu. (e.g., user@edu.devinci.fr)
    /@[^@]+\.edu\.[^@]+$/,    // has .edu. in domain (e.g., user@subdomain.edu.university.com)
  ];

  return eduPatterns.some(pattern => pattern.test(emailLower));
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if email is both valid and has .edu domain
 */
export function isValidEduEmail(email: string): boolean {
  return isValidEmail(email) && isEduEmail(email);
}
