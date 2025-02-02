import { Card } from "@/components/ui/card";
import { BarChart, Users, Package, DollarSign } from "lucide-react";
import { AdminNav } from "@/components/AdminNav";

const AdminHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <DollarSign className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">Total Sales</h2>
            <p className="text-2xl font-bold">$12,345</p>
          </Card>
          
          <Card className="dashboard-card">
            <Users className="w-8 h-8 text-secondary mb-4" />
            <h2 className="font-semibold mb-2">Total Users</h2>
            <p className="text-2xl font-bold">1,234</p>
          </Card>
          
          <Card className="dashboard-card">
            <Package className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-semibold mb-2">Products</h2>
            <p className="text-2xl font-bold">567</p>
          </Card>
          
          <Card className="dashboard-card">
            <BarChart className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">Orders Today</h2>
            <p className="text-2xl font-bold">89</p>
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