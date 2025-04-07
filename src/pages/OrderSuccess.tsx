import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useOrders } from '@/contexts/OrdersContext';
import { format } from 'date-fns';
import { Order } from '@/contexts/OrdersContext';
import { Card } from '@/components/ui/card';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orders, getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);

  // Look up the order when the component mounts
  useEffect(() => {
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) {
      const foundOrder = getOrderById(lastOrderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [getOrderById]);

  // Redirect to home after 10 seconds if users stay on this page
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/client/products');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-primary w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          
          <Card className="bg-muted p-6 rounded-lg mb-8 text-left">
            <h3 className="font-semibold mb-4">Order Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-medium">{order?.id || "Processing..."}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {order ? format(new Date(order.createdAt), 'PPP') : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{order?.status || "Processing"}</span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="font-medium">{order?.items.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">${order?.total.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">{order?.paymentMethod || "Credit Card"}</span>
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/client/products" className="flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/client/orders">View My Orders</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
