export interface ScrapedProduct {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  sourceSite: string;
  affiliateUrl?: string;
  timestamp: Date;
  specifications?: Record<string, string>;
  availability: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ScrapingJob {
  id: string;
  productUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastScrapedAt?: Date;
  error?: string;
}

export type SupportedSites = 'amazon' | 'ebay' | 'aliexpress' | 'walmart'; 