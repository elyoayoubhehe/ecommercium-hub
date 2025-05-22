import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { apiPost, apiGet } from '@/hooks/useApi';

// Add the API base URL
const API_URL = 'http://localhost:5000/api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image_url?: string;
}

export interface Address {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string | number;
  userId: number | string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: {
    type: string;
    lastFour?: string;
    expiryDate?: string;
  };
  createdAt: string;
  updatedAt?: string;
  created_at?: string; // For API compatibility
  updated_at?: string; // For API compatibility
  shipping_address?: any; // For API compatibility
  payment_method?: any; // For API compatibility
  billing_address?: any; // For API compatibility
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

type OrderAction = 
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string | number; status: Order['status'] } }
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload,
        isLoading: false
      };
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        currentOrder: action.payload,
        isLoading: false
      };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.orderId 
            ? { ...order, status: action.payload.status } 
            : order
        ),
        isLoading: false
      };
    case 'SET_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};

// Helper function to standardize order data format
const standardizeOrder = (order: any): Order => {
  // Handle different property names from the API
  return {
    id: order.id,
    userId: order.user_id || order.userId,
    items: order.items || [],
    total: parseFloat(order.total_amount || order.total || 0),
    subtotal: parseFloat(order.subtotal || 0),
    tax: parseFloat(order.tax || 0), 
    shipping: parseFloat(order.shipping || 0),
    status: order.status,
    shippingAddress: order.shipping_address ? 
      (typeof order.shipping_address === 'string' ? 
        JSON.parse(order.shipping_address) : order.shipping_address) : 
      order.shippingAddress,
    billingAddress: order.billing_address ? 
      (typeof order.billing_address === 'string' ? 
        JSON.parse(order.billing_address) : order.billing_address) : 
      order.billingAddress,
    paymentMethod: order.payment_method ? 
      (typeof order.payment_method === 'string' ? 
        JSON.parse(order.payment_method) : order.payment_method) : 
      order.paymentMethod,
    createdAt: order.created_at || order.createdAt,
    updatedAt: order.updated_at || order.updatedAt,
    // Keep original properties for reference
    created_at: order.created_at,
    updated_at: order.updated_at,
    shipping_address: order.shipping_address,
    payment_method: order.payment_method,
    billing_address: order.billing_address
  };
};

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'userId'>) => Promise<Order>;
  fetchOrders: () => Promise<Order[]>;
  getOrderById: (orderId: string | number) => Promise<Order | undefined>;
  cancelOrder: (orderId: string | number) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { user, isAuthenticated, token } = useAuth();

  // Memoize fetchOrders to avoid infinite loops
  const fetchOrders = useCallback(async (): Promise<Order[]> => {
    if (!isAuthenticated || !user) {
      return [];
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch(`${API_URL}/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      const standardizedOrders = Array.isArray(data) ? data.map(standardizeOrder) : [];
      
      dispatch({ type: 'SET_ORDERS', payload: standardizedOrders });
      return standardizedOrders;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user, token]);

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders().catch(err => {
        console.error('Error loading orders:', err);
      });
    }
  }, [isAuthenticated, user, fetchOrders]);

  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'userId'>): Promise<Order> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be logged in to create an order');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Format data for API
      const apiOrderData = {
        items: orderData.items.map(item => ({
          id: parseInt(item.id.toString()), // Ensure this is a number
          quantity: item.quantity,
          price: item.price,
          updateStock: true
        })),
        total_amount: orderData.total, // Database uses total_amount
        total: orderData.total, // Some DB schemas use total directly
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        status: 'pending',
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress || orderData.shippingAddress // Use shipping as billing if not specified
      };
      
      // Add payment_method
      apiOrderData.payment_method = orderData.paymentMethod;
      
      console.log('API Order Data:', apiOrderData);
      
      // Validate order items before sending to API
      for (const item of apiOrderData.items) {
        if (typeof item.id !== 'number' || isNaN(item.id)) {
          throw new Error(`Invalid product ID: ${item.id}. Expected a number.`);
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error(`Invalid quantity: ${item.quantity} for product ID: ${item.id}`);
        }
        if (typeof item.price !== 'number' || item.price <= 0) {
          throw new Error(`Invalid price: ${item.price} for product ID: ${item.id}`);
        }
      }
      
      // Call API
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiOrderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      const newOrder = await response.json();
      const standardizedOrder = standardizeOrder(newOrder);
      
      dispatch({ type: 'ADD_ORDER', payload: standardizedOrder });
      toast.success('Order created successfully!');
      return standardizedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw err;
    }
  }, [isAuthenticated, user, token]);

  const getOrderById = useCallback(async (orderId: string | number): Promise<Order | undefined> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be logged in to view order details');
    }

    try {
      // First check if we already have this order in state
      const existingOrder = state.orders.find(order => order.id.toString() === orderId.toString());
      
      if (existingOrder) {
        dispatch({ type: 'SET_CURRENT_ORDER', payload: existingOrder });
        return existingOrder;
      }
      
      // Otherwise fetch from API
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          dispatch({ type: 'SET_ERROR', payload: 'Order not found' });
          return undefined;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order details');
      }
      
      const data = await response.json();
      const standardizedOrder = standardizeOrder(data);
      
      dispatch({ type: 'SET_CURRENT_ORDER', payload: standardizedOrder });
      return standardizedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order details';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user, token, state.orders]);

  const cancelOrder = useCallback(async (orderId: string | number): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be logged in to cancel an order');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }
      
      const updatedOrder = await response.json();
      
      dispatch({ 
        type: 'UPDATE_ORDER_STATUS', 
        payload: { orderId, status: 'cancelled' } 
      });
      
      toast.success('Order cancelled successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user, token]);

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        currentOrder: state.currentOrder,
        isLoading: state.isLoading,
        error: state.error,
        createOrder,
        fetchOrders,
        getOrderById,
        cancelOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 