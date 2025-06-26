export interface MobileGame {
  id: string;
  title: string;
  packageName: string;
  developer: string;
  icon: string;
  rating: number;
  reviews: number;
  size: string;
  installs: string;
  price: string;
  androidVersion: string;
  category: string;
  contentRating: string;
  lastUpdated: string;
  requirements: {
    minAndroidVersion: string;
    minRam?: string;
    minStorage?: string;
    requiredPermissions: string[];
  };
}
