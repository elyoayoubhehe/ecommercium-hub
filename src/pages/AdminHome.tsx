import { Card } from "@/components/ui/card";
import { BarChart, Users, Package, DollarSign, Loader2 } from "lucide-react";
import { AdminNav } from "@/components/AdminNav";
import { useApiGet, useAuthenticatedApiGet } from "@/hooks/useApi";
import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  total?: number;
  created_at: string;
  user_id: number;
  user?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

const AdminHome = () => {
  const [useApiData, setUseApiData] = useState(true);
  const [ordersToday, setOrdersToday] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  // Fetch users and products from API
  const { data: users, loading: loadingUsers, error: usersError } = useAuthenticatedApiGet<User[]>('/users');
  const { data: products, loading: loadingProducts, error: productsError } = useApiGet<Product[]>('/products');
  const { data: orders, loading: loadingOrders, error: ordersError } = useAuthenticatedApiGet<Order[]>('/orders');

  const loading = loadingUsers || loadingProducts || loadingOrders;
  const error = usersError || productsError || ordersError;

  // Calculate dashboard numbers
  const userCount = useApiData && users ? users.length : 1234;
  const productCount = useApiData && products ? products.length : 567;
  
  // Calculate real order data
  useEffect(() => {
    if (!useApiData || !orders || orders.length === 0) {
      // Use mock data if API data is not available
      setTotalSales(12345);
      setOrdersToday(89);
      return;
    }
    
    try {
      // Calculate total sales
      const calculatedTotalSales = orders.reduce((sum, order) => {
        // Try to use total_amount field first, then fall back to total
        const orderTotal = typeof order.total_amount === 'number' ? order.total_amount :
                          typeof order.total === 'number' ? order.total :
                          parseFloat(String(order.total_amount || order.total || 0));
        
        return sum + (isNaN(orderTotal) ? 0 : orderTotal);
      }, 0);
      
      // Count orders created today
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => {
        const orderDate = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '';
        return orderDate === today;
      });
      
      setTotalSales(calculatedTotalSales);
      setOrdersToday(todayOrders.length);
      
      console.log(`Calculated total sales: $${calculatedTotalSales.toFixed(2)}`);
      console.log(`Orders today: ${todayOrders.length}`);
    } catch (error) {
      console.error("Error calculating sales data:", error);
      // Fall back to mock data on error
      setTotalSales(12345);
      setOrdersToday(89);
    }
  }, [orders, useApiData]);

  // Get recent orders for display
  const recentOrders = useApiData && orders 
    ? orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4)
    : [];

  // Helper to format order status for display
  const formatOrderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Processing';
    }
  };

  // Helper to format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={useApiData} 
                onChange={() => setUseApiData(!useApiData)}
                className="accent-primary h-4 w-4" 
              />
              Use API Data
            </label>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
            <h3 className="font-bold">API Error</h3>
            <p>{error.message}</p>
            <p className="text-sm">Showing mock data as fallback.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <DollarSign className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">Total Sales</h2>
            <p className="text-2xl font-bold">${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </Card>
          
          <Card className="dashboard-card">
            <Users className="w-8 h-8 text-secondary mb-4" />
            <h2 className="font-semibold mb-2">Total Users</h2>
            <p className="text-2xl font-bold">{userCount.toLocaleString()}</p>
          </Card>
          
          <Card className="dashboard-card">
            <Package className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-semibold mb-2">Products</h2>
            <p className="text-2xl font-bold">{productCount.toLocaleString()}</p>
          </Card>
          
          <Card className="dashboard-card">
            <BarChart className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">Orders Today</h2>
            <p className="text-2xl font-bold">{ordersToday}</p>
          </Card>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Recent Orders</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left">Order ID</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {useApiData && recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-4">#{order.id}</td>
                        <td className="p-4">
                          {order.user ? 
                            `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || order.user.email : 
                            `User ${order.user_id}`}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {formatOrderStatus(order.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          ${Number(order.total_amount || order.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    [1, 2, 3, 4].map((item) => (
                      <tr key={item} className="border-t">
                        <td className="p-4">#ORDER-{item}234</td>
                        <td className="p-4">Customer {item}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            Delivered
                          </span>
                        </td>
                        <td className="p-4">${item}99.99</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AdminHome;