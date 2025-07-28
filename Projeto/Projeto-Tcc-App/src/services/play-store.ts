import axios from 'axios';

export interface AppDetails {
  title: string;
  description: string;
  summary: string;
  installs: string;
  minInstalls: number;
  maxInstalls: number;
  score: number;
  ratings: number;
  reviews: number;
  price: number;
  currency: string;
  available: boolean;
  offersIAP: boolean;
  size: string;
  androidVersion: string;
  androidVersionText: string;
  developer: string;
  developerId: string;
  developerEmail: string;
  developerWebsite: string;
  developerAddress: string;
  privacyPolicy: string;
  genre: string;
  genreId: string;
  familyGenre: string;
  familyGenreId: string;
  icon: string;
  headerImage: string;
  screenshots: string[];
  video: string;
  videoImage: string;
  contentRating: string;
  contentRatingDescription: string;
  adSupported: boolean;
  released: string;
  updated: number;
  version: string;
  recentChanges: string;
  // Informações técnicas adicionais
  permissions: string[];
  features: string[];
  dependencies: {
    name: string;
    version: string;
  }[];
  similarApps: {
    packageName: string;
    score: number;
    installs: string;
  }[];
  appFamily: {
    packageName: string;
    name: string;
    icon: string;
  }[];
}

export interface DeveloperApps {
  apps: {
    packageName: string;
    title: string;
    icon: string;
    score: number;
    installs: string;
  }[];
  total: number;
}

export interface AppReviews {
  reviews: {
    id: string;
    userName: string;
    userImage: string;
    content: string;
    score: number;
    date: string;
    version: string;
    thumbsUp: number;
    thumbsDown: number;
    replyContent?: string;
    replyDate?: string;
  }[];
  nextToken?: string;
}

export interface AppReviewHistory {
  history: {
    date: string;
    averageRating: number;
    totalRatings: number;
  }[];
}

export class PlayStoreService {
  private static readonly API_BASE_URL = 'YOUR_API_BASE_URL';
  private static readonly API_KEY = 'YOUR_API_KEY';

  private static async makeRequest<T>(endpoint: string, params: any = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}${endpoint}`, {
        params: {
          ...params,
          api_key: this.API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  }

  static async getAppDetails(packageName: string): Promise<AppDetails> {
    return this.makeRequest<AppDetails>('/app-details', { package_name: packageName });
  }

  static async getDeveloperApps(developerId: string): Promise<DeveloperApps> {
    return this.makeRequest<DeveloperApps>('/developer-apps', { developer_id: developerId });
  }

  static async getSimilarApps(packageName: string): Promise<AppDetails[]> {
    return this.makeRequest<AppDetails[]>('/similar-apps', { package_name: packageName });
  }

  static async getAppReviews(packageName: string, nextToken?: string): Promise<AppReviews> {
    return this.makeRequest<AppReviews>('/app-reviews', { 
      package_name: packageName,
      next_token: nextToken 
    });
  }

  static async getAppReviewHistory(packageName: string): Promise<AppReviewHistory> {
    return this.makeRequest<AppReviewHistory>('/app-review-history', { package_name: packageName });
  }

  static async searchApps(query: string): Promise<AppDetails[]> {
    return this.makeRequest<AppDetails[]>('/apps-search', { query });
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    return this.makeRequest<string[]>('/search-suggestions', { query });
  }

  static async getDeepSearchSuggestions(query: string): Promise<{
    suggestion: string;
    type: 'APP' | 'DEVELOPER' | 'CATEGORY';
    metadata?: any;
  }[]> {
    return this.makeRequest('/search-suggestions-deep', { query });
  }



  // Método para obter estatísticas de crescimento
  static async getAppGrowthStats(packageName: string): Promise<{
    dailyInstalls: { date: string; count: number }[];
    dailyUninstalls: { date: string; count: number }[];
    activeDevices: { date: string; count: number }[];
    ratings: { date: string; average: number; total: number }[];
  }> {
    return this.makeRequest('/app-growth-stats', { package_name: packageName });
  }
}
