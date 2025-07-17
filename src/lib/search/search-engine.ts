// Search engine functionality
import { SearchIndex, SearchResult, ContentType } from '@/types/content';
import { loadSearchIndex } from './search-index-builder';

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  contentTypes?: ContentType[];
  categories?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
  fuzzy?: boolean;
  highlightMatches?: boolean;
  highlightLength?: number;
  minScore?: number;
}

/**
 * Search results with pagination
 */
export interface SearchResults {
  results: SearchResult[];
  total: number;
  query: string;
  limit: number;
  offset: number;
  hasMore: boolean;
  executionTimeMs: number;
  suggestedQueries?: string[];
}

/**
 * Performs a search against the search index
 * @param options Search options
 * @returns Search results
 */
export async function search(options: SearchOptions): Promise<SearchResults> {
  const startTime = performance.now();

  const {
    query,
    contentTypes,
    categories,
    tags,
    limit = 10,
    offset = 0,
    fuzzy = true,
    highlightMatches = true,
    highlightLength = 160,
    minScore = 0.2,
  } = options;

  // Load search index
  const searchIndex = await loadSearchIndex();

  // Filter index by content types, categories, and tags if specified
  let filteredIndex = searchIndex;

  if (contentTypes && contentTypes.length > 0) {
    filteredIndex = filteredIndex.filter(item => contentTypes.includes(item.type));
  }

  if (categories && categories.length > 0) {
    filteredIndex = filteredIndex.filter(item => categories.includes(item.category));
  }

  if (tags && tags.length > 0) {
    filteredIndex = filteredIndex.filter(item => tags.some(tag => item.tags.includes(tag)));
  }

  // If query is empty, return all filtered items sorted by most recent
  if (!query.trim()) {
    const results = filteredIndex
      .map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        url: generateUrl(item),
        score: 1,
        highlights: [],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(offset, offset + limit);

    return {
      results,
      total: filteredIndex.length,
      query,
      limit,
      offset,
      hasMore: offset + limit < filteredIndex.length,
      executionTimeMs: performance.now() - startTime,
    };
  }

  // Normalize query
  const normalizedQuery = normalizeText(query);
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  // Score and rank results
  const scoredResults = filteredIndex.map(item => {
    const score = calculateScore(item, normalizedQuery, queryTerms, fuzzy);

    // Generate highlights if requested and score is above threshold
    let highlights: string[] = [];
    if (highlightMatches && score >= minScore) {
      highlights = generateHighlights(item, queryTerms, highlightLength);
    }

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      url: generateUrl(item),
      score,
      highlights,
    };
  });

  // Filter by minimum score and sort by score
  const rankedResults = scoredResults
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Apply pagination
  const paginatedResults = rankedResults.slice(offset, offset + limit);

  // Generate suggested queries if no results or few results
  let suggestedQueries: string[] | undefined;
  if (rankedResults.length < 3 && queryTerms.length > 0) {
    suggestedQueries = generateSuggestedQueries(queryTerms, searchIndex);
  }

  // Return results
  return {
    results: paginatedResults,
    total: rankedResults.length,
    query,
    limit,
    offset,
    hasMore: offset + limit < rankedResults.length,
    executionTimeMs: performance.now() - startTime,
    suggestedQueries,
  };
}

/**
 * Calculates a relevance score for an item based on the query
 * @param item Search index item
 * @param normalizedQuery Normalized query string
 * @param queryTerms Individual query terms
 * @param fuzzy Whether to use fuzzy matching
 * @returns Score between 0 and 1
 */
function calculateScore(
  item: SearchIndex,
  normalizedQuery: string,
  queryTerms: string[],
  fuzzy: boolean
): number {
  // Normalize item text for comparison
  const normalizedTitle = normalizeText(item.title);
  const normalizedDescription = normalizeText(item.description);
  const normalizedContent = normalizeText(item.searchableContent);

  // Calculate scores for different fields
  let titleScore = 0;
  let descriptionScore = 0;
  let contentScore = 0;
  let tagScore = 0;

  // Exact match in title (highest weight)
  if (normalizedTitle.includes(normalizedQuery)) {
    titleScore = 1;
  } else {
    // Partial matches in title
    titleScore = calculateTermMatches(normalizedTitle, queryTerms, fuzzy) * 0.8;
  }

  // Matches in description
  descriptionScore = calculateTermMatches(normalizedDescription, queryTerms, fuzzy) * 0.6;

  // Matches in content
  contentScore = calculateTermMatches(normalizedContent, queryTerms, fuzzy) * 0.4;

  // Tag matches
  const normalizedTags = item.tags.map(tag => normalizeText(tag));
  const tagMatches = queryTerms.filter(term =>
    normalizedTags.some(tag => (fuzzy ? tag.includes(term) : tag === term))
  ).length;

  tagScore = tagMatches > 0 ? (tagMatches / queryTerms.length) * 0.7 : 0;

  // Combine scores with weights
  const combinedScore = Math.max(titleScore, descriptionScore, contentScore, tagScore);

  return Math.min(1, combinedScore);
}

/**
 * Calculates the proportion of query terms that match in the text
 * @param text Text to search in
 * @param terms Query terms to search for
 * @param fuzzy Whether to use fuzzy matching
 * @returns Score between 0 and 1
 */
function calculateTermMatches(text: string, terms: string[], fuzzy: boolean): number {
  if (terms.length === 0) return 0;

  const matches = terms.filter(term => {
    if (fuzzy) {
      return text.includes(term);
    } else {
      const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
      return regex.test(text);
    }
  }).length;

  return matches / terms.length;
}

/**
 * Generates URL for a search result based on its type
 * @param item Search index item
 * @returns URL string
 */
function generateUrl(item: SearchIndex): string {
  switch (item.type) {
    case 'portfolio':
      return `/02_portfolio/${item.id}`;
    case 'blog':
      return `/03_workshop/blog/${item.id}`;
    case 'plugin':
      return `/03_workshop/plugins/${item.id}`;
    case 'tool':
      return `/04_tools/${item.id}`;
    case 'page':
      return `/${item.id}`;
    default:
      return `/${item.type}/${item.id}`;
  }
}

/**
 * Generates highlight snippets for search results
 * @param item Search index item
 * @param queryTerms Query terms to highlight
 * @param maxLength Maximum length of highlight snippet
 * @returns Array of highlight snippets
 */
function generateHighlights(item: SearchIndex, queryTerms: string[], maxLength: number): string[] {
  if (!item.content || queryTerms.length === 0) {
    return [item.description.substring(0, maxLength)];
  }

  const normalizedContent = normalizeText(item.content);
  const highlights: string[] = [];

  // Find positions of query terms in content
  const positions: number[] = [];

  queryTerms.forEach(term => {
    let pos = normalizedContent.indexOf(term);
    while (pos !== -1) {
      positions.push(pos);
      pos = normalizedContent.indexOf(term, pos + 1);
    }
  });

  // Sort positions
  positions.sort((a, b) => a - b);

  // Generate snippets around positions
  if (positions.length > 0) {
    // Group nearby positions to avoid overlapping snippets
    const snippetPositions: number[] = [positions[0]];

    for (let i = 1; i < positions.length; i++) {
      const lastPos = snippetPositions[snippetPositions.length - 1];
      if (positions[i] - lastPos > maxLength) {
        snippetPositions.push(positions[i]);
      }
    }

    // Generate snippets for each position
    snippetPositions.forEach(pos => {
      const start = Math.max(0, pos - maxLength / 4);
      const end = Math.min(item.content!.length, pos + (maxLength * 3) / 4);
      let snippet = item.content!.substring(start, end);

      // Add ellipsis if needed
      if (start > 0) {
        snippet = '...' + snippet;
      }

      if (end < item.content!.length) {
        snippet = snippet + '...';
      }

      highlights.push(snippet);
    });
  }

  // If no highlights found, use description
  if (highlights.length === 0) {
    highlights.push(item.description.substring(0, maxLength));
  }

  return highlights.slice(0, 3); // Limit to 3 highlights
}

/**
 * Generates suggested queries when no results are found
 * @param queryTerms Original query terms
 * @param searchIndex Search index
 * @returns Array of suggested queries
 */
function generateSuggestedQueries(queryTerms: string[], searchIndex: SearchIndex[]): string[] {
  if (queryTerms.length === 0) return [];

  const suggestions: Set<string> = new Set();

  // Try removing one term at a time
  if (queryTerms.length > 1) {
    for (let i = 0; i < queryTerms.length; i++) {
      const newTerms = [...queryTerms];
      newTerms.splice(i, 1);
      suggestions.add(newTerms.join(' '));
    }
  }

  // Try finding similar terms in the index
  queryTerms.forEach(term => {
    if (term.length < 3) return; // Skip short terms

    // Find similar terms in the index
    const similarTerms = findSimilarTerms(term, searchIndex);
    similarTerms.forEach(similarTerm => {
      const newTerms = queryTerms.map(t => (t === term ? similarTerm : t));
      suggestions.add(newTerms.join(' '));
    });
  });

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Finds terms in the search index that are similar to the given term
 * @param term Term to find similar terms for
 * @param searchIndex Search index
 * @returns Array of similar terms
 */
function findSimilarTerms(term: string, searchIndex: SearchIndex[]): string[] {
  const allTerms = new Set<string>();
  const minLength = Math.max(3, term.length - 2);

  // Extract terms from titles and tags
  searchIndex.forEach(item => {
    // Add title words
    normalizeText(item.title)
      .split(/\s+/)
      .filter(word => word.length >= minLength)
      .forEach(word => allTerms.add(word));

    // Add tags
    item.tags.forEach(tag => {
      normalizeText(tag)
        .split(/\s+/)
        .filter(word => word.length >= minLength)
        .forEach(word => allTerms.add(word));
    });
  });

  // Find similar terms
  return Array.from(allTerms)
    .filter(candidate => {
      // Check if candidate contains the term or term contains candidate
      if (candidate.includes(term) || term.includes(candidate)) {
        return true;
      }

      // Check edit distance for similar terms
      if (Math.abs(candidate.length - term.length) <= 2) {
        return calculateLevenshteinDistance(term, candidate) <= 2;
      }

      return false;
    })
    .slice(0, 5);
}

/**
 * Calculates Levenshtein distance between two strings
 * @param a First string
 * @param b Second string
 * @returns Edit distance
 */
function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Normalizes text for search
 * @param text Text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKC') // Normalize Unicode characters
    .replace(/[\u3000-\u303F]/g, ' ') // Replace Japanese punctuation with space
    .replace(/[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]/g, ' ') // Replace ASCII punctuation with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param string String to escape
 * @returns Escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
