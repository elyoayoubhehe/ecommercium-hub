import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Interface for wishlist items
interface WishlistItem {
  id: string;
  product_id?: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
  added_at?: string; 
}

// Interface for the context value
interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => Promise<void>;
}

// Create the context
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// API URL
const API_URL = 'http://localhost:5000/api';

// Provider component
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, token } = useAuth();
  
  // Load wishlist when the component mounts or when auth state changes
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      
      try {
        if (isAuthenticated && token) {
          // Fetch wishlist from the API
          const response = await fetch(`${API_URL}/wishlist`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setItems(data);
          } else {
            // If API call fails, load from localStorage as fallback
            console.error('Failed to load wishlist from API, using localStorage fallback');
            const storedWishlist = localStorage.getItem('wishlist');
            if (storedWishlist) {
              setItems(JSON.parse(storedWishlist));
            }
          }
        } else {
          // If not authenticated, use localStorage
          const storedWishlist = localStorage.getItem('wishlist');
          if (storedWishlist) {
            setItems(JSON.parse(storedWishlist));
          }
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        // Load from localStorage as fallback
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          setItems(JSON.parse(storedWishlist));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlist();
  }, [isAuthenticated, token]);
  
  // Save wishlist to localStorage as a backup
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);
  
  const addToWishlist = async (item: WishlistItem) => {
    try {
      if (isAuthenticated && token) {
        // Add to wishlist via API
        const response = await fetch(`${API_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: item.id })
        });
        
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          toast.success(`${item.name} added to wishlist`);
        } else {
          throw new Error('Failed to add to wishlist');
        }
      } else {
        // If not authenticated, use localStorage
        if (!isInWishlist(item.id)) {
          setItems(prev => [...prev, item]);
          toast.success(`${item.name} added to wishlist`);
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      
      // Add to localStorage as fallback
      if (!isInWishlist(item.id)) {
        setItems(prev => [...prev, item]);
      }
    }
  };
  
  const removeFromWishlist = async (id: string) => {
    try {
      if (isAuthenticated && token) {
        // Remove from wishlist via API
        const response = await fetch(`${API_URL}/wishlist/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          toast.success('Item removed from wishlist');
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // If not authenticated, use localStorage
        setItems(prev => prev.filter(item => 
          item.id !== id && 
          (item.product_id?.toString() !== id) // Also check product_id
        ));
        toast.success('Item removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      
      // Remove from localStorage as fallback
      setItems(prev => prev.filter(item => 
        item.id !== id && 
        (item.product_id?.toString() !== id) // Also check product_id
      ));
    }
  };
  
  const isInWishlist = (id: string) => {
    return items.some(item => 
      item.id === id || 
      item.product_id?.toString() === id
    );
  };
  
  const clearWishlist = async () => {
    try {
      if (isAuthenticated && token) {
        // Clear wishlist via API
        const response = await fetch(`${API_URL}/wishlist`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setItems([]);
          toast.success('Wishlist cleared');
        } else {
          throw new Error('Failed to clear wishlist');
        }
      } else {
        // If not authenticated, use localStorage
        setItems([]);
        toast.success('Wishlist cleared');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
      
      // Clear localStorage as fallback
      setItems([]);
    }
  };
  
  return (
    <WishlistContext.Provider value={{ 
      items, 
      loading,
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist, 
      clearWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
