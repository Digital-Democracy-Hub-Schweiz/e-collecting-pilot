/**
 * Utility functions for handling title display in dropdowns
 */

/**
 * Creates a shortened version of a title for display in input fields
 * @param title The full title
 * @param maxLength Maximum length for the shortened title (default: 50)
 * @returns Shortened title with ellipsis if needed
 */
export function createShortTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) {
    return title;
  }
  
  // Try to find a good breaking point (space, comma, parenthesis)
  const breakPoints = [' ', ',', '(', ')', '-'];
  let bestBreakPoint = -1;
  
  for (let i = maxLength - 1; i >= Math.max(0, maxLength - 20); i--) {
    if (breakPoints.includes(title[i])) {
      bestBreakPoint = i;
      break;
    }
  }
  
  if (bestBreakPoint > 0) {
    return title.substring(0, bestBreakPoint) + '...';
  }
  
  // If no good break point found, just truncate
  return title.substring(0, maxLength - 3) + '...';
}

/**
 * Creates a display-friendly title that removes common prefixes and suffixes
 * @param title The full title
 * @returns Cleaned title
 */
export function createDisplayTitle(title: string): string {
  // Remove common prefixes that make titles longer
  let cleaned = title
    .replace(/^Initiative für /i, '')
    .replace(/^Referendum gegen /i, '')
    .replace(/^Referendum für /i, '')
    .replace(/^Volksinitiative /i, '')
    .replace(/^Volksbegehren /i, '');
  
  // Remove parenthetical suffixes that are often redundant
  cleaned = cleaned.replace(/\s*\([^)]*\)$/, '');
  
  return cleaned;
}

/**
 * Creates both a short display title and a full title for dropdown options
 * @param title The full title
 * @param maxLength Maximum length for the short title
 * @returns Object with short and full titles
 */
export function createTitleVariants(title: string, maxLength: number = 50): {
  short: string;
  full: string;
  display: string;
} {
  const display = createDisplayTitle(title);
  const short = createShortTitle(display, maxLength);
  
  return {
    short,
    full: title,
    display
  };
}

