import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProducts } from './ProductsContext';

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  customerName?: string; // For admin dashboard display
  shippingAddress?: string; // For order details
  paymentMethod?: string; // For order details
}

interface OrderStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
  salesByDate: Record<string, number>;
  salesByCategory: Record<string, number>;
}

interface OrdersContextType {
  orders: Order[];
  stats: OrderStats;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  getOrderById: (id: string) => Order | undefined;
  refreshStats: () => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
    salesByDate: {},
    salesByCategory: {}
  });
  
  const { products } = useProducts();

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    // Save orders to localStorage whenever they change
    localStorage.setItem('orders', JSON.stringify(orders));
    // Recalculate stats whenever orders change
    refreshStats();
  }, [orders]);

  const refreshStats = () => {
    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Count orders by status
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const inProgressOrders = orders.filter(order => order.status === 'in-progress').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    // Get recent orders (last 5)
    const recentOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
    
    // Calculate sales by date (last 7 days)
    const salesByDate: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(date => {
      salesByDate[date] = orders
        .filter(order => order.createdAt.startsWith(date))
        .reduce((sum, order) => sum + order.total, 0);
    });
    
    // Calculate sales by category
    const salesByCategory: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const categoryName = product.category;
          salesByCategory[categoryName] = (salesByCategory[categoryName] || 0) + (item.price * item.quantity);
        }
      });
    });
    
    setStats({
      totalSales,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      recentOrders,
      salesByDate,
      salesByCategory
    });
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    
    const newOrder: Order = {
      ...order,
      id: orderId,
      createdAt: now,
      updatedAt: now
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    return orderId;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, status, updatedAt: new Date().toISOString() } 
        : order
    ));
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  return (
    <OrdersContext.Provider 
      value={{ 
        orders, 
        stats,
        addOrder, 
        updateOrderStatus,
        getOrderById,
        refreshStats
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}; 