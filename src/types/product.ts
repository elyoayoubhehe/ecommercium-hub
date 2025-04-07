export interface Product {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  sourceSite: 'amazon' | 'ebay' | 'walmart' | 'aliexpress';
  affiliateUrl?: string;
  specifications?: Record<string, string>;
  availability: boolean;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  timestamp: Date;
}

export interface ProductComparison {
  productName: string;
  offers: Product[];
}

export interface TrackingRequest {
  url: string;
  productName: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  parentId?: string;
  children?: Category[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  images?: string[];
}

export interface SearchFilters {
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  inStock?: boolean;
  tags?: string[];
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  filters: SearchFilters;
  suggestedCategories?: Category[];
  relatedSearches?: string[];
}
