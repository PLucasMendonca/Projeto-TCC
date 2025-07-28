export interface AppDetails {
  title: string;
  description: string;
  shortDescription?: string;
  icon: string;
  bannerUrl?: string;
  videoUrl?: string;
  screenshots: string[];
  rating: number;
  ratesCount: number;
  ratingDistribution?: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  reviews: number;
  price: number;
  currency?: string;
  genre: string;
  developer: string;
  developerId?: string;
  developerEmail?: string;
  developerWebsite?: string;
  developerAddress?: string;
  installs: string;
  size: string;
  version: string;
  minAndroidVersion?: string;
  minSdkVersion?: string;
  lastUpdated: string;
  releasedOn?: string;
  contentRating: string;
  ageRating?: string;
  hasInAppPurchases: boolean;
  containsAds: boolean;
  permissions?: string[];
  minInstalls: number;
  maxInstalls: number;
  privacyPolicy?: string;
  tags?: string[];
  topDeveloperApps?: string[];
  topSimilarApps?: string[];
  url?: string;
}

export interface Review {
  userName: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
  reply?: string;

  // Campos mapeados para compatibilidade
  score?: number; // alias para rating
  text?: string; // alias para content
}

export interface SearchResult {
  id: string;
  name: string;
  developer: string;
  icon: string;
  rating: number;
  installs: string;
  url?: string;
  bannerUrl?: string;
}
