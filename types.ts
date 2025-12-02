export enum BrandId {
  MILELE = 'samn-milele',
  KIDS = 'samonya-kids',
  SKY = 'samn-sky',
  TV = 'samonya-tv',
  FILMS = 'samonya-films'
}

export interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  category: BrandId;
  description: string;
  type: 'video' | 'article' | 'song' | 'film';
  tags?: string[];
  duration?: string;
  date?: string;
  premium?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'basic' | 'pro' | 'vip';
}