import { Card } from "@/components/ui/card";
import { BarChart, Users, Package, DollarSign } from "lucide-react";
import { AdminNav } from "@/components/AdminNav";
import { useOrders } from "@/contexts/OrdersContext";
import { useProducts } from "@/contexts/ProductsContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const AdminHome = () => {
  const { orders, stats } = useOrders();
  const { products } = useProducts();

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'in-progress':
        return "bg-blue-100 text-blue-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <DollarSign className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">Total Sales</h2>
            <p className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</p>
          </Card>
          
          <Card className="dashboard-card">
            <Users className="w-8 h-8 text-secondary mb-4" />
            <h2 className="font-semibold mb-2">Total Users</h2>
            <p className="text-2xl font-bold">1</p>
          </Card>
          
          <Card className="dashboard-card">
            <Package className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-semibold mb-2">Products</h2>
            <p className="text-2xl font-bold">{products.length}</p>
          </Card>
          
          <Card className="dashboard-card">
            <BarChart className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">Orders Today</h2>
            <p className="text-2xl font-bold">
              {orders.filter(order => {
                const today = new Date().toISOString().split('T')[0];
                return order.createdAt.startsWith(today);
              }).length}
            </p>
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
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-4">{order.id}</td>
                        <td className="p-4">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">${order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No orders yet
                      </td>
                    </tr>
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