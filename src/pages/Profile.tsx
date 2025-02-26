import { ClientNav } from "@/components/ClientNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Package2, Package, MapPin, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { OrderHistory } from "@/components/profile/OrderHistory";

interface OrderType {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

// Mock data - replace with real data from your backend
const mockOrders: OrderType[] = [
  {
    id: "ORD-001",
    date: "2024-02-20",
    status: "Delivered",
    total: 129.99,
    items: 3
  },
  {
    id: "ORD-002",
    date: "2024-02-15",
    status: "In Transit",
    total: 79.99,
    items: 2
  }
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information Section */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <User className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <p className="text-muted-foreground">Your personal details</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <p className="text-lg font-medium">John Doe</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-lg font-medium">john.doe@example.com</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="text-lg font-medium">+1 234 567 890</p>
              </div>
              <Button className="w-full mt-4">Edit Profile</Button>
            </div>
          </Card>

          {/* Order History Section */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Order History</h2>
                <p className="text-muted-foreground">View your past orders</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package2 className="w-5 h-5 text-primary" />
                      <span className="font-medium">{order.id}</span>
                    </div>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Date</p>
                      <p className="font-medium text-foreground">{order.date}</p>
                    </div>
                    <div>
                      <p>Items</p>
                      <p className="font-medium text-foreground">{order.items} items</p>
                    </div>
                    <div>
                      <p>Total</p>
                      <p className="font-medium text-foreground">${order.total}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">View Order Details</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid grid-cols-2 gap-4 bg-transparent h-auto p-0">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 h-auto p-4"
              >
                <User className="h-4 w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 h-auto p-4"
              >
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <PersonalInfo />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <OrderHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
