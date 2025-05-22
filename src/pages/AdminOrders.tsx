import { AdminNav } from "@/components/AdminNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { useState, useEffect, useCallback } from "react";
import { Search, MoreVertical, Eye, Download, Filter, Package, DollarSign, TrendingUp, Users, Loader2 } from "lucide-react";
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
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { format as dateFormat } from 'date-fns';

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  product_id?: number;
  order_id?: number;
}

interface Order {
  id: string | number;
  date?: string;
  created_at?: string;
  updated_at?: string;
  customerName?: string;
  customerEmail?: string;
  user_id?: number;
  user?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  items: OrderItem[];
  shippingAddress?: string;
  shipping_address?: string | any;
  paymentMethod?: string;
  payment_method?: string | any;
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [dateRange, setDateRange] = useState("7days");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const { token, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    avgOrderValue: 0,
    ordersByStatus: { pending: 0, processing: 0, completed: 0, cancelled: 0, delivered: 0 },
    ordersByDate: [],
    totalOrders: 0
  });

  // Use a proper type-safe fallback
  const format = (date: Date | string | number, formatStr: string): string => {
    try {
      return dateFormat(new Date(date), formatStr);
    } catch (e) {
      // Fallback if date-fns has an error
      return new Date(date).toLocaleDateString();
    }
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching orders...');
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Unexpected response type:', contentType);
          console.log('Response preview:', await response.text().then(text => text.substring(0, 200) + '...'));
          throw new Error('Unexpected response format. Expected JSON.');
        }
        
        const data = await response.json();
        console.log('Raw orders data from API:', data);
        
        // Log a sample order if available to help debugging
        if (Array.isArray(data) && data.length > 0) {
          console.log('Sample order data:', data[0]);
          
          // Check for the specific fields we need
          const hasRequiredFields = data.every(order => 
            (order.total_amount !== undefined || order.total !== undefined) && 
            order.id !== undefined
          );
          
          if (!hasRequiredFields) {
            console.warn('Some orders are missing required fields (total_amount/total or id)');
          }
        }
        
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
        toast.error('Failed to load orders. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, token]);

  // Process orders for display
  const processedOrders = orders.map(order => {
    try {
      // Format order data for display
      // Handle potential null/undefined values safely
      let customerName = 'Unknown';
      if (order.user) {
        const firstName = order.user.first_name || '';
        const lastName = order.user.last_name || '';
        customerName = `${firstName} ${lastName}`.trim() || 'Unknown';
      }
      
      // Safely parse shipping_address and payment_method
      let shippingAddress = {};
      if (order.shipping_address) {
        try {
          shippingAddress = typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address;
        } catch (e) {
          console.warn('Failed to parse shipping address:', e);
        }
      }
      
      let paymentMethod = {};
      if (order.payment_method) {
        try {
          paymentMethod = typeof order.payment_method === 'string' 
            ? JSON.parse(order.payment_method) 
            : order.payment_method;
        } catch (e) {
          console.warn('Failed to parse payment method:', e);
        }
      }
      
      // Ensure order has an items array
      const items = Array.isArray(order.items) ? order.items : [];
      
      // Debug log for order financial data
      console.log('Raw order financial data:', {
        id: order.id,
        total: order.total,
        total_amount: order.total_amount,
      });
      
      // Handle multiple ways the total might be stored in the API response
      // Priority: total_amount (from database) > total (frontend standardized) > calculate from items
      let totalAmount = 0;
      
      // First check for total_amount which is the database column
      if (order.total_amount !== undefined && order.total_amount !== null) {
        totalAmount = typeof order.total_amount === 'number' ? 
                     order.total_amount : 
                     parseFloat(String(order.total_amount));
        console.log(`Using total_amount field for order ${order.id}: ${totalAmount}`);
      } 
      // Then check for total field which might be set by the frontend
      else if (order.total !== undefined && order.total !== null) {
        totalAmount = typeof order.total === 'number' ? 
                     order.total : 
                     parseFloat(String(order.total));
        console.log(`Using total field for order ${order.id}: ${totalAmount}`);
      }
      
      // If we still have 0 or NaN, try to calculate from order items
      if (isNaN(totalAmount) || totalAmount === 0) {
        if (Array.isArray(items) && items.length > 0) {
          totalAmount = items.reduce((sum, item) => {
            const itemPrice = parseFloat(String(item.price || 0));
            const itemQuantity = parseInt(String(item.quantity || 1));
            return sum + (itemPrice * itemQuantity);
          }, 0);
          console.log(`Calculated total from items for order ${order.id}: ${totalAmount}`);
        }
      }
      
      if (totalAmount === 0) {
        console.warn(`Order ${order.id} has zero total amount after all calculation attempts`);
      }
      
      return {
        ...order,
        customerName,
        customerEmail: order.user?.email || 'Unknown',
        date: order.created_at || new Date().toISOString(),
        shippingAddress,
        paymentMethod,
        items,
        // Ensure numeric fields are valid numbers, prioritizing the most reliable source
        total: totalAmount,
        subtotal: parseFloat(String(order.subtotal || 0)),
        tax: parseFloat(String(order.tax || 0)),
        shipping: parseFloat(String(order.shipping || 0))
      };
    } catch (error) {
      console.error('Error processing order:', error, order);
      // Return a minimal valid order object in case of error
      return {
        ...order,
        id: order.id || 'unknown',
        customerName: 'Error processing order',
        customerEmail: 'error',
        date: new Date().toISOString(),
        status: order.status || 'pending',
        total: 0,
        items: []
      };
    }
  });

  const filteredOrders = processedOrders.filter(order => 
    (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate total sales with better error handling and logging
  const totalSales = processedOrders.reduce((sum, order) => {
    try {
      const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total || 0));
      console.log(`Adding to total sales: order ${order.id} with total ${orderTotal}`);
      return sum + (isNaN(orderTotal) ? 0 : orderTotal);
    } catch (err) {
      console.error('Error calculating order total:', err);
      return sum;
    }
  }, 0);
  
  console.log(`Final total sales calculated: ${totalSales}`);
  
  const totalOrders = processedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const pendingOrders = processedOrders.filter(order => order.status === "pending").length;

  // Generate sales data for chart
  const salesData = processedOrders
    .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
    .reduce((acc: any[], order) => {
      try {
        const date = format(new Date(order.created_at || new Date()), 'yyyy-MM-dd');
        const existingDate = acc.find(item => item.date === date);
        
        // Ensure we have a valid numeric value for the order total
        const orderTotal = typeof order.total === 'number' ? order.total : 
                           parseFloat(String(order.total || 0));
        
        if (existingDate) {
          existingDate.sales += isNaN(orderTotal) ? 0 : orderTotal;
        } else {
          acc.push({ date, sales: isNaN(orderTotal) ? 0 : orderTotal });
        }
        
        console.log(`Added to chart data: date=${date}, sales=${isNaN(orderTotal) ? 0 : orderTotal}`);
      } catch (error) {
        console.error('Error processing order for chart:', error);
      }
      
      return acc;
    }, []);

  // Generate category data for chart
  const categoryData = processedOrders.reduce((acc: any[], order) => {
    try {
      // Group items by category
      (order.items || []).forEach(item => {
        // Get category name, defaulting to 'Uncategorized' if not available
        const category = item.category_name || 'Uncategorized';
        const existingCategory = acc.find(c => c.category === category);
        
        // Ensure we have valid numeric values for price and quantity
        const itemPrice = typeof item.price === 'number' ? item.price : 
                         parseFloat(String(item.price || 0));
        const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 
                            parseInt(String(item.quantity || 1));
        
        // Calculate the total for this item
        const itemTotal = isNaN(itemPrice) || isNaN(itemQuantity) ? 0 : itemPrice * itemQuantity;
        
        if (existingCategory) {
          existingCategory.sales += itemTotal;
        } else {
          acc.push({ category, sales: itemTotal });
        }
        
        console.log(`Added to category data: category=${category}, sales=${itemTotal}`);
      });
    } catch (error) {
      console.error('Error processing category data for chart:', error);
    }
    
    return acc;
  }, [])
  .sort((a, b) => b.sales - a.sales)
  .slice(0, 5); // Top 5 categories

  const exportToCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Email", "Status", "Total", "Items"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.id,
        format(new Date(order.created_at || new Date()), 'yyyy-MM-dd'),
        order.customerName,
        order.customerEmail,
        order.status,
        parseFloat(order.total.toString()).toFixed(2),
        order.items?.length || 0
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

  const handleUpdateOrderStatus = async (orderId: string | number, status: Order['status']) => {
    if (!isAuthenticated || !token) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      // If we're viewing this order, update it
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
      
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
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

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    
    try {
      const addr = typeof address === 'string' ? JSON.parse(address) : address;
      return `${addr.fullName || ''}, ${addr.streetAddress || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}, ${addr.country || ''}`;
    } catch (e) {
      return 'Invalid address format';
    }
  };

  const formatPaymentMethod = (method: any) => {
    if (!method) return 'N/A';
    
    try {
      const payment = typeof method === 'string' ? JSON.parse(method) : method;
      return `${payment.type || 'Unknown'} ${payment.lastFour ? `(•••• ${payment.lastFour})` : ''}`;
    } catch (e) {
      return 'Invalid payment format';
    }
  };

  // Calculate analytics based on orders
  const calculateAnalytics = useCallback(() => {
    if (!processedOrders.length) return;

    try {
      // Log details for debugging
      console.log('Calculating analytics with all processed orders:', 
        processedOrders.map(order => ({
          id: order.id,
          status: order.status,
          total: order.total,
          created_at: order.created_at
        }))
      );
      
      // Include all orders for financial calculations instead of just completed ones
      const ordersForFinancials = processedOrders;
      
      console.log(`Using ${ordersForFinancials.length} orders for financial calculations`);
      
      // Calculate total sales - sum of all completed order totals
      const totalSales = ordersForFinancials.reduce((sum, order) => {
        const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total || 0));
        console.log(`Adding order ${order.id} total: ${orderTotal} to sum: ${sum}`);
        return sum + (isNaN(orderTotal) ? 0 : orderTotal);
      }, 0);
      
      console.log(`Total sales calculated: $${totalSales.toFixed(2)}`);
      
      // Calculate average order value
      const avgOrderValue = ordersForFinancials.length 
        ? totalSales / ordersForFinancials.length 
        : 0;
        
      console.log(`Average order value: $${avgOrderValue.toFixed(2)}`);
      
      // Calculate orders by status
      const ordersByStatus = {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        delivered: 0
      };
      
      processedOrders.forEach(order => {
        const status = order.status || 'pending';
        if (ordersByStatus.hasOwnProperty(status)) {
          ordersByStatus[status]++;
        } else {
          ordersByStatus.pending++;
        }
      });
      
      // Calculate orders by date
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const ordersByDate = last7Days.map(date => {
        const count = processedOrders.filter(order => {
          const orderDate = new Date(order.date).toISOString().split('T')[0];
          return orderDate === date;
        }).length;
        
        return { date, count };
      });
      
      setAnalytics({
        totalSales,
        avgOrderValue,
        ordersByStatus,
        ordersByDate,
        totalOrders: processedOrders.length
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
      setAnalytics({
        totalSales: 0,
        avgOrderValue: 0,
        ordersByStatus: { pending: 0, processing: 0, completed: 0, cancelled: 0, delivered: 0 },
        ordersByDate: [],
        totalOrders: 0
      });
    }
  }, [processedOrders]);

  // Use effect to calculate analytics when orders change
  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + outerRadius;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: $${Number(value).toFixed(2)}`}
      </text>
    );
  };

  // Calculate financial metrics for the pie chart
  const calculateFinancialBreakdown = useCallback(() => {
    if (!processedOrders.length) return [];

    // Calculate total revenue
    const totalSales = analytics.totalSales || 0;
    
    // Estimate the breakdown based on typical e-commerce metrics
    // These percentages can be adjusted based on your actual business model
    const costOfGoods = totalSales * 0.45; // 45% of revenue goes to cost of goods
    const shippingCosts = totalSales * 0.12; // 12% for shipping
    const paymentFees = totalSales * 0.04; // 4% for payment processing fees
    const netProfit = totalSales - costOfGoods - shippingCosts - paymentFees; // Remaining is profit

    return [
      { name: 'Net Profit', value: netProfit, fill: '#0f172a' }, // dark blue/black
      { name: 'Cost', value: costOfGoods, fill: '#7dd3fc' },     // light blue
      { name: 'Shipping', value: shippingCosts, fill: '#0ea5e9' }, // medium blue
      { name: 'Payment Fees', value: paymentFees, fill: '#0369a1' }  // darker blue
    ];
  }, [analytics.totalSales, processedOrders.length]);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <DollarSign className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
            <p className="text-2xl font-bold">${analytics.totalSales.toFixed(2)}</p>
          </Card>
          
          <Card className="p-6">
            <Package className="w-8 h-8 text-secondary mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
            <p className="text-2xl font-bold">{analytics.totalOrders}</p>
          </Card>
          
          <Card className="p-6">
            <TrendingUp className="w-8 h-8 text-accent mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Average Order Value</h3>
            <p className="text-2xl font-bold">${analytics.avgOrderValue.toFixed(2)}</p>
          </Card>
          
          <Card className="p-6">
            <Package className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground">Pending Orders</h3>
            <p className="text-2xl font-bold">{analytics.ordersByStatus.pending}</p>
          </Card>
        </div>

        {/* Financial Breakdown and Orders Over Time Charts */}
        {orders.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={calculateFinancialBreakdown()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {calculateFinancialBreakdown().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Legend 
                      formatter={(value, entry, index) => {
                        const { payload } = entry;
                        return `${value}: $${Number(payload.value).toFixed(2)}`;
                      }}
                    />
                    {/* Center text with total sales */}
                    <text x="50%" y="50%" dy={8} textAnchor="middle" fill="#333" fontSize="14px" fontWeight="bold">
                      Total Sales
                    </text>
                    <text x="50%" y="50%" dy={25} textAnchor="middle" fill="#333" fontSize="16px" fontWeight="bold">
                      ${analytics.totalSales.toFixed(2)}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.ordersByDate}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* If no orders, show empty state */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-10">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No orders yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Orders will appear here once customers start placing them.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading orders...</span>
          </div>
        )}

        {/* Orders Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
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
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                      <TableCell>
                        {format(new Date(order.created_at || order.date || new Date()), 'MMM dd, yyyy')}
                      </TableCell>
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
                      <TableCell>${parseFloat(order.total.toString()).toFixed(2)}</TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-blue-600"
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              disabled={order.status === 'processing' || order.status === 'cancelled'}
                            >
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-indigo-600"
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                              disabled={order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              disabled={order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              disabled={order.status === 'cancelled' || order.status === 'delivered'}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
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
                      <p>#{selectedOrder.id.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p>{format(new Date(selectedOrder.created_at || selectedOrder.date || new Date()), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p>${parseFloat(selectedOrder.total.toString()).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-muted-foreground">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="text-sm text-muted-foreground">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="text-sm text-muted-foreground">Shipping Address:</span> {formatAddress(selectedOrder.shipping_address || selectedOrder.shippingAddress)}</p>
                    <p><span className="text-sm text-muted-foreground">Payment Method:</span> {formatPaymentMethod(selectedOrder.payment_method || selectedOrder.paymentMethod)}</p>
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
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name || 'Unknown Product'}</TableCell>
                            <TableCell>{item.quantity || 0}</TableCell>
                            <TableCell>${parseFloat((item.price || 0).toString()).toFixed(2)}</TableCell>
                            <TableCell>${((item.quantity || 0) * parseFloat((item.price || 0).toString())).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No items found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsViewingDetails(false)}>
                    Close
                  </Button>
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'cancelled');
                        setIsViewingDetails(false);
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {selectedOrder.status === 'pending' && (
                    <Button 
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'processing');
                        setIsViewingDetails(false);
                      }}
                    >
                      Process Order
                    </Button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button 
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'shipped');
                        setIsViewingDetails(false);
                      }}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button 
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'delivered');
                        setIsViewingDetails(false);
                      }}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
