export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  variants?: {
    size?: string[];
    color?: string[];
  };
  specifications?: {
    [key: string]: string;
  };
  relatedProducts?: string[];
  tags?: string[];
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

export interface Filter {
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
  filters: Filter;
  suggestedCategories?: Category[];
  relatedSearches?: string[];
}
