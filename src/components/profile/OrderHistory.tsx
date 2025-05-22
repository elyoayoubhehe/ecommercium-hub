import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Package, ChevronDown, ChevronUp, Star } from "lucide-react";

interface Order {
  id: string;
  date: Date;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  tracking?: string;
}

// Mock data - replace with real data from your API
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: new Date(),
    status: "delivered",
    total: 129.99,
    tracking: "1Z999AA1234567890",
    items: [
      {
        id: "1",
        name: "Wireless Headphones",
        quantity: 1,
        price: 99.99,
        image: "/placeholder.svg"
      },
      {
        id: "2",
        name: "Phone Case",
        quantity: 2,
        price: 15.00,
        image: "/placeholder.svg"
      }
    ]
  },
  {
    id: "ORD-002",
    date: new Date(Date.now() - 86400000), // Yesterday
    status: "processing",
    total: 199.99,
    items: [
      {
        id: "3",
        name: "Smart Watch",
        quantity: 1,
        price: 199.99,
        image: "/placeholder.svg"
      }
    ]
  },
  {
    id: "ORD-003",
    date: new Date(Date.now() - 172800000), // 2 days ago
    status: "processing",
    total: 49.99,
    items: [
      {
        id: "4",
        name: "Bluetooth Speaker",
        quantity: 1,
        price: 49.99,
        image: "/placeholder.svg"
      }
    ]
  }
];

const statusColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500"
};

export function OrderHistory() {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold">Order #{order.id}</p>
          <p className="text-sm text-muted-foreground">
            {format(order.date, "MMM d, yyyy")}
          </p>
        </div>
        <Badge className={statusColors[order.status]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleOrder(order.id)}
        >
          {expandedOrders.includes(order.id) ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {expandedOrders.includes(order.id) && (
        <div className="mt-4 space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              {order.status === "delivered" && (
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Review
                </Button>
              )}
            </div>
          ))}

          {order.tracking && (
            <div className="mt-4 p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                <span>Tracking Number:</span>
                <code className="px-2 py-1 bg-background rounded">
                  {order.tracking}
                </code>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">Download Invoice</Button>
            <Button variant="outline" size="sm">Contact Support</Button>
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No orders found</h3>
              <p className="text-muted-foreground">
                {activeTab === "all" 
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${activeTab} orders.`}
              </p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
