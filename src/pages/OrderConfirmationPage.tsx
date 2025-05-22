import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ClientNav } from '@/components/ClientNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useOrder, Order } from '@/contexts/OrderContext';
import { CheckCircle2, PackageCheck, Truck, FileText, ChevronRight } from 'lucide-react';
// Try to import date-fns directly
import { format as dateFormat } from 'date-fns';

// Create a safe wrapper function for date formatting
const format = (date: Date | string | number, formatStr: string): string => {
  try {
    return dateFormat(new Date(date), formatStr);
  } catch (e) {
    // Fallback if date-fns has an error
    return new Date(date).toLocaleDateString();
  }
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, isLoading } = useOrder();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const navigate = useNavigate();

  // Memoize the loadOrder function to prevent it from changing on every render
  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    
    setIsLoadingOrder(true);
    setError(null);
    
    try {
      console.log(`Loading order with ID: ${orderId}`);
      const foundOrder = await getOrderById(orderId);
      
      if (foundOrder) {
        console.log(`Order found: ${foundOrder.id}`);
        setOrder(foundOrder);
      } else {
        console.log(`Order not found: ${orderId}`);
        setError('Order not found');
        setTimeout(() => navigate('/client/orders'), 3000);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingOrder(false);
    }
  }, [orderId, navigate, getOrderById]);

  // Use the memoized function in useEffect
  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const formatOrderId = (id: string | number) => {
    if (!id) return 'Unknown';
    
    if (typeof id === 'string' && id.includes('_')) {
      const parts = id.split('_');
      return parts.length > 1 ? parts[1] : id;
    }
    return id.toString();
  };

  if (isLoadingOrder || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <main className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
            <p className="mb-6">{error}</p>
            <p className="mb-6 text-sm text-muted-foreground">You will be redirected to your orders page...</p>
            <Button asChild>
              <Link to="/client/orders">View All Orders</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <main className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="mb-6">We couldn't find the order you're looking for.</p>
            <Button asChild>
              <Link to="/client/orders">View All Orders</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  // Use optional chaining and nullish coalescing for safer access to order properties
  const orderDate = new Date(order?.createdAt || order?.created_at || new Date());
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(orderDate.getDate() + 7);

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received your purchase and will process it shortly.
            </p>
            <p className="mt-2 font-medium">
              Order #{formatOrderId(order?.id || '')} • Placed on {formatDate(order?.createdAt || order?.created_at || '')}
            </p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
              <div className="space-y-3">
                {(order?.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-md" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {(item.category || '').charAt(0) || 'P'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Payment Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-1">Payment Method</h3>
                  <p className="text-sm">
                    {order?.paymentMethod?.type === 'credit_card' ? 'Credit Card' : 'PayPal'}
                    {order?.paymentMethod?.lastFour && ` ending in ${order.paymentMethod.lastFour}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Billing Address</h3>
                  <p className="text-sm">{order?.shippingAddress?.fullName || 'N/A'}</p>
                  <p className="text-sm">{order?.shippingAddress?.streetAddress || 'N/A'}</p>
                  <p className="text-sm">
                    {order?.shippingAddress?.city || 'N/A'}, {order?.shippingAddress?.state || ''} {order?.shippingAddress?.postalCode || ''}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
              <div className="md:flex justify-between gap-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-sm font-medium mb-1">Shipping Address</h3>
                  <p className="text-sm">{order?.shippingAddress?.fullName || 'N/A'}</p>
                  <p className="text-sm">{order?.shippingAddress?.streetAddress || 'N/A'}</p>
                  <p className="text-sm">
                    {order?.shippingAddress?.city || 'N/A'}, {order?.shippingAddress?.state || ''} {order?.shippingAddress?.postalCode || ''}
                  </p>
                  <p className="text-sm">{order?.shippingAddress?.country || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Estimated Delivery</h3>
                  <p className="text-sm">{formatDate(estimatedDelivery.toISOString())}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Order Total</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(order?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${(order?.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${(order?.tax || 0).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(order?.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between">
            <Button asChild variant="outline">
              <Link to="/client/orders">
                <FileText className="h-4 w-4 mr-2" />
                View All Orders
              </Link>
            </Button>
            <Button asChild>
              <Link to="/client/products">
                Continue Shopping
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 bg-muted p-4 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Shipping Updates</h3>
                <p className="text-sm text-muted-foreground">
                  We'll send shipping updates to {order?.shippingAddress?.fullName || 'you'} at the email associated with your account.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default OrderConfirmationPage; 