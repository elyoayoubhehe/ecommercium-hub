import axios from 'axios';

export interface ScrapedProduct {
  title: string;
  price: string;
  asin: string;
  rating: string;
  reviews: string;
  imageUrl: string;
  productUrl: string;
}

export interface ScrapingOptions {
  saveImages?: boolean;
  maxRetries?: number;
}

export class ScrapingService {
  private readonly baseUrl = 'http://localhost:3001/api';

  async searchProducts(searchTerm: string, options: ScrapingOptions = {}): Promise<ScrapedProduct[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/scrape`, {
        params: {
          searchTerm,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error scraping products:', error);
      throw error;
    }
  }

  async getProductDetails(asin: string): Promise<ScrapedProduct> {
    try {
      const response = await axios.get(`${this.baseUrl}/product/${asin}`);
      return response.data;
    } catch (error) {
      console.error('Error getting product details:', error);
      throw error;
    }
  }

  async trackProduct(asin: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/track`, { asin });
    } catch (error) {
      console.error('Error tracking product:', error);
      throw error;
    }
  }
} 