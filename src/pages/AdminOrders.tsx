import { AdminNav } from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Search, MoreVertical, Eye, Download, Filter, Package, DollarSign, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
  paymentMethod: string;
}

// Mock data - replace with real data later
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2024-02-22",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    status: "delivered",
    total: 299.99,
    items: [
      { id: "1", name: "Product 1", quantity: 2, price: 99.99 },
      { id: "2", name: "Product 2", quantity: 1, price: 100.01 }
    ],
    shippingAddress: "123 Main St, City, Country",
    paymentMethod: "Credit Card"
  },
  {
    id: "ORD-002",
    date: "2024-02-21",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    status: "processing",
    total: 199.99,
    items: [
      { id: "3", name: "Product 3", quantity: 1, price: 199.99 }
    ],
    shippingAddress: "456 Oak St, City, Country",
    paymentMethod: "PayPal"
  }
];

// Mock analytics data
const mockSalesData = [
  { date: '2024-02-16', sales: 1200 },
  { date: '2024-02-17', sales: 1900 },
  { date: '2024-02-18', sales: 1600 },
  { date: '2024-02-19', sales: 2100 },
  { date: '2024-02-20', sales: 1800 },
  { date: '2024-02-21', sales: 2300 },
  { date: '2024-02-22', sales: 2500 }
];

const mockCategoryData = [
  { category: 'Electronics', sales: 12500 },
  { category: 'Clothing', sales: 9800 },
  { category: 'Books', sales: 5600 },
  { category: 'Home', sales: 7900 },
  { category: 'Sports', sales: 4500 }
];

export const ordersState = {
  orders: mockOrders,
  setOrders: null as any
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [dateRange, setDateRange] = useState("7days");

  // Use React Query to manage orders state
  const { data: orders = mockOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => Promise.resolve(mockOrders)
  });

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalSales / totalOrders;
  const pendingOrders = orders.filter(order => order.status === "pending").length;

  const exportToCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Email", "Status", "Total", "Items", "Shipping Address", "Payment Method"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.id,
        order.date,
        order.customerName,
        order.customerEmail,
        order.status,
        order.total,
        order.items.length,
        order.shippingAddress,
        order.paymentMethod
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to CSV");
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                className="pl-10 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <DollarSign className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </Card>
          
          <Card className="p-6">
            <Package className="w-8 h-8 text-secondary mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </Card>
          
          <Card className="p-6">
            <TrendingUp className="w-8 h-8 text-accent mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Average Order Value</h3>
            <p className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</p>
          </Card>
          
          <Card className="p-6">
            <Package className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Pending Orders</h3>
            <p className="text-2xl font-bold">{pendingOrders}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="flex items-center gap-2"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewingDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p>{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p>{new Date(selectedOrder.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p>${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-muted-foreground">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="text-sm text-muted-foreground">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="text-sm text-muted-foreground">Shipping Address:</span> {selectedOrder.shippingAddress}</p>
                    <p><span className="text-sm text-muted-foreground">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
