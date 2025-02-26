import axios from 'axios';
import { Product, TrackingRequest } from '../types/product';

const API_BASE_URL = 'http://localhost:3001/api';

export const productApi = {
  // Get product comparison results
  compareProducts: async (productTitle: string): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/compare/${encodeURIComponent(productTitle)}`);
    return response.data;
  },

  // Track a new product
  trackProduct: async (trackingRequest: TrackingRequest): Promise<void> => {
    await axios.post(`${API_BASE_URL}/products/track`, trackingRequest);
  },

  // Manually scrape a product
  scrapeProduct: async (url: string): Promise<Product> => {
    const response = await axios.post(`${API_BASE_URL}/products/scrape`, { url });
    return response.data;
  },

  // Get tracked products
  getTrackedProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/tracked`);
    return response.data;
  },

  // Get product details
  getProductDetails: async (productId: string): Promise<Product> => {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return response.data;
  },

  // Get price history for a product
  getPriceHistory: async (productId: string): Promise<{ date: string; price: number }[]> => {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}/price-history`);
    return response.data;
  }
}; 