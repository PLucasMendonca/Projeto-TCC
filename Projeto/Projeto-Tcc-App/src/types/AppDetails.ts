export interface HardwareRequirements {
  gpu?: {
    minModel?: string;
    minVendor?: string;
    requiredFeatures?: string[];
  };
  cpu?: {
    minCores?: number;
    minSpeed?: number;
    architecture: string[];
  };
  screen?: {
    minWidth?: number;
    minHeight?: number;
    minRefreshRate?: number;
  };
  sensors?: string[];
}

export interface PerformanceRequirements {
  minBenchmarkScore?: number;
  expectedFPS?: number;
  thermalThreshold?: number;
  networkRequirements?: {
    minSpeed?: number;
    type?: string[];
  };
}

export interface AppDetails {
  // Informações Básicas
  id: string;
  appId?: string;
  title: string;
  packageName: string;
  developer: string;
  description: string;
  icon: string;
  url?: string;
  screenshots?: string[];

  // Avaliações e Métricas
  rating: number;
  ratingCount: number;
  score: number;
  reviews: number;
  installs?: string;

  // Preço e Monetização
  price: string;
  currency?: string;
  hasInAppPurchases?: boolean;
  containsAds?: boolean;
  free?: boolean;
  adSupported?: boolean;

  // Categorização
  genre?: string;
  tags?: string[];
  contentRating?: string;
  contentRatingDescription?: string;

  // Requisitos Técnicos
  size: number;
  version: string;
  minSdkVersion: number;
  minAndroidVersion: string;
  ram: number;
  cpuArch: string[];
  requiresStorage: number;

  // Requisitos de Hardware e Performance
  requiredHardware?: HardwareRequirements;
  performance?: PerformanceRequirements;

  // Permissões e Recursos
  permissions: string[];
  requiredFeatures?: string[];
  optionalFeatures?: string[];

  // Atualizações e Histórico
  lastUpdated: string;
  released?: string;
  updated?: string;
  recentChanges?: string[];

  // Relacionados
  similarApps?: string[];
  moreByDeveloper?: string[];

  // Mídia Adicional
  summary?: string;
  video?: string;
  headerImage?: string;
}
