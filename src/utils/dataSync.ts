import { QueryClient } from '@tanstack/react-query';
import { queryClient } from '@/App';

// This file contains utilities to synchronize data between the admin and client sides of the application

/**
 * Invalidates both admin and client queries for a specific data type
 * @param dataType - The type of data to invalidate (products, categories, etc.)
 */
export const invalidateSharedData = (dataType: string) => {
  // Invalidate all queries related to this data type
  queryClient.invalidateQueries({ queryKey: [dataType] });
  
  // Also invalidate any potentially related queries
  if (dataType === 'products') {
    // When products change, categories might need refreshing too
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  } else if (dataType === 'categories') {
    // When categories change, we may need to refresh products to update category names
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }
};

/**
 * Returns a standardized format for category data
 * For consistent display between admin and client sides
 */
export const standardizeCategory = (category: any) => {
  return {
    id: category.id,
    name: category.name,
    description: category.description || '',
    icon: category.icon || '',
    status: category.status || 'active',
  };
};

/**
 * Returns a standardized format for product data
 * For consistent display between admin and client sides
 */
export const standardizeProduct = (product: any, categories: any[] = []) => {
  // Find the category name if categories are provided
  const category = categories.find(c => c.id === product.category_id);
  
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    stock_quantity: product.stock_quantity || 0,
    category_id: product.category_id,
    category: category ? category.name : 'Uncategorized',
    image_url: product.image_url || '',
    status: product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock',
  };
}; 