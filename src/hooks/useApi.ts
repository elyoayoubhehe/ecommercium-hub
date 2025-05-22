import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { standardizeProduct, standardizeCategory } from '@/utils/dataSync';

// Remove hardcoded API_URL and use relative URLs instead
// const API_URL = 'http://localhost:5000/api';

// Helper function to transform product data
function transformProductData(data: any, categories: any[] = []) {
  // Check if this is product data by looking for typical product fields
  if (Array.isArray(data) && data.length > 0 && 'category_id' in data[0]) {
    return data.map(product => standardizeProduct(product, categories));
  }
  
  // If not product data, return as is
  return data;
}

// Simple mapping function for categories (ideally this would fetch from API)
function getCategoryName(categoryId: number) {
  const categories: Record<number, string> = {
    1: 'Electronics',
    2: 'Clothing',
    3: 'Home & Kitchen',
    4: 'Books',
    5: 'Sports',
    6: 'Beauty'
  };
  return categories[categoryId] || 'Uncategorized';
}

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Helper to check token and create headers
const createAuthHeaders = (requiresAuth: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    headers['Authorization'] = `Bearer ${token}`;
    
    // Log for debugging
    console.log('Using auth token:', token.substring(0, 20) + '...');
  }
  
  return headers;
};

// Handle 401 Unauthorized errors
const handle401Error = () => {
  console.error('Authentication token expired or invalid');
  localStorage.removeItem('auth_token');
  
  // We can't directly use useAuth here since hooks can only be used in components
  // So we'll have to handle token clearing here and rely on the component to check auth state
  return new Error('Authentication token expired. Please log in again.');
};

// Standard API GET - doesn't require authentication
export function useApiGet<T>(endpoint: string, requiresAuth: boolean = false) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Get all categories for reference if needed
  useEffect(() => {
    if (endpoint.includes('/products')) {
      const fetchCategories = async () => {
        try {
          const response = await fetch(`/api/categories`);
          if (response.ok) {
            const result = await response.json();
            setCategories(result.map((cat: any) => standardizeCategory(cat)));
          }
        } catch (err) {
          console.error('Error fetching categories for product data:', err);
        }
      };
      
      fetchCategories();
    }
  }, [endpoint]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Set up headers
      const headers = createAuthHeaders(requiresAuth);
      
      // Make the request - use relative URL
      const response = await fetch(`${endpoint.startsWith('/api') ? '' : '/api'}${endpoint}`, { 
        headers 
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Transform data to standard format based on endpoint
      let transformedData;
      
      if (endpoint.includes('/products')) {
        transformedData = transformProductData(result, categories);
      } else if (endpoint.includes('/categories') && Array.isArray(result)) {
        transformedData = result.map((cat: any) => standardizeCategory(cat));
      } else {
        transformedData = result;
      }
        
      setData(transformedData as T);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, requiresAuth]);

  return { data, loading, error, refetch: fetchData };
}

// Authenticated API GET - always requires authentication
export function useAuthenticatedApiGet<T>(endpoint: string) {
  return useApiGet<T>(endpoint, true);
}

export async function apiPost<T>(endpoint: string, data: any, requiresAuth: boolean = false): Promise<T> {
  const headers = createAuthHeaders(requiresAuth);

  const response = await fetch(`${endpoint.startsWith('/api') ? '' : '/api'}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

// New function for PUT requests
export async function apiPut<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> {
  try {
    const headers = createAuthHeaders(requiresAuth);

    const response = await fetch(`${endpoint.startsWith('/api') ? '' : '/api'}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try to get the error message from the response
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
      
      // Handle token expiration
      if (response.status === 401) {
        throw handle401Error();
      }
      
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API put error:', error);
    throw error;
  }
}

// New function for DELETE requests
export async function apiDelete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
  try {
    const headers = createAuthHeaders(requiresAuth);

    const response = await fetch(`${endpoint.startsWith('/api') ? '' : '/api'}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      // Try to get the error message from the response
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
      
      // Handle token expiration
      if (response.status === 401) {
        throw handle401Error();
      }
      
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API delete error:', error);
    throw error;
  }
}

export default { useApiGet, useAuthenticatedApiGet, apiPost, apiPut, apiDelete }; 