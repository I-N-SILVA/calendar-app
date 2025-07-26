
// Fuzzy search utility with highlighting
export interface FuzzyMatch {
  text: string;
  matches: boolean[];
  score: number;
}

export function fuzzySearch(query: string, text: string): FuzzyMatch {
  if (!query) {
    return {
      text,
      matches: Array(text.length).fill(false),
      score: 0
    };
  }

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const matches: boolean[] = Array(text.length).fill(false);
  
  let queryIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < text.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      matches[i] = true;
      queryIndex++;
      consecutiveMatches++;
      
      // Bonus points for consecutive matches
      score += consecutiveMatches * 2;
    } else {
      consecutiveMatches = 0;
    }
  }

  // Check if all query characters were matched
  const allMatched = queryIndex === queryLower.length;
  
  if (!allMatched) {
    return {
      text,
      matches: Array(text.length).fill(false),
      score: -1
    };
  }

  // Bonus for matching at word boundaries
  if (textLower.startsWith(queryLower)) {
    score += 50;
  }

  // Penalty for length difference
  score -= Math.abs(text.length - query.length);

  return {
    text,
    matches,
    score
  };
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export function getHighlightSegments(text: string, matches: boolean[]): HighlightSegment[] {
  const result: HighlightSegment[] = [];
  let currentGroup = '';
  let isHighlighted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const shouldHighlight = matches[i];

    if (shouldHighlight !== isHighlighted) {
      // State change - push current group
      if (currentGroup) {
        result.push({
          text: currentGroup,
          highlighted: isHighlighted
        });
      }
      currentGroup = char;
      isHighlighted = shouldHighlight;
    } else {
      currentGroup += char;
    }
  }

  // Push final group
  if (currentGroup) {
    result.push({
      text: currentGroup,
      highlighted: isHighlighted
    });
  }

  return result;
}