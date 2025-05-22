import { Card } from "@/components/ui/card";
import { BarChart, Users, Package, DollarSign, Loader2 } from "lucide-react";
import { AdminNav } from "@/components/AdminNav";
import { useApiGet, useAuthenticatedApiGet } from "@/hooks/useApi";
import { useState } from "react";

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

const AdminHome = () => {
  const [useApiData, setUseApiData] = useState(true);

  // Fetch users and products from API
  const { data: users, loading: loadingUsers, error: usersError } = useAuthenticatedApiGet<User[]>('/users');
  const { data: products, loading: loadingProducts, error: productsError } = useApiGet<Product[]>('/products');

  const loading = loadingUsers || loadingProducts;
  const error = usersError || productsError;

  // Calculate dashboard numbers
  const userCount = useApiData && users ? users.length : 1234;
  const productCount = useApiData && products ? products.length : 567;
  
  // Mock data for sales and orders as these aren't implemented yet
  const totalSales = 12345;
  const ordersToday = 89;

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
            <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
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
                  {[1, 2, 3, 4].map((item) => (
                    <tr key={item} className="border-t">
                      <td className="p-4">#ORDER-{item}234</td>
                      <td className="p-4">Customer {item}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          Delivered
                        </span>
                      </td>
                      <td className="p-4">${item}99.99</td>
                    </tr>
                  ))}
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