/**
 * CookieManager handles reading, writing, and tracking user preferences in cookies
 * This enables subtle personalization through behavior tracking
 */

// Cookie names
const COOKIE_PREFERENCES = 'bookburst_preferences';
const COOKIE_BEHAVIOR = 'bookburst_behavior';
const COOKIE_CONSENT = 'bookburst_consent';

// Default expiration - 30 days
const DEFAULT_EXPIRATION_DAYS = 30;

// Helper to get cookie expiration date
const getExpirationDate = (days: number = DEFAULT_EXPIRATION_DAYS): Date => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return date;
};

// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = DEFAULT_EXPIRATION_DAYS): void => {
  const expires = getExpirationDate(days).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;samesite=strict`;
};

export const getCookie = (name: string): string | null => {
  const cookieMatch = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return cookieMatch ? decodeURIComponent(cookieMatch[2]) : null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Cookie consent management
export const hasConsent = (): boolean => {
  return getCookie(COOKIE_CONSENT) === 'true';
};

export const setConsent = (hasConsent: boolean): void => {
  setCookie(COOKIE_CONSENT, hasConsent.toString(), 365); // Consent lasts a year
};

// User preferences interface
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  favoriteGenres?: string[];
  viewMode?: 'grid' | 'list';
  sortOrder?: 'title' | 'author' | 'date_added' | 'rating';
}

// User behavior tracking interface
export interface UserBehavior {
  recentlyViewedGenres: string[];
  recentlyViewedAuthors: string[];
  recentlyViewedBooks: number[]; // Book IDs
  searchHistory: string[];
  interactionsByGenre: Record<string, number>; // Count of interactions by genre
}

// Default user behavior
const DEFAULT_BEHAVIOR: UserBehavior = {
  recentlyViewedGenres: [],
  recentlyViewedAuthors: [],
  recentlyViewedBooks: [],
  searchHistory: [],
  interactionsByGenre: {},
};

// Get user preferences from cookie
export const getUserPreferences = (): UserPreferences => {
  if (!hasConsent()) return {};
  
  const prefsCookie = getCookie(COOKIE_PREFERENCES);
  if (!prefsCookie) return {};
  
  try {
    return JSON.parse(prefsCookie) as UserPreferences;
  } catch (e) {
    console.error('Error parsing preferences cookie:', e);
    return {};
  }
};

// Save user preferences to cookie
export const saveUserPreferences = (prefs: UserPreferences): void => {
  if (!hasConsent()) return;
  setCookie(COOKIE_PREFERENCES, JSON.stringify(prefs));
};

// Get user behavior tracking data
export const getUserBehavior = (): UserBehavior => {
  if (!hasConsent()) return DEFAULT_BEHAVIOR;
  
  const behaviorCookie = getCookie(COOKIE_BEHAVIOR);
  if (!behaviorCookie) return DEFAULT_BEHAVIOR;
  
  try {
    return JSON.parse(behaviorCookie) as UserBehavior;
  } catch (e) {
    console.error('Error parsing behavior cookie:', e);
    return DEFAULT_BEHAVIOR;
  }
};

// Save user behavior tracking data
export const saveUserBehavior = (behavior: UserBehavior): void => {
  if (!hasConsent()) return;
  setCookie(COOKIE_BEHAVIOR, JSON.stringify(behavior));
};

// Track a book view
export const trackBookView = (bookId: number, genre?: string, author?: string): void => {
  if (!hasConsent()) return;
  
  const behavior = getUserBehavior();
  
  // Add to recently viewed books (keep most recent 10)
  behavior.recentlyViewedBooks = [
    bookId, 
    ...behavior.recentlyViewedBooks.filter(id => id !== bookId)
  ].slice(0, 10);
  
  // Track genre if provided
  if (genre) {
    behavior.recentlyViewedGenres = [
      genre, 
      ...behavior.recentlyViewedGenres.filter(g => g !== genre)
    ].slice(0, 5);
    
    // Increment genre interaction count
    behavior.interactionsByGenre[genre] = (behavior.interactionsByGenre[genre] || 0) + 1;
  }
  
  // Track author if provided
  if (author) {
    behavior.recentlyViewedAuthors = [
      author, 
      ...behavior.recentlyViewedAuthors.filter(a => a !== author)
    ].slice(0, 5);
  }
  
  saveUserBehavior(behavior);
};

// Track a search query
export const trackSearch = (query: string): void => {
  if (!hasConsent() || !query.trim()) return;
  
  const behavior = getUserBehavior();
  
  // Add to search history (keep most recent 10)
  behavior.searchHistory = [
    query, 
    ...behavior.searchHistory.filter(q => q !== query)
  ].slice(0, 10);
  
  saveUserBehavior(behavior);
};

// Get personalized genre recommendations based on user behavior
export const getPersonalizedGenres = (): string[] => {
  if (!hasConsent()) return [];
  
  const behavior = getUserBehavior();
  
  // Sort genres by interaction count
  const sortedGenres = Object.entries(behavior.interactionsByGenre)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
    .slice(0, 3);
  
  // Combine and deduplicate the arrays
  const combinedGenres = [...sortedGenres];
  
  // Add genres from recently viewed that aren't already in the array
  behavior.recentlyViewedGenres.forEach(genre => {
    if (!combinedGenres.includes(genre)) {
      combinedGenres.push(genre);
    }
  });
  
  return combinedGenres.slice(0, 5);
};

// Check if a genre should be highlighted based on user behavior
export const shouldHighlightGenre = (genre: string): boolean => {
  if (!hasConsent()) return false;
  
  const behavior = getUserBehavior();
  const preferences = getUserPreferences();
  
  // Highlight if it's in favorite genres
  if (preferences.favoriteGenres?.includes(genre)) return true;
  
  // Highlight if it's one of the top 3 most interacted genres
  const topGenres = Object.entries(behavior.interactionsByGenre)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g)
    .slice(0, 3);
    
  return topGenres.includes(genre);
};

// Get book recommendations based on user behavior
export const getPersonalizedBookRecommendations = (allBooks: any[]): any[] => {
  if (!hasConsent() || allBooks.length === 0) return allBooks;
  
  const behavior = getUserBehavior();
  
  // No behavior data yet, return original books
  if (behavior.recentlyViewedGenres.length === 0 && 
      Object.keys(behavior.interactionsByGenre).length === 0) {
    return allBooks;
  }
  
  // Get most interacted genres
  const favGenres = getPersonalizedGenres();
  
  // Score each book based on matching criteria
  const scoredBooks = allBooks.map(book => {
    let score = 0;
    
    // Higher score for books in favorite genres
    if (book.genre && favGenres.includes(book.genre)) {
      score += 5;
    }
    
    // Higher score for books by recently viewed authors
    if (book.author && behavior.recentlyViewedAuthors.includes(book.author)) {
      score += 3;
    }
    
    // Penalize books already viewed
    if (behavior.recentlyViewedBooks.includes(book.id)) {
      score -= 2;
    }
    
    return { book, score };
  });
  
  // Sort by score and return books
  return scoredBooks
    .sort((a, b) => b.score - a.score)
    .map(item => item.book);
};