
export enum BrandId {
  SAMONYA_AI = 'samonya_ai',
  ACADEMY = 'academy',
  DREAM_EYE = 'dream_eye',
  MOTIVATION = 'motivation',
  MILELE = 'milele',
  KIDS = 'kids',
  SKY = 'sky',
  TV = 'tv',
  FILMS = 'films',
  COMEDY = 'comedy',
  BLOG = 'blog',
  LIVE = 'live',
  BUSINESS_MATRIX = 'business_matrix'
}

export type ContentType = 'video' | 'music' | 'article' | 'image' | 'quote' | 'dream_analysis';

export interface InteractionMetrics {
  likes: number;
  loves: number;
  dislikes: number;
  comments: number;
}

export interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
  avatarColor?: string;
}

export interface DreamSymbol {
    name: string;
    meaning: string;
}

export interface DreamEmotions {
    fear: number;
    hope: number;
    stress: number;
    transformation: number;
    intuition: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  brandId: BrandId;
  type: ContentType;
  isPremium: boolean;
  date: string;
  tags: string[];
  views: number;
  url?: string; // For demo purposes, link to placeholder
  author?: string; // For blogs/news
  interactions: InteractionMetrics;
  commentList: Comment[];
  // For Quote type
  quoteText?: string;
  // For Dream Type (Version 2.0)
  dreamAnalysis?: {
    summary: string;
    symbols: DreamSymbol[];
    emotions: DreamEmotions;
    archetype: string;
    archetypeReason: string;
    subconsciousMeaning: string;
    lifeApplication: string;
    dreamUniverseVisual: string; // The text description for visualization
    visualPrompt: string; // The prompt used for image gen
    futureInsight?: string;
  }
  // For Music Type
  musicMetadata?: {
      genre: string;
      mood: string;
      instruments: string[];
      lyrics?: string;
      duration: string;
  }
}

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  description: string;
  color: string;
  gradient: string;
  icon: string; // Icon name from Lucide
  route: string;
  themeColor: string; // CSS class for bg color
  textColor: string; // CSS class for text color
}

export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  joinedDate: string;
  avatar?: string;
  plan?: 'Free' | 'Monthly' | 'Yearly';
}
